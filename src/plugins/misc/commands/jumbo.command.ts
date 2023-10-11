import {ChatInputCommandInteraction, inlineCode, PermissionFlagsBits} from "discord.js";
import {SlashCommandBuilder, SlashCommandScope} from "../../../builders/SlashCommandBuilder";
import {useChatCommand} from "../../../hooks/useChatCommand";
import axios from 'axios';

const builder = new SlashCommandBuilder()
    .setName("jumbo")
    .setDescription("Make G'day blow up an image.")
    .addStringOption(option => option.setName("emoji").setDescription("Emoji to jumbo size.").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setEphemeral(true)
    .setScope(SlashCommandScope.GLOBAL);

useChatCommand(builder, async (interaction: ChatInputCommandInteraction) => {
    let emoji = interaction.options.getString('emoji')?.trim();

    if (!emoji || !interaction.channel) {
        return "Invalid request.";
    }

    // Handle custom emojis
    if (emoji?.startsWith("<") && emoji.endsWith(">")) {
        const match = emoji.match(/\d{15,}/g);
        if (!match) {
            return "Invalid emoji format!";
        }

        const id = match[0];

        let type = "png";
        try {
            const image = await axios.get(`https://cdn.discordapp.com/emojis/${id}.gif`);
            if (image) type = "gif";
        } catch (err) {};
        emoji = `https://cdn.discordapp.com/emojis/${id}.${type}?quality=lossless`;
    }

    // Check for valid image URLs
    if (!emoji?.startsWith("http")) {
        return "You can't jumbo-ify that, sorry!";
    }

    // Send the jumbofied emoji
    await interaction.channel.send({
        content: emoji,
        allowedMentions: {
            parse: ["users"],
        },
    });

    return `Jumbofied!`;
});
