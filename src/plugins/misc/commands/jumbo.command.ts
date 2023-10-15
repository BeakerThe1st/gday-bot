import {ChatInputCommandInteraction, inlineCode, PermissionFlagsBits} from "discord.js";
import {SlashCommandBuilder, SlashCommandScope} from "../../../builders/SlashCommandBuilder";
import {useChatCommand} from "../../../hooks/useChatCommand";
import axios from 'axios';

const builder = new SlashCommandBuilder()
    .setName("jumbo")
    .setDescription("Make G'day blow up an image.")
    .addStringOption(option => option.setName("emoji").setDescription("Emoji to jumbo size.").setRequired(true))
    .setScope(SlashCommandScope.MAIN_GUILD);

useChatCommand(builder, async (interaction: ChatInputCommandInteraction) => {
    let emoji = interaction.options.getString('emoji', true)?.trim();

    if (!emoji || !interaction.channel) {
        return "Invalid request.";
    }

    if (emoji.startsWith("<") && emoji.endsWith(">")) {
        const match = emoji.match(/\d{15,}/g);
        if (!match) {
            return "Invalid emoji format!";
        }
        let type = "png";
        if (emoji.startsWith("<a:")) {
            type = "gif"
        };
        emoji = `https://cdn.discordapp.com/emojis/${match}.${type}?quality=lossless`;
    }

    if (!emoji?.startsWith("<:" || "<a:")) {
        return "You can't jumbo-ify that, sorry!";
    }

    return `${emoji}`
});
