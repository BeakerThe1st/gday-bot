import { PermissionFlagsBits } from "discord.js";
import { GdayChatCommandBuilder } from "../../structs/GdayChatCommandBuilder";
import { useChatCommand } from "../../hooks/";
import { CommandScope } from "../../structs/GdayCommandBuilder";

const builder = new GdayChatCommandBuilder()
    .setName("slowmode")
    .setDescription(
        "Slows things down in the current channel, like taking it easy on a hot arvo.",
    )
    .addIntegerOption((option) =>
        option
            .setName("interval")
            .setDescription("Slowmode interval in seconds.")
            .setMinValue(0)
            .setMaxValue(21600)
            .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setScope(CommandScope.MAIN_GUILD)
    .setEphemeral(true);

useChatCommand(builder, async (interaction) => {
    const interval = interaction.options.getInteger("interval", true);
    const { channel } = interaction;
    if (!(channel && "setRateLimitPerUser" in channel)) {
        return "Slowmode cannot be set in this channel.";
    }
    await channel.setRateLimitPerUser(interval);
    return interval === 0
        ? "Slowmode disabled"
        : `Slowmode set to ${interval} seconds`;
});
