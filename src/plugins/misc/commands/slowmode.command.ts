import {ChatInputCommandInteraction, PermissionFlagsBits, TextChannel} from "discord.js";
import {SlashCommandBuilder, SlashCommandScope} from "../../../builders/SlashCommandBuilder";
import {useChatCommand} from "../../../hooks/useChatCommand";

const builder = new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Set the Slow Mode duration in the current channel")
    .addStringOption(option => option
        .setName("duration")
        .setDescription("Set the duration in seconds.")
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setScope(SlashCommandScope.MAIN_GUILD)
    .setEphemeral(true);

useChatCommand(builder, async (interaction: ChatInputCommandInteraction) => {
    const duration = interaction.options.getString('duration', true)

    if (!interaction.channel || !interaction.channel.isTextBased()) {
        return "Channel undefined"
    }

    const channel = interaction.channel as TextChannel

    await channel.setRateLimitPerUser(parseInt(duration))

    return `Slow mode was set to ${duration} seconds!`
});