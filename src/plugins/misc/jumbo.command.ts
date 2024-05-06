import { PermissionFlagsBits } from "discord.js";
import { GdayChatCommandBuilder } from "../../structs/GdayChatCommandBuilder";
import { useChatCommand } from "../../hooks/";
import { CommandScope } from "../../structs/GdayCommandBuilder";

const builder = new GdayChatCommandBuilder()
    .setName("jumbo")
    .setDescription(
        "Grabs the big version of an emoji, 'cause size matters, mate.",
    )
    .setScope(CommandScope.MAIN_GUILD)
    .setDefaultMemberPermissions(PermissionFlagsBits.AttachFiles)
    .addStringOption((option) =>
        option
            .setName("emoji")
            .setDescription("Emoji to jumbo size.")
            .setRequired(true),
    );
useChatCommand(builder as GdayChatCommandBuilder, async (interaction) => {
    const emoji = interaction.options.getString("emoji", true).trim();

    const emojis = emoji.split(">");

    if (!emoji.startsWith(`<`) && !emoji.endsWith(">")) {
        return "That cannot be jumbofied.";
    }

    const matches = emoji.match(/\d{15,}/g);
    if (!matches) {
        return "Invalid emoji format!";
    }

    const type = emoji.startsWith("<a:") ? "gif" : "png";
    return `https://cdn.discordapp.com/emojis/${matches[0]}.${type}?quality=lossless`;
});
