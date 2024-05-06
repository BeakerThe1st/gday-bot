import { GdayChatCommandBuilder } from "../../structs/GdayChatCommandBuilder";
import { useChatCommand } from "../../hooks/";
import { Colors, EmbedBuilder, inlineCode, userMention } from "discord.js";
import { Tag } from "./Tag.model";
import { CommandScope } from "../../structs/GdayCommandBuilder";

const builder = new GdayChatCommandBuilder()
    .setName("tag")
    .setDescription(
        "Digs out a tag for a bit of a chat, like calling out a mate.",
    )
    .setDeferrable(false)
    .setDMPermission(false)
    .setScope(CommandScope.GLOBAL)
    .addStringOption((option) =>
        option
            .setName("name")
            .setDescription("The name of the tag you want to call.")
            .setAutocomplete(true)
            .setRequired(true),
    )
    .addUserOption((option) =>
        option.setName("user").setDescription("User to ping with the tag."),
    );

useChatCommand(builder as GdayChatCommandBuilder, async (interaction) => {
    const tagName = interaction.options.getString("name", true);
    const target = interaction.options.getUser("user");
    if (!interaction.guild)
        throw new Error(`This command can only be ran in guilds.`);
    const tag = await Tag.findOneAndUpdate(
        { name: tagName, guild: interaction.guild?.id },
        { $inc: { usesCount: 1 } },
        { new: true },
    );
    if (!tag) return `${inlineCode(tagName)} is not a valid tag.`;
    const embed = new EmbedBuilder()
        .setColor(Colors.Blue)
        .setDescription(tag.content);
    return {
        content: `${target ? `${userMention(target.id)}\n` : ""}`,
        embeds: [embed],
        allowedMentions: {
            users: target ? [target.id] : [],
        },
    };
});
