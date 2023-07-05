import {
    ActionRowBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder, Events,
    inlineCode, ModalActionRowComponentBuilder,
    ModalBuilder, PermissionFlagsBits,
    TextInputBuilder, TextInputStyle,
    userMention
} from "discord.js";
import {SlashCommandBuilder, SlashCommandScope} from "../../builders/SlashCommandBuilder";
import {useChatCommand} from "../../hooks/useChatCommand";
import {createTag, deleteTag, editTag, fetchTags} from "./tags";
import { useEvent} from "../../hooks";
import {Tag} from "./Tag.model";

const builder = new SlashCommandBuilder()
    .setName("tags")
    .setDescription("Manages tags.")
    .setScope(SlashCommandScope.MAIN_GUILD)
    .setDMPermission(false)
    .setDeferrable(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand((subcommand) =>
        subcommand
            .setName("list")
            .setDescription("Lists all tags for this server")
        )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("create")
            .setDescription("Displays the tag creation modal")
        )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("delete")
            .setDescription("Deletes a tag")
            .addStringOption((option) =>
                option.setName("name").setDescription("Name for the tag to delete").setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("edit")
            .setDescription("Displays the tag editing modal")
            .addStringOption((option) =>
                option.setName("name").setDescription("Name for the tag to delete").setRequired(true)
            )
    );

useChatCommand(builder as SlashCommandBuilder, async (interaction: ChatInputCommandInteraction) => {
    const subcommand = interaction.options.getSubcommand();
    //DM permission is false, therefore I think we can assert guild as non-null?
    const guildId = interaction.guild!.id;
    const tagName = interaction.options.getString("name", false);

    const modal = new ModalBuilder();
    const tagTitleInput = new TextInputBuilder()
        .setCustomId('tagTitleInput')
        .setLabel("Tag name")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);
    const tagContentInput = new TextInputBuilder()
        .setCustomId('tagContentInput')
        .setLabel("Tag content")
        .setStyle(TextInputStyle.Paragraph)
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
                return `\n- ${inlineCode(tag.name)} by ${userMention(tag.author)} (${tag.usesCount} uses)`
            });
            return {
                content: `Here are all ya tags cobber:\n ${tagStrings.join("")}`,
                allowedMentions: {parse: []}
            }
            /*if (!tags) return `No tags were found for this server.`

            const embeds : EmbedBuilder[] = [];
            let currentEmbed = new EmbedBuilder().setTitle("Tags List");
            let isFirstElement = true;

            tags.forEach((tag, index) => {
                const fields = [
                    { name: "Tag name", value: tag.name, inline: true },
                    { name: "Author", value: userMention(tag.author), inline: true },
                    { name: "# of usages", value: tag.usesCount.toString(), inline: true }
                ];

                if (!isFirstElement) {
                    fields.forEach(field => {
                        field.name = '\u200B'; // Use a zero-width space character
                    });
                }
                currentEmbed.addFields(...fields);

                if ((index + 1) % 5 === 0 || index === tags.length - 1) {
                    embeds.push(currentEmbed);
                    currentEmbed = new EmbedBuilder().setTitle("Tags List");
                    isFirstElement = true;
                } else {
                    isFirstElement = false;
                }
            });
            await interaction.reply({embeds});*/
        case "create":
            modal.setCustomId("tagCreate").setTitle("Create new tag").addComponents(firstActionRow, secondActionRow);
            return modal;
        case "delete":
            await deleteTag(guildId, tagName!);
            return `Tag ${inlineCode(tagName!)} was successfully deleted.`;
        case "edit":
            const tag = await Tag.findOne({guild: guildId, name: tagName});
            if (!tag) return `Tag not found!`;
            tagTitleInput.setValue(tag.name);
            tagContentInput.setValue(tag.content);
            modal.setTitle("Edit a tag").setCustomId("tagEdit-" + tag.name).addComponents(firstActionRow, secondActionRow);
            return modal;
    }
    throw new Error(`Something went wrong with the tags command.`);
});

useEvent(Events.InteractionCreate, async (interaction)  => {
    if (!interaction.isModalSubmit() || !interaction.guild) return;

    const tagName = interaction.fields.getTextInputValue('tagTitleInput');
    const tagContent = interaction.fields.getTextInputValue('tagContentInput');

    if (interaction.customId.startsWith("tagCreate")) {
        const createdTag = await createTag(interaction.guild.id, interaction.user.id, tagName, tagContent);
        await interaction.reply({content:`Successfully created tag ${inlineCode(createdTag.name)}.`});
    } else if (interaction.customId.startsWith("tagEdit")) {
        const oldName = interaction.customId.replace("tagEdit-", "");
        await editTag(interaction.guild.id, interaction.user.id, oldName, tagName, tagContent);
        await interaction.reply({content:`Successfully updated tag ${inlineCode(oldName)}.`});
    }
    await interaction.reply({content:  `Something went wrong with the modal submission.`})
});