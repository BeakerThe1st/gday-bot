import {SlashCommandBuilder, SlashCommandScope} from "../../builders/SlashCommandBuilder";
import {useChatCommand} from "../../hooks/useChatCommand";
import {ChatInputCommandInteraction, inlineCode, userMention} from "discord.js";
import {Tag} from "./Tag.model";

const options = (await Tag.find({}, 'name').exec())
    .map(({name}) => ({
        name,
        value: name
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
    const tag = await Tag.findOne({name: tagName});
    if (!tag) {
        throw new Error(`${inlineCode(tagName)} not found.`)
    }
    return {
        content: `${target ? `${target}\n` : ''}${tag.content}`,
        allowedMentions: {
            users: [target?.id ?? '']
        }
    }
})