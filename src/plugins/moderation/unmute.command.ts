import { GdayChatCommandBuilder } from "../../structs/GdayChatCommandBuilder";
import { useChatCommand } from "../../hooks/";
import { GuildMember, PermissionFlagsBits, userMention } from "discord.js";
import { CommandScope } from "../../structs/GdayCommandBuilder";

const builder = new GdayChatCommandBuilder()
    .setName("unmute")
    .setDescription("Unmutes a user")
    .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
    .setScope(CommandScope.MAIN_GUILD)
    .addUserOption((option) =>
        option
            .setName("user")
            .setDescription("User to unmute.")
            .setRequired(true),
    );
useChatCommand(builder as GdayChatCommandBuilder, async (interaction) => {
    const member = interaction.options.getMember("user");
    if (!(member instanceof GuildMember)) {
        return `${member} is not a GuildMember.`;
    }
    if (!member.isCommunicationDisabled()) {
        return `${userMention(member.id)} is not muted.`;
    }
    await member.disableCommunicationUntil(
        null,
        `Unmute command by ${interaction.user.username}`,
    );
    return `${userMention(member.id)} has been unmuted.`;
});
