import { ChatInputCommandInteraction, inlineCode } from "discord.js";
import {SlashCommandBuilder, SlashCommandScope,} from "../../builders/SlashCommandBuilder";
import { useChatCommand } from "../../hooks/useChatCommand";
import { Tag } from "./Tag.model";

const builder = new SlashCommandBuilder()
.setName("tags")
.setDescription("Manages tags.")
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
    const subcommand = interaction.options.getSubcommand();
    if (!interaction.guild) throw new Error(`This command can only be ran in guilds.`)
    const guildId = interaction.guild.id
    if (subcommand === "list") {
        const tags = await Tag.find({guild: guildId});
        if (tags.length === 0) {
            return `No tags were found for this server.`
        }
        return `${tags}`
    } else if (subcommand === "create") {
        const tagName = interaction.options.getString("name", true);
        const tagContent = interaction.options.getString("content", true);
        await Tag.create({
            name: tagName,
            content: tagContent,
            author: interaction.user.id,
            guild: interaction.guild.id
        });
        return `Successfully created tag ${tagName} with content ${tagContent}`;
    } else if (subcommand === "delete") {
        const tagName = interaction.options.getString("name", true);
        const tag = await Tag.findOne({name: tagName, guild: guildId})
        if (!tag) throw new Error(`${inlineCode(tagName)} not found.`)
        await tag.delete();
        return `Tag ${inlineCode(tagName)} was successfully deleted.`
    } else if (subcommand === "name") {
        const tagName = interaction.options.getString("name", true);
        const newName = interaction.options.getString("new_name", true);
        const tag = await Tag.findOne({name: tagName, guild: guildId})
        if (!tag) throw new Error(`${inlineCode(tagName)} not found.`)
        tag.name = newName;
        await tag.save();
        return `Tag name for ${tagName} has been updated to ${newName}.`
    } else if (subcommand === "content") {
        const tagName = interaction.options.getString("name", true);
        const newContent = interaction.options.getString("new_content", true);
        const tag = await Tag.findOne({name: tagName, guild: guildId})
        if (!tag) throw new Error(`${inlineCode(tagName)} not found.`)
        tag.content = newContent;
        await tag.save();
        return `Tag content for ${inlineCode(tagName)} has been updated.`
    }
    return null;
});

