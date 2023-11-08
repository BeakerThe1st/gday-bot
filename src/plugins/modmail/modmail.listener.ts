import {useClient, useError, useEvent} from "../../hooks";
import {
    ActionRow,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle, Channel,
    ChannelType, Colors, DMChannel, EmbedBuilder,
    Events, GuildChannel, inlineCode,
    Interaction,
    Message,
} from "discord.js";
import {MailThread} from "./MailThread";
import {GUILDS} from "../../globals";
import {ModmailMessage} from "./ModmailMessage";

export const forwardModmailMessage = async (message: Message) => {
    const thread = await MailThread.findOne({author: message.author.id});
    if (!thread) {
        const actionRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel("Create thread")
                .setEmoji("✅")
                .setStyle(ButtonStyle.Success)
                .setCustomId(`modmail-create-${message.author.id}`)
        )
        const embed = new EmbedBuilder()
            .setTitle("# G'day from the r/Apple mod team!")
            .setColor(Colors.Aqua)
            .setDescription("Thanks for getting in touch!\n\n **Just a quick heads up, this is not for tech support.** If you are after help with a tech issue, pop a message in https://discord.com/channels/332309672486895637/332310122904944652 and wait patiently for a reply.\n If your message is about a server-related issue, click the create thread button below and we'll be in touch shortly!");
        await message.reply({
            embeds: [embed],
            //@ts-ignore
            components: [actionRow]
        });
        return;
    }
    try {
        const mailChannel = await useClient().client.channels.fetch(thread.channel);
        if (!mailChannel?.isTextBased()) throw new Error();
        const modmailMessage = new ModmailMessage({
            from: message.author.username,
            to: "r/Apple Mod Team",
            body: message.cleanContent,
            attachments: message.attachments.map((value => value.url)),
        }).addStaffFields();
        await mailChannel.send({embeds: [modmailMessage]});
        await message.react("✅");
    } catch (error: any) {
        await message.react("⛔");
        await message.reply(`There was an error sending this message. Please try again!`);
    }
}
useEvent(Events.MessageCreate, async (message: Message) => {
    if (message.channel.type !== ChannelType.DM) {
        return;
    }
    if (message.author.bot) {
        return;
    }
    await forwardModmailMessage(message);
});

useEvent(Events.InteractionCreate, async (interaction: Interaction) => {
    if (!interaction.isButton()) {
        return;
    }
    const [c1, c2, c3] = interaction.customId.split("-");
    if (c1 !== "modmail" || c2 !== "create") {
        return;
    }
    let thread = await MailThread.findOne({author: c3});
    if (thread) {
        await interaction.reply({content: `You already have an open thread, simply send your message in this channel and it'll go straight to the mod team!`, ephemeral: true});
        return;
    }
    const initialMessage = await interaction.message.fetchReference();
    await MailThread.create({author: c3, initialMessage: initialMessage.id});
    await interaction.reply({content: `Thread created!`, ephemeral: true})
});

useEvent(Events.ChannelDelete, async (channel: GuildChannel | DMChannel) => {
    if (!("guildId" in channel && channel.guildId === GUILDS.STAFF)) {
        return;
    }
    MailThread.findOneAndDelete({channel: channel.id});
});