import {ChatInputCommandInteraction, inlineCode, PermissionFlagsBits} from "discord.js";
import {SlashCommandBuilder, SlashCommandScope} from "../../../builders/SlashCommandBuilder";
import {useChatCommand} from "../../../hooks/useChatCommand";

const builder = new SlashCommandBuilder()
    .setName("jumbo")
    .setDescription("Make G'day blow up an image.")
    .addStringOption(option => option.setName("emoji").setDescription("Emoji to jumbo size.").setRequired(true))
    .setScope(SlashCommandScope.MAIN_GUILD);

useChatCommand(builder, async (interaction: ChatInputCommandInteraction) => {
    const emoji = interaction.options.getString('emoji', true).trim();
    let emojiURL = null

    if (!emoji.startsWith(`<`)) {
        return "You can't jumbo-ify that, sorry!";
    };

    if (emoji.startsWith("<") && emoji.endsWith(">")) {
        const id = emoji.match(/\d{15,}/g);
        if (!id) {
            return "Invalid emoji format!";
        }
        const type = emoji.startsWith("<a:") ? "gif" : "png";

        emojiURL = `https://cdn.discordapp.com/emojis/${id}.${type}?quality=lossless`;
    };
    
    return `${emojiURL}`
});