import {SlashCommandBuilder, SlashCommandScope} from "../../builders/SlashCommandBuilder";
import {useChatCommand} from "../../hooks/useChatCommand";
import {ChatInputCommandInteraction, Colors, Embed, EmbedBuilder, Message, userMention} from "discord.js";
import {MailThread} from "./MailThread";
import {useClient} from "../../hooks";
import {CHANNELS} from "../../globals";

const builder = new SlashCommandBuilder()
    .setName("close")
    .setDescription("Closes a modmail thread.")
    .setScope(SlashCommandScope.STAFF_SERVER);

useChatCommand(builder, async (interaction: ChatInputCommandInteraction) => {
    const thread = await MailThread.findOneAndDelete({channel: interaction.channelId});
    if (!thread?.value) {
        return "You can only close modmail threads.";
    }
    //return "Thread closed.";
    if (!interaction.channel) {
        return "That command can only be run in a channel!";
    }
    const messages = await interaction.channel.messages.fetch();
    const author = await useClient().client.users.fetch(thread.value.author);
    const {username: authorUsername} = author;
    const logChannel = await useClient().client.channels.fetch(CHANNELS.STAFF.modmail_logs);
    if (!logChannel?.isTextBased()) {
        throw new Error("Modmail log channel is not text based");
    }
    logChannel.send({
        embeds: [new EmbedBuilder()
            .setTitle("Thread Closed")
            .setColor(Colors.DarkRed)
            .setDescription(`Modmail thread for ${userMention(thread.value.author)} (${authorUsername}) closed by ${interaction.user.username}`)
            .setTimestamp(Date.now()),
        ],
        files: [
            {
                attachment: createLogFile([...messages.values()]),
                name: `${authorUsername}-${Date.now()}-modmail-thread.txt`,
            },
        ],
    });
    author.send({
        embeds: [new EmbedBuilder()
            .setTitle("Thread Closed")
            .setColor(Colors.DarkRed)
            .setDescription(`Thanks for reaching out! A moderator has closed your thread. You may open another one at any time by sending a message in here.`)]
    });
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
