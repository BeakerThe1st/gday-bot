import {SlashCommandBuilder, SlashCommandScope} from "../../../builders/SlashCommandBuilder";
import {useChatCommand} from "../../../hooks/useChatCommand";
import {AttachmentBuilder, ChatInputCommandInteraction, PermissionFlagsBits} from "discord.js";
import {createCanvas, loadImage} from "canvas";
import path from "path";

const builder = new SlashCommandBuilder()
    .setName("community_note")
    .setDescription("Write up a community note.")
    .addStringOption((option) =>
        option
            .setName("text")
            .setDescription("Text to add.")
            .setMaxLength(35)
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName("reply_candidate")
            .setDescription("Message ID to reply to.")
    )
    .setEphemeral(true)
    .setScope(SlashCommandScope.MAIN_GUILD);

useChatCommand(builder, async (interaction: ChatInputCommandInteraction) => {
    const canvas = createCanvas(1012, 270);
    const ctx = canvas.getContext("2d");

    const imageDir = path.join(process.cwd(), "/src/plugins/misc/commands/");

    const bg = await loadImage(`${imageDir}note.png`);
    ctx.drawImage(bg, 0, 0, 1012, 270);

    ctx.fillStyle = "#ffffff";
    ctx.font = "32px sf-pro"

    ctx.fillText(interaction.options.getString("text", true), 23, 94 + 23);

    const attachment = new AttachmentBuilder(await canvas.createPNGStream(), {name: "note.png"});

    const replyCandidate = interaction.options.getString("message_id");
    if (!interaction.channel) {
        throw new Error("Channel not defined")
    }

    await interaction.channel.send({
        files: [attachment],
        reply: replyCandidate ? {
            messageReference: replyCandidate
        } : undefined
    });

    return "Sent";
})