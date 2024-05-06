import { GdayChatCommandBuilder } from "../../structs/GdayChatCommandBuilder";
import { useChatCommand } from "../../hooks/";
import { channelMention, Colors, EmbedBuilder, userMention } from "discord.js";
import { MailThread } from "./MailThread";
import { CommandScope } from "../../structs/GdayCommandBuilder";

const builder = new GdayChatCommandBuilder()
    .setName("new")
    .setDescription("Creates a new modmail thread.")
    .setScope(CommandScope.STAFF_SERVER)
    .addUserOption((option) =>
        option
            .setName("user")
            .setDescription("User to create a thread for")
            .setRequired(true),
    );

useChatCommand(builder as GdayChatCommandBuilder, async (interaction) => {
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
