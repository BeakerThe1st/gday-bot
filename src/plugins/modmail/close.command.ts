import {SlashCommandBuilder, SlashCommandScope} from "../../builders/SlashCommandBuilder";
import {useChatCommand} from "../../hooks/useChatCommand";
import {ChatInputCommandInteraction} from "discord.js";
import {MailThread} from "./MailThread";
import {useClient} from "../../hooks";

const builder = new SlashCommandBuilder()
    .setName("close")
    .setDescription("Closes a modmail thread.")
    .setScope(SlashCommandScope.STAFF_SERVER);

useChatCommand(builder, async (interaction: ChatInputCommandInteraction) => {
    const thread = await MailThread.findOneAndDelete({channel: interaction.channelId});
    if (!thread) {
        return "You can only close modmail threads.";
    }
    return "Thread closed.";
});
