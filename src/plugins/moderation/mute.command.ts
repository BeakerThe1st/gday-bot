import {
    ChatInputCommandInteraction,
    inlineCode,
    PermissionFlagsBits,
    time,
    TimestampStyles,
    userMention
} from "discord.js";
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
        option.setName("duration").setDescription("Duration (max 28 days)").setRequired(true)
    )
    .addStringOption((option) =>
        option.setName("reason").setDescription("Reason for the mute.")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setScope(SlashCommandScope.MAIN_GUILD);

useChatCommand(builder, async (interaction: ChatInputCommandInteraction) => {
    const MAX_MUTE = 2419200000 // 28 days in ms, limit provided by Discord API.

    const user = interaction.options.getUser("user", true);
    const duration = interaction.options.getString("duration", true);
    const reason = interaction.options.getString("reason") ?? undefined; // ?? undefined as getString() returns string | null
    const parsedDuration = parse(duration, 'ms') ?? 600000; // 10 minutes to ms to get around parse returning undefined potentially.

    if (!interaction.guild) return `This command can only be used in a guild.`
    if (parsedDuration > MAX_MUTE) return `You cannot mute anyone for more than 28 days.`;

    const member = await interaction.guild.members.fetch(user);

    /*const lastMutedTimestamp = member.communicationDisabledUntilTimestamp;

    if (lastMutedTimestamp && lastMutedTimestamp > Date.now()) return `${userMention(member.id)} is already muted!`*/

    await member.timeout(parsedDuration, `${interaction.user}${reason ? ` ${reason}` : ""}`);
    const timestamp = Math.floor(Date.now() / 1000 + parsedDuration / 1000);
    return `${userMention(member.id)} has been muted${reason ? ` for ${inlineCode(reason)}` : ""}. Expiry: ${time(timestamp, TimestampStyles.RelativeTime)}`
});
