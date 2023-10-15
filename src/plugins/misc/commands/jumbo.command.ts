import {ChatInputCommandInteraction, inlineCode, PermissionFlagsBits} from "discord.js";
import {SlashCommandBuilder, SlashCommandScope} from "../../../builders/SlashCommandBuilder";
import {useChatCommand} from "../../../hooks/useChatCommand";

const builder = new SlashCommandBuilder()
    .setName("jumbo")
    .setDescription("Retrieves the image behind an emoji.")
    .addStringOption(option => option.setName("emoji").setDescription("Emoji to jumbo size.").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.AttachFiles)
    .setScope(SlashCommandScope.MAIN_GUILD);

useChatCommand(builder, async (interaction: ChatInputCommandInteraction) => {
    const emoji = interaction.options.getString('emoji', true).trim();

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