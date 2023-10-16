import {SlashCommandBuilder, SlashCommandScope} from "../../builders/SlashCommandBuilder";
import {useChatCommand} from "../../hooks/useChatCommand";
import {ChatInputCommandInteraction} from "discord.js";
import {MailThread} from "./MailThread";
import {useClient} from "../../hooks";

const builder = new SlashCommandBuilder()
    .setName("reply")
    .setDescription("Reply within a modmail thread.")
    .addStringOption((option) =>
        option
            .setName("message")
            .setDescription("Message to send.")
            .setRequired(true)
    )
    .addBooleanOption((option) =>
        option
            .setName("anonymous")
            .setDescription("Reply anonymously.")
    )
    .setScope(SlashCommandScope.STAFF_SERVER);

useChatCommand(builder, async (interaction: ChatInputCommandInteraction) => {
    const thread = await MailThread.findOne({channel: interaction.channelId});
    if (!thread) {
        return "You can only reply within modmail threads.";
    }
    const message = interaction.options.getString("message", true);
    const anon = interaction.options.getBoolean("anonymous") ?? false;
    const reply = `## ${anon ? "r/Apple mod team" : interaction.user.username}:\n${message}`;
    const user = await useClient().client.users.fetch(thread.author);
    await user.send(reply);
    return reply;
});
