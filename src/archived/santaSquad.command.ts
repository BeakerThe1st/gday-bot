import { useClient } from "../hooks";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    GuildMember,
    PermissionFlagsBits,
    userMention,
} from "discord.js";
import { GdayChatCommandBuilder } from "../structs/GdayChatCommandBuilder";
import { useButton, useChatCommand } from "../hooks/";
import { CHANNELS, ROLES } from "../globals";
import { GdayButtonBuilder } from "../structs/GdayButtonBuilder";
import { CommandScope } from "../structs/GdayCommandBuilder";

const builder = new GdayChatCommandBuilder()
    .setName("sendsanta")
    .setDescription(
        "Throws the Santa squad button into the current channel, getting into the festive spirit, mate.",
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setScope(CommandScope.MAIN_GUILD);

useChatCommand(builder as GdayChatCommandBuilder, async (interaction) => {
    const { channel } = interaction;
    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setLabel("Apply for Santa Squad")
            .setEmoji("🎅")
            .setStyle(ButtonStyle.Primary)
            .setCustomId(`santa:apply`),
    );
    if (channel) {
        channel.send({
            content:
                "**Please read the information above before applying for Santa Squad.**",
            components: [actionRow],
        });
    } else {
        throw new Error("Bad channel");
    }
    return "Sent.";
});

useButton("santa:apply", async (interaction) => {
    const apps = await useClient().channels.fetch(
        CHANNELS.MAIN.santa_applications,
    );
    if (!apps?.isTextBased()) {
        throw new Error("Bad applications channel");
    }
    if (!(interaction.member instanceof GuildMember)) {
        throw new Error("Not a GuildMember");
    }
    const embed = new EmbedBuilder()
        .setTitle(interaction.user.username)
        .setColor("Red")
        .setDescription(
            `${userMention(
                interaction.user.id,
            )} Ho ho ho sleigh queens! Please only accept if the santa hat is recognisable and visible.`,
        )
        .setThumbnail(interaction.member.displayAvatarURL());
    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new GdayButtonBuilder("santa:outcome")
            .setLabel("Accept")
            .setEmoji("🎅")
            .setStyle(ButtonStyle.Primary)
            .addArg("apply")
            .addArg(interaction.user.id),
        new GdayButtonBuilder("santa:outcome")
            .setLabel("Deny")
            .setStyle(ButtonStyle.Danger)
            .addArg("deny")
            .addArg(interaction.user.id),
    );
    await apps.send({ embeds: [embed], components: [actionRow] });
    return `Thanks for applying for Santa Squad! Please wait patiently for us to review your application! 💪🎅`;
});

useButton("santa:accept", async (interaction, [outcome, userId]) => {
    await interaction.deferReply({ ephemeral: true });
    const member = await interaction.guild?.members.fetch(userId);
    if (!member) {
        throw new Error(`Not a GuildMember`);
    }
    if (interaction.channel?.isTextBased()) {
        interaction.channel.send(
            `${interaction.user} ${outcome === "accept" ? "accepted" : "denied"} ${member.user} for Santa Squad!`,
        );
    }
    await interaction.message.delete();
    if (outcome === "accept") {
        await member.roles.add(ROLES.MAIN.santa_squad);
    } else {
        try {
            await member.user.send(
                "Your Santa Squad application in r/Apple was denied. Please ensure you have a visible and recognisable santa hat in your profile and re-apply. If you changed your profile picture immediately before applying, please wait before applying again as sometimes Discord can take a while to update profile pictures. If you have any further questions, please read the info provided in the channel and then feel free to contact staff about why your application was denied.",
            );
        } catch {
            return `${member} was denied from Santa Squad but I was unable to DM them. Please contact them directly.`;
        }
    }
    return "Done";
});
