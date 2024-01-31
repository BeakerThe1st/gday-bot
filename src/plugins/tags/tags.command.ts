import {
    ActionRow,
    ActionRowBuilder,
    ChatInputCommandInteraction,
    Events,
    inlineCode,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    PermissionFlagsBits,
    TextInputBuilder,
    TextInputStyle,
    userMention,
} from "discord.js";
import {SlashCommandBuilder, SlashCommandScope} from "../../builders/SlashCommandBuilder";
import {useChatCommand} from "../../hooks/useChatCommand";
import {createTag, deleteTag, editTag, fetchTags} from "./tags";
import {useEvent} from "../../hooks";
import {Tag} from "./Tag.model";

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
            .setDescription("Lists all tags for this server"),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("create")
            .setDescription("Displays the tag creation modal"),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("delete")
            .setDescription("Deletes a tag")
            .addStringOption((option) =>
                option.setName("name").setDescription("Name for the tag to delete").setRequired(true).setAutocomplete(true),
            ),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("edit")
            .setDescription("Displays the tag editing modal")
            .addStringOption((option) =>
                option.setName("name").setDescription("Name for the tag to edit").setRequired(true).setAutocomplete(true),
            ),
    );

useChatCommand(builder as SlashCommandBuilder, async (interaction: ChatInputCommandInteraction) => {
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

    const firstActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(tagTitleInput);
    const secondActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(tagContentInput);

    // TODO: Need to figure out why we get [ERROR]: Error with interactionCreate event, Error [InteractionAlreadyReplied]: The reply to this interaction has already been sent or deferred. every time we interact with the modals, even though everything's working fine.
    switch (subcommand) {
        case "list":
            const tags = await fetchTags(guildId);
            if (!tags) {
                return "Crikey, there are no tags in this server mate!";
            }
            const tagStrings = tags.map((tag) => {
                return `\n- ${inlineCode(tag.name)} by ${userMention(tag.author)} (${tag.usesCount} uses)`;
            });
            return {
                content: `Here are all ya tags cobber:\n ${tagStrings.join("")}`,
                allowedMentions: {parse: []},
            };
        case "create":
            modal.setCustomId("tagCreate").setTitle("Create new tag").addComponents(firstActionRow, secondActionRow);
            return modal;
        case "delete":
            await deleteTag(guildId, tagName!);
            return `${inlineCode(tagName!)} deleted`;
        case "edit":
            const tag = await Tag.findOne({guild: guildId, name: tagName});
            if (!tag) return `${inlineCode(tagName!)} is not a valid tag!`;
            tagTitleInput.setValue(tag.name);
            tagContentInput.setValue(tag.content);
            modal.setTitle("Edit a tag").setCustomId("tagEdit-" + tag.name).addComponents(firstActionRow, secondActionRow);
            return modal;
    }
    throw new Error(`Something went wrong with the tags command.`);
});

useEvent(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isModalSubmit() || !interaction.guild || !interaction.customId.startsWith("tag")) return;

    const tagName = interaction.fields.getTextInputValue("tagTitleInput");
    const tagContent = interaction.fields.getTextInputValue("tagContentInput");

    if (interaction.customId.startsWith("tagCreate")) {
        const createdTag = await createTag(interaction.guild.id, interaction.user.id, tagName, tagContent);
        await interaction.reply({content: `Created tag ${inlineCode(createdTag.name)}`});
    } else if (interaction.customId.startsWith("tagEdit")) {
        const oldName = interaction.customId.replace("tagEdit-", "");
        await editTag(interaction.guild.id, interaction.user.id, oldName, tagName, tagContent);
        await interaction.reply({content: `Updated ${inlineCode(oldName)}`});
    }
    await interaction.reply({content: `Something went wrong with the modal submission.`});
});