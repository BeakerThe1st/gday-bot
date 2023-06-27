import { ChatInputCommandInteraction, PermissionFlagsBits, userMention } from "discord.js";
import {SlashCommandBuilder, SlashCommandScope} from "../../builders/SlashCommandBuilder";
import {useChatCommand} from "../../hooks/useChatCommand";
import parse from 'parse-duration';

const builder = new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Mutes user for the specified duration.")
    .addUserOption((option) => 
        option.setName("user").setDescription("User to be muted.").setRequired(true)
    )
    .addStringOption((option) =>
        option.setName("duration").setDescription("Duration (max 28d, default 10m)").setRequired(false)
    )
    .addStringOption((option) =>
    option.setName("reason").setDescription("Reason for the mute.").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setScope(SlashCommandScope.GLOBAL);

useChatCommand(builder, async (interaction: ChatInputCommandInteraction) => {
        const MAX_MUTE = 2419200000 // 28 days in ms, limit provided by Discord API.
        const user = interaction.options.getUser("user", true);
        const duration = interaction.options.getString("duration") ?? "10m";
        const reason = interaction.options.getString("reason") ?? "No reason provided.";
        const parsedDuration = parse(duration, 'ms') ?? 600000; // 10 minutes to ms to get around parse returning undefined potentially.

        if (!interaction.guild) return `This command can only be used in a guild.` 
        if (parsedDuration > MAX_MUTE) return `You cannot mute anyone for more than 28 days.`; 
        const member = interaction.guild.members.cache.find(member => member.id === user.id);
        if (!member) return `This member is not a member of this guild.`
        try {
            await member.timeout(parsedDuration, reason);
            return `Successfully muted ${userMention(member.id)} for ${duration}.`
        } catch (e) {
            return `Something went wrong with the mute command: ${e}`
        }
});
