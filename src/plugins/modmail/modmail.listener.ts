import { useClient, useEvent } from "../../hooks";
import {
    ButtonStyle,
    Channel,
    ChannelType,
    Colors,
    EmbedBuilder,
    Events,
    Message,
    userMention,
} from "discord.js";
import { MailThread } from "./MailThread";
import { CHANNELS, GUILDS } from "../../globals";
import { ModmailMessage } from "./ModmailMessage";
import { RAppleUser } from "../rApple/RAppleUser.model";
import { GdayButtonBuilder } from "../../builders/GdayButtonBuilder";
import { useButton } from "../../hooks/useButton";

export const forwardModmailMessage = async (message: Message) => {
    const thread = await MailThread.findOne({ author: message.author.id });
    if (!thread) {
        const rAppleUser = await RAppleUser.findOne({
            userId: message.author.id,
        });
        if (rAppleUser?.modmailBlocklisted) {
            await message.reply(
                "You have been blocked from creating new modmail threads.",
            );
            return;
        }
        const embed = new EmbedBuilder()
            .setTitle("G'day from the r/Apple mod team!")
            .setColor(Colors.Aqua)
            .setDescription(
                "Thanks for getting in touch!\n\n **Just a quick heads up, this is not for tech support.** If you are after help with a tech issue, pop a message in https://discord.com/channels/332309672486895637/1230544750701187194 and wait patiently for a reply. If your message is about a server-related issue, click the create thread button below and we'll be in touch shortly!",
            );
        await message.reply({
            embeds: [embed],
            components: [
                new GdayButtonBuilder("modmail:create")
                    .setLabel("Create thread")
                    .setEmoji("✅")
                    .setStyle(ButtonStyle.Success)
                    .addArg(message.author.id)
                    .asActionRow(),
            ],
        });
        return;
    }
    try {
        const mailChannel = await useClient().channels.fetch(thread.channel);
        if (!mailChannel?.isTextBased()) throw new Error("Channel not found");
        const modmailMessage = new ModmailMessage({
            from: message.author.username,
            to: "r/Apple Mod Team",
            body: message.cleanContent,
            attachments: message.attachments.map((value) => value.url),
        }).addStaffFields();
        await mailChannel.send({ embeds: [modmailMessage] });
        await message.react("✅");
    } catch (error: any) {
        if (error.message === "Channel not found") {
            await MailThread.findOneAndDelete({ channel: thread.channel });
        }
        await message.react("⛔");
        await message.reply(
            `There was an error sending this message. Please try again!`,
        );
    }
};
useEvent(Events.MessageCreate, async (message: Message) => {
    if (message.channel.type !== ChannelType.DM) {
        return;
    }
    if (message.author.bot) {
        return;
    }
    await forwardModmailMessage(message);
});

useButton("modmail:create", async (interaction, args) => {
    const [userId] = args;
    await interaction.deferReply({ ephemeral: true });
    const rAppleUser = await RAppleUser.findOne({ userId });
    if (rAppleUser?.modmailBlocklisted) {
        return "You have been blocked from creating new modmail threads.";
    }
    let thread = await MailThread.findOne({ author: userId });
    if (thread) {
        return `You already have an open thread, simply send your message in this channel and it'll go straight to the mod team!`;
    }
    const initialMessage = await interaction.message.fetchReference();
    await MailThread.create({
        author: userId,
        initialMessage: initialMessage.id,
    });
    return `Thread created!`;
});

useEvent(Events.ChannelDelete, async (channel: Channel) => {
    if (!("guildId" in channel && channel.guildId === GUILDS.STAFF)) {
        return;
    }
    const thread = await MailThread.findOneAndDelete({ channel: channel.id });
    if (!thread?.value) {
        return;
    }
    const modmailLog = await useClient().channels.fetch(
        CHANNELS.STAFF.modmail_logs,
    );
    if (modmailLog && "send" in modmailLog) {
        const author = await useClient().users.fetch(thread.value.author);
        await modmailLog.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Thread Superclosed")
                    .setColor(Colors.DarkRed)
                    .setDescription(
                        `Modmail thread for ${userMention(thread.value.author)} (${author.username}) superclosed, no log generated.`,
                    )
                    .setTimestamp(Date.now()),
            ],
        });
        await author.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Thread Closed")
                    .setColor(Colors.DarkRed)
                    .setDescription(
                        `Thanks for reaching out! A moderator has closed your thread. You may open another one at any time by sending a message in here.`,
                    ),
            ],
        });
    }
});
