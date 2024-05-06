import { GdayChatCommandBuilder } from "../../structs/GdayChatCommandBuilder";
import {
    ActionRowBuilder,
    ButtonStyle,
    codeBlock,
    Interaction,
    ModalBuilder,
    PermissionFlagsBits,
    TextInputBuilder,
    TextInputStyle,
    userMention,
} from "discord.js";
import {
    useButton,
    useChatCommand,
    useInteraction,
    useUserCommand,
} from "../../hooks/";
import { RAppleUser } from "../rApple/RAppleUser.model";
import { GdayButtonBuilder } from "../../structs/GdayButtonBuilder";
import { CommandScope } from "../../structs/GdayCommandBuilder";
import { GdayUserCommandBuilder } from "../../structs/GdayUserCommandBuilder";

const userCommandBuilder = new GdayUserCommandBuilder()
    .setName("Show scratchpad")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setEphemeral(true)
    .setScope(CommandScope.MAIN_GUILD);

const chatCommandBuilder = new GdayChatCommandBuilder()
    .setName("scratchpad")
    .setDescription("Shows a user's scratchpad")
    .addUserOption((option) =>
        option
            .setName("user")
            .setDescription("User to view the scratchpad for.")
            .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setEphemeral(true)
    .setScope(CommandScope.MAIN_GUILD);

const fetchResponse = async (targetId: string) => {
    let rAppleUser = await RAppleUser.findOne({ userId: targetId });
    if (!rAppleUser) {
        rAppleUser = new RAppleUser({ userId: targetId });
    }
    let message = `${userMention(targetId)}'s scratchpad`;
    if (rAppleUser.scratchpad) {
        message += `:\n${codeBlock(rAppleUser.scratchpad)}`;
    } else {
        message += ` is empty.`;
    }
    return {
        content: `${message}`,
        components: [
            new GdayButtonBuilder("scratchpad:edit")
                .setLabel("Edit")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("📝")
                .addArg(targetId)
                .asActionRow(),
        ],
    };
};
useChatCommand(chatCommandBuilder, async (interaction) => {
    return fetchResponse(interaction.options.getUser("user", true).id);
});

useUserCommand(userCommandBuilder, async (interaction) => {
    return fetchResponse(interaction.targetId);
});

useButton("scratchpad:edit", async (interaction, args) => {
    const target = await interaction.client.users.fetch(args[0]);
    const rAppleUser = await RAppleUser.findOne({ userId: target.id });
    const textField = new TextInputBuilder()
        .setCustomId("text")
        .setLabel("Text")
        .setPlaceholder("big stinky poo poo")
        .setValue(rAppleUser?.scratchpad ?? "")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);
    return new ModalBuilder()
        .setCustomId(`${interaction.customId}`)
        .setTitle(`Scratchpad for ${target.username}`)
        .addComponents([
            new ActionRowBuilder<TextInputBuilder>().addComponents(textField),
        ]);
});

useInteraction(async (interaction: Interaction) => {
    if (!interaction.isModalSubmit()) {
        return null;
    }
    const [prefix, targetId] = interaction.customId.split("-");
    if (prefix !== "scratchpad:edit") {
        return null;
    }
    let rAppleUser = await RAppleUser.findOne({ userId: targetId });
    if (!rAppleUser) {
        rAppleUser = new RAppleUser({ userId: targetId });
    }
    rAppleUser.scratchpad = interaction.fields.getField("text").value;
    await rAppleUser.save();
    return {
        content: `Edited ${userMention(targetId)}'s scratchpad`,
        ephemeral: true,
        allowedMentions: { parse: [] },
    };
});
