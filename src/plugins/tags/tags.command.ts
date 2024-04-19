import {
    ActionRowBuilder,
    Events,
    inlineCode,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    PermissionFlagsBits,
    TextInputBuilder,
    TextInputStyle,
    userMention,
} from "discord.js";
import {
    SlashCommandBuilder,
    SlashCommandScope,
} from "../../structs/SlashCommandBuilder";
import { useChatCommand } from "../../hooks";
import { createTag, deleteTag, editTag, fetchTags } from "./tags";
import { useEvent, usePagination } from "../../hooks";
import { ITag, Tag } from "./Tag.model";

const builder = new SlashCommandBuilder()
    .setName("tags")
    .setDescription("Manages tags.")
    .setScope(SlashCommandScope.GLOBAL)
    .setDMPermission(false)
    .setDeferrable(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand((subcommand) =>
        subcommand
            .setName("list")
            .setDescription(
                "Lays out all the tags for this guild, like a menu at your local pub.",
            ),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("create")
            .setDescription(
                "Shows the tag creation modal, where you can whip up a ripper tag.",
            ),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("delete")
            .setDescription(
                "Boots a tag out the door, like tossing out the rubbish.",
            )
            .addStringOption((option) =>
                option
                    .setName("name")
                    .setDescription("Name for the tag to delete")
                    .setRequired(true)
                    .setAutocomplete(true),
            ),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("edit")
            .setDescription(
                "Brings up the tag editing modal, time to give those tags a bit of a spruce up.",
            )
            .addStringOption((option) =>
                option
                    .setName("name")
                    .setDescription("Name for the tag to edit")
                    .setRequired(true)
                    .setAutocomplete(true),
            ),
    );

useChatCommand(builder as SlashCommandBuilder, async (interaction) => {
    const subcommand = interaction.options.getSubcommand();
    //DM permission is false, therefore I think we can assert guild as non-null?
    const guildId = interaction.guild!.id;
    const tagName = interaction.options.getString("name", false);

    const modal = new ModalBuilder();
    const tagTitleInput = new TextInputBuilder()
        .setCustomId("tagTitleInput")
        .setLabel("Tag name")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);
    const tagContentInput = new TextInputBuilder()
        .setCustomId("tagContentInput")
        .setLabel("Tag content")
        .setStyle(TextInputStyle.Paragraph)
        .setMaxLength(550)
        .setRequired(true);

    const firstActionRow =
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
            tagTitleInput,
        );
    const secondActionRow =
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
            tagContentInput,
        );

    // TODO: Need to figure out why we get [ERROR]: Error with interactionCreate event, Error [InteractionAlreadyReplied]: The reply to this interaction has already been sent or deferred. every time we interact with the modals, even though everything's working fine.
    switch (subcommand) {
        case "list":
            return usePagination<ITag>({
                preamble: `Here are all ya tags cobber:`,
                emptyMsg: `Crikey, there are no tags in this server mate!`,
                query: Tag.find({ guild: guildId }).sort({ name: 1 }),
                stringify: (tag) =>
                    `${inlineCode(tag.name)} by ${userMention(tag.author)} (${tag.usesCount} uses)`,
                perPage: 10,
                owner: interaction.user.id,
            });
        /*const tags = await fetchTags(guildId);
            if (!tags) {
                return "Crikey, there are no tags in this server mate!";
            }
            const tagStrings = tags.map((tag) => {
                return `\n- ${inlineCode(tag.name)} by ${userMention(tag.author)} (${tag.usesCount} uses)`;
            });
            return {
                content: `Here are all ya tags cobber:\n ${tagStrings.join("")}`,
                allowedMentions: { parse: [] },
            };*/
        case "create":
            modal
                .setCustomId("tagCreate")
                .setTitle("Create new tag")
                .addComponents(firstActionRow, secondActionRow);
            return modal;
        case "delete":
            await deleteTag(guildId, tagName!);
            return `${inlineCode(tagName!)} deleted`;
        case "edit":
            const tag = await Tag.findOne({
                guild: guildId,
                name: tagName,
            });
            if (!tag) return `${inlineCode(tagName!)} is not a valid tag!`;
            tagTitleInput.setValue(tag.name);
            tagContentInput.setValue(tag.content);
            modal
                .setTitle("Edit a tag")
                .setCustomId("tagEdit-" + tag.name)
                .addComponents(firstActionRow, secondActionRow);
            return modal;
    }
    throw new Error(`Something went wrong with the tags command.`);
});

useEvent(Events.InteractionCreate, async (interaction) => {
    if (
        !interaction.isModalSubmit() ||
        !interaction.guild ||
        !interaction.customId.startsWith("tag")
    )
        return;

    const tagName = interaction.fields.getTextInputValue("tagTitleInput");
    const tagContent = interaction.fields.getTextInputValue("tagContentInput");

    if (interaction.customId.startsWith("tagCreate")) {
        const createdTag = await createTag(
            interaction.guild.id,
            interaction.user.id,
            tagName,
            tagContent,
        );
        await interaction.reply({
            content: `Created tag ${inlineCode(createdTag.name)}`,
        });
    } else if (interaction.customId.startsWith("tagEdit")) {
        const oldName = interaction.customId.replace("tagEdit-", "");
        await editTag(
            interaction.guild.id,
            interaction.user.id,
            oldName,
            tagName,
            tagContent,
        );
        await interaction.reply({ content: `Updated ${inlineCode(oldName)}` });
    }
    await interaction.reply({
        content: `Something went wrong with the modal submission.`,
    });
});
