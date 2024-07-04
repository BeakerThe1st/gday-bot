import { GdayMessageCommandBuilder } from "../../structs/GdayMessageCommandBuilder";
import { CommandScope } from "../../structs/GdayCommandBuilder";
import {
    useButton,
    useClient,
    useInteraction,
    useMessageCommand,
} from "../../hooks";
import { CHANNELS, ROLES } from "../../globals";
import {
    ActionRow,
    ActionRowBuilder,
    ButtonComponent,
    ButtonStyle,
    channelLink,
    channelMention,
    codeBlock,
    Colors,
    Embed,
    EmbedBuilder,
    GuildMemberRoleManager,
    MessageCreateOptions,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    SelectMenuBuilder,
    TextInputBuilder,
    TextInputStyle,
} from "discord.js";
import { json } from "express";
import { GdayButtonBuilder } from "../../structs/GdayButtonBuilder";

const reportModal = new ModalBuilder();

const reasonInput = new TextInputBuilder()
    .setCustomId("reasonInput")
    .setLabel("Report Reason")
    .setStyle(TextInputStyle.Paragraph)
    .setMaxLength(400)
    .setRequired(true);

const firstActionRow =
    new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        reasonInput,
    );

reportModal.addComponents(firstActionRow);

const builder = new GdayMessageCommandBuilder()
    .setName("Report to Mod Team")
    .setDeferrable(false)
    .setScope(CommandScope.MAIN_GUILD);

useMessageCommand(builder as GdayMessageCommandBuilder, async (interaction) => {
    reportModal.setTitle(
        `Report ${interaction.targetMessage.author.username}'s message`,
    );
    reportModal.setCustomId(
        `report-${interaction.targetMessage.channelId}-${interaction.targetMessage.id}`,
    );
    return reportModal;
    /*const message = interaction.targetMessage;
    const staffNotices = await useClient().channels.fetch(
        CHANNELS.MAIN.staff_notices,
    );
    if (!(staffNotices && "send" in staffNotices)) {
        return "Could not submit your report. Please notify a moderator by DMing me instead!";
    }

    const embed = new EmbedBuilder()
        .setTitle("Report Submitted")
        .setColor(Colors.DarkRed)
        .setDescription(
            `${interaction.user} has reported ${message.author}'s message in ${message.channel}\n\n${message.url}`,
        )
        .addFields([
            {
                name: "Content",
                value: `${interaction.targetMessage.cleanContent}`,
            },
        ]);

    if (interaction.targetMessage.attachments.size > 0) {
        embed.addFields([
            {
                name: "Attachments",
                value: `${interaction.targetMessage.attachments.map((value) => value.url).join("\n")}`,
            },
        ]);
    }

    await staffNotices.send({ embeds: [embed] });

    return "Your report has been submitted, thanks for helping make r/Apple safer.";*/
});

useInteraction(async (interaction) => {
    if (!interaction.isModalSubmit()) {
        return null;
    }
    const [action, channelId, msgId] = interaction.customId.split("-");
    if (action !== "report") {
        return null;
    }
    await interaction.deferReply({ ephemeral: true });

    const reportReason = `${interaction.fields.getTextInputValue("reasonInput")}`;

    const staffNotices = await useClient().channels.fetch(
        CHANNELS.MAIN.staff_notices,
    );

    if (!(staffNotices && "send" in staffNotices)) {
        return "Could not submit your report. Please DM me your report instead.";
    }

    const channel = await useClient().channels.fetch(channelId);
    if (!channel?.isTextBased()) {
        return `The reported message is not in a text based channel or the channel no longer exists.`;
    }
    let message;
    try {
        message = await channel.messages.fetch(msgId);
    } catch {
        const deletedEmbed = new EmbedBuilder()
            .setTitle("Report Submitted")
            .setColor(Colors.DarkRed)
            .setDescription(
                `${interaction.user} has reported a recently deleted message in ${channelMention(channelId)}`,
            )
            .addFields([
                {
                    name: "Reason",
                    value: reportReason,
                },
            ]);
        await staffNotices.send({ embeds: [deletedEmbed] });
        return `The message you reported has since been deleted. Staff have still been notified and can check the logs. If you would like to add any detail, please send me a DM.`;
    }

    const embed = new EmbedBuilder()
        .setTitle("Report Submitted")
        .setColor(Colors.DarkRed)
        .setDescription(
            `${interaction.user} has reported ${message.author}'s message in ${message.channel}\n\n${message.url}`,
        )
        .addFields([
            {
                name: "Reason",
                value: reportReason,
            },
        ]);
    if (message.content) {
        embed.addFields([
            {
                name: "Content",
                value: `${message.cleanContent}`,
            },
        ]);
    }

    if (message.attachments.size > 0) {
        embed.addFields([
            {
                name: "Attachments",
                value: `${message.attachments.map((value) => value.url).join("\n")}`,
            },
        ]);
    }

    const assumeButton = new GdayButtonBuilder("report:assume")
        .setLabel("Assume Report")
        .setStyle(ButtonStyle.Success);

    const actionRow = new ActionRowBuilder<GdayButtonBuilder>().setComponents(
        assumeButton,
    );
    let messageOptions: MessageCreateOptions = {
        embeds: [embed],
        components: [actionRow],
    };
    const reporterRoles = interaction.member?.roles;
    if (
        reporterRoles instanceof GuildMemberRoleManager &&
        reporterRoles.highest.comparePositionTo(ROLES.MAIN.plus) >= 0
    ) {
        messageOptions = {
            content: "@here",
            allowedMentions: { parse: ["everyone"] },
            ...messageOptions,
        };
    }
    if (interaction.member?.roles) await staffNotices.send(messageOptions);

    return "Your report has been submitted, thanks for helping make r/Apple safer.";
});

useButton("report:assume", async (interaction) => {
    await interaction.deferReply({ ephemeral: true });
    await interaction.message.edit({
        content: `Assumed by ${interaction.user}`,
        embeds: interaction.message.embeds,
        components: [],
    });
    return "Assumed report";
});
