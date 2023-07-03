import {SlashCommandBuilder, SlashCommandScope} from "../../builders/SlashCommandBuilder";
import {useChatCommand} from "../../hooks/useChatCommand";
import {ChatInputCommandInteraction, inlineCode} from "discord.js";
import {Tag} from "./Tag.model";

const options = (await Tag.find({}, "name").exec())
    .map(({name}) => ({
        name,
        value: name,
    }));


const builder = new SlashCommandBuilder()
    .setName("tag")
    .setDescription("Calls a tag.")
    .setDeferrable(false)
    .addStringOption((option) =>
        option
            .setName("name")
            .setDescription("The name of the tag you want to call.")
            .setChoices(...options)
            .setRequired(true),
    )
    .addUserOption((option) =>
        option
            .setName("user")
            .setDescription("User to ping with the tag."),
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
    if (!tag) throw new Error(`${inlineCode(tagName)} not found.`);

    return {
        content: `${target ? `${target}\n` : ""}${tag.content}`,
        allowedMentions: {
            users: [target?.id ?? ""],
        },
    };
});