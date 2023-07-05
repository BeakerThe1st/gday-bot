import {SlashCommandBuilder, SlashCommandScope} from "../../builders/SlashCommandBuilder";
import {useChatCommand} from "../../hooks/useChatCommand";
import {ChatInputCommandInteraction, Events, inlineCode} from "discord.js";
import {Tag} from "./Tag.model";
import {useEvent} from "../../hooks";
import Fuse from 'fuse.js';

const builder = new SlashCommandBuilder()
    .setName("tag")
    .setDescription("Calls a tag.")
    .setDeferrable(false)
    .addStringOption((option) =>
        option
            .setName("name")
            .setDescription("The name of the tag you want to call.")
            .setAutocomplete(true)
            .setRequired(true)
    )
    .addUserOption((option) =>
        option
            .setName("user")
            .setDescription("User to ping with the tag.")
    )
    .setScope(SlashCommandScope.MAIN_GUILD);

useChatCommand(builder, async (interaction: ChatInputCommandInteraction) => {
    const tagName = interaction.options.getString("name", true);
    const target = interaction.options.getUser("user");
    if (!interaction.guild) throw new Error(`This command can only be ran in guilds.`)
    const tag = await Tag.findOneAndUpdate(
        {name: tagName, guild: interaction.guild?.id},
        {$inc: {usesCount: 1}},
        {new: true});
    if (!tag) return `${inlineCode(tagName)} is not a valid tag.`;
    return {
        content: `${target ? `${target}\n` : ''}${tag.content}`,
        allowedMentions: {
            users: target ? [target.id] : []
        }
    }
})

useEvent(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isAutocomplete()) return;
    if (interaction.commandName !== "tag") return;

    //Weakened tags array with just name and content
    const tags = (await Tag.find({guild: interaction.guildId}))
        .map((document) => ({name: document.name, content: document.content}));
    //fuuuuuseeeeeee
    const fuse = new Fuse(tags, {includeScore: true, keys: ['name', 'content']});

    const result = fuse.search(interaction.options.getFocused());

    //Turn it into discord friendly options
    const options = result
        .map(({item}) => ({
            name: item.name,
            value: item.name
        }));
    await interaction.respond(options);
})