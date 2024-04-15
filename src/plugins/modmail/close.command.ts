import {
    SlashCommandBuilder,
    SlashCommandScope,
} from "../../builders/SlashCommandBuilder";
import { useChatCommand } from "../../hooks/useChatCommand";
import { Colors, EmbedBuilder, Message, userMention } from "discord.js";
import { IMailThread, MailThread } from "./MailThread";
import { useClient } from "../../hooks";
import { CHANNELS } from "../../globals";

const builder = new SlashCommandBuilder()
    .setName("close")
    .setDescription("Closes a modmail thread.")
    .addBooleanOption((option) =>
        option
            .setName("silent")
            .setDescription("Whether to close the thread silently"),
    )
    .setScope(SlashCommandScope.STAFF_SERVER);
useChatCommand(builder, async (interaction) => {
    const thread: unknown = (await MailThread.findOneAndDelete({
        channel: interaction.channelId,
    })) as unknown;
    if (!thread) {
        return "You can only close modmail threads.";
    }
    const castThread = thread as IMailThread;

    if (!interaction.channel) {
        return "That command can only be run in a channel!";
    }
    const messages = await interaction.channel.messages.fetch();
    const author = await useClient().users.fetch(castThread.author);
    const { username: authorUsername } = author;
    const logChannel = await useClient().channels.fetch(
        CHANNELS.STAFF.modmail_logs,
    );
    if (!logChannel?.isTextBased()) {
        throw new Error("Modmail log channel is not text based");
    }
    logChannel.send({
        embeds: [
            new EmbedBuilder()
                .setTitle("Thread Closed")
                .setColor(Colors.DarkRed)
                .setDescription(
                    `Modmail thread for ${userMention(castThread.author)} (${authorUsername}) closed by ${interaction.user.username}`,
                )
                .setTimestamp(Date.now()),
        ],
        files: [
            {
                attachment: createLogFile([...messages.values()]),
                name: `${authorUsername}-${Date.now()}-modmail-thread.txt`,
            },
        ],
    });
    const silent = interaction.options.getBoolean("silent");
    if (!silent) {
        author.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Thread Closed")
                    .setColor(Colors.DarkRed)
                    .setDescription(
                        `Thanks for reaching out! A moderator has closed your thread. You may open another one at any time by sending a message in here.`,
                    ),
            ],
        });
    }
    await interaction.channel.delete();
    return null;
});
const createLogFile = (messages: Message[]) => {
    const logLines: string[] = [];
    for (const message of messages) {
        let text = "";
        if (message.author.bot) {
            const [embed] = message.embeds;
            if (!embed?.footer?.text) {
                continue;
            }
            text = `${embed.footer.text}: ${embed.description}`;
        } else {
            text = `NOTE - ${message.author.username}: ${message.cleanContent}`;
        }
        text = `[${message.createdTimestamp}] ${text.replaceAll("\n", "\n\t\t\t")}`;
        logLines.push(text);
    }
    return Buffer.from(logLines.reverse().join("\n"));
};
