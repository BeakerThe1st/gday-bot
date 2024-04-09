import {
    SlashCommandBuilder,
    SlashCommandScope,
} from "../../builders/SlashCommandBuilder";
import { useChatCommand } from "../../hooks/useChatCommand";
import { channelMention, Colors, EmbedBuilder, userMention } from "discord.js";
import { MailThread } from "./MailThread";

const builder = new SlashCommandBuilder()
    .setName("new")
    .setDescription("Creates a new modmail thread.")
    .addUserOption((option) =>
        option
            .setName("user")
            .setDescription("User to create a thread for")
            .setRequired(true),
    )
    .setScope(SlashCommandScope.STAFF_SERVER);

useChatCommand(builder, async (interaction) => {
    const target = interaction.options.getUser("user", true);
    const thread = await MailThread.findOne({ author: target.id });
    if (thread) {
        return `${userMention(target.id)} already has an open modmail thread. ${channelMention(thread.channel)}`;
    }
    const newThread = await MailThread.create({
        author: target.id,
        initialMessage: "",
    });
    const notificationEmbed = new EmbedBuilder()
        .setTitle("Thread Created")
        .setDescription(
            "The r/Apple mod team have created a modmail thread with you. Any messages sent here will be forwarded to the team.",
        )
        .setColor(Colors.Green);
    await target.send({ embeds: [notificationEmbed] });
    return `Thread created! ${channelMention(newThread.channel)}`;
});
