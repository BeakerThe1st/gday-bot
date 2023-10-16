import {ChatInputCommandInteraction, PermissionFlagsBits, TextChannel} from "discord.js";
import {SlashCommandBuilder, SlashCommandScope} from "../../../builders/SlashCommandBuilder";
import {useChatCommand} from "../../../hooks/useChatCommand";
import {chatEnabled} from "../../chat/chat";

const builder = new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Sets slowmode interval in the current channel")
    .addIntegerOption(option => option
        .setName("interval")
        .setDescription("Slowmode interval in seconds.")
        .setMinValue(0)
        .setMaxValue(21600)
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setScope(SlashCommandScope.MAIN_GUILD)
    .setEphemeral(true);

useChatCommand(builder, async (interaction: ChatInputCommandInteraction) => {
    const interval = interaction.options.getInteger('interval', true)
    const { channel } = interaction;
    if (!(channel && "setRateLimitPerUser" in channel)) {
        return "Slowmode cannot be set in this channel."
    }
    await channel.setRateLimitPerUser(interval);
    return interval === 0 ? "Slowmode disabled" : `Slowmode set to ${interval} seconds`
});