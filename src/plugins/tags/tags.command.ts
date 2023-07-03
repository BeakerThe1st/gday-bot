import {ChatInputCommandInteraction, EmbedBuilder, inlineCode, userMention} from "discord.js";
import {SlashCommandBuilder, SlashCommandScope} from "../../builders/SlashCommandBuilder";
import {useChatCommand} from "../../hooks/useChatCommand";
import {createTag, deleteTag, editTagContent, editTagName, fetchTags} from "./tags";

const builder = new SlashCommandBuilder()
.setName("tags")
.setDescription("Manages tags.")
    .setScope(SlashCommandScope.MAIN_GUILD)
.addSubcommand((subcommand) => 
    subcommand
        .setName("list")
        .setDescription("Lists all tags for this server.")
    )
.addSubcommand((subcommand) => 
    subcommand
        .setName("create")
        .setDescription("Creates a tag with the given name and content.")
        .addStringOption((option) => 
            option.setName("name").setDescription("Name for the tag to create").setRequired(true)
        )
        .addStringOption((option) => 
        option.setName("content").setDescription("Content for the tag to create").setRequired(true)
        )
    )
.addSubcommand((subcommand) => 
subcommand
    .setName("delete")
    .setDescription("Deletes a tag.")
    .addStringOption((option) => 
        option.setName("name").setDescription("Name for the tag to delete").setRequired(true)
    )
)
.addSubcommandGroup((group) => 
    group
    .setName("edit")
    .setDescription("Edits a tag.")
    .addSubcommand((subcommand) => 
        subcommand
        .setName("name")
        .setDescription("Edits a tag's name")
        .addStringOption((option) =>
            option.setName("name").setDescription("Name for the tag").setRequired(true)        
        )
        .addStringOption((option) =>
        option.setName("new_name").setDescription("New name for the tag").setRequired(true)        
    )
    )
    .addSubcommand((subcommand) => 
    subcommand
    .setName("content")
    .setDescription("Edits a tag's content.")
    .addStringOption((option) =>
        option.setName("name").setDescription("Name for the tag").setRequired(true)        
    )
    .addStringOption((option) =>
    option.setName("new_content").setDescription("New content for the tag").setRequired(true)        
)
)
)

useChatCommand(builder as SlashCommandBuilder, async (interaction: ChatInputCommandInteraction) => {
    if (!interaction.guild) throw new Error(`This command can only be ran in guilds.`);

    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    const interactionUser = interaction.user.id;
    const tagName = interaction.options.getString("name", false);
    const tagContent = interaction.options.getString("content", false);
    const newTagName = interaction.options.getString("new_name", false);
    const newTagContent = interaction.options.getString("new_content", false);

    switch (subcommand) {
        case "list":
            // TODO: Find a prettier way to show this stuff to users
            const embed = new EmbedBuilder()
                .setTitle("Tags List")
            const tags = await fetchTags(guildId);
            if (!tags) return `No tags were found for this server.`
            tags.forEach(tag => {
                embed.addFields({name: '\u200B', value: '.'}, {name: "Tag name", value: tag.name}, {name:"Content", value: tag.content}, {name: "Author", value: userMention(tag.author)})
            })
            return {embeds: [embed]}
            break;
        case "create":
            if (tagName && tagContent) {
                const createdTag = await createTag(guildId, interactionUser, tagName, tagContent);
                return `Successfully created tag ${inlineCode(createdTag.name)}.`;
            }
            break;
        case "delete":
            if (tagName) {
                await deleteTag(guildId, tagName);
                return `Tag ${inlineCode(tagName)} was successfully deleted.`
            }
            break;
        case "name":
            if (tagName && newTagName) {
                const editedTag = await editTagName(guildId, interactionUser, tagName, newTagName);
                return `Successfully updated tag's name to ${inlineCode(editedTag.name)}.`;
            }
            break;
        case "content":
            if (tagName && newTagContent) {
                const editedTag = await editTagContent(guildId, interactionUser, tagName, newTagContent);
                return `Successfully updated tag content for ${inlineCode(editedTag.name)}.`;
            }
            break;
        default:
            // Should never get here, the throw error statement got our back anyway.
            break;
    }
    throw new Error(`Something went wrong with the tags command.`);
});

