import { useChatCommand } from "../../hooks/";
import { GuildMember, PermissionFlagsBits } from "discord.js";
import { GdayChatCommandBuilder } from "../../structs/GdayChatCommandBuilder";
import { ROLES } from "../../globals";
import { useClient } from "../../hooks";
import { CommandScope } from "../../structs/GdayCommandBuilder";

const builder = new GdayChatCommandBuilder()
    .setName("eb")
    .setDescription(
        "Keep someone buttoned up tighter than a kangaroo's pouch during the event.",
    )
    .addUserOption((option) =>
        option
            .setName("user")
            .setDescription("User to event blocklist.")
            .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setScope(CommandScope.MAIN_GUILD)
    .setEphemeral(true);

useChatCommand(builder, async (interaction) => {
    const member = interaction.options.getMember("user");
    if (!(member instanceof GuildMember)) {
        throw new Error("Member is not a GuildMember");
    }
    await member.roles.add(ROLES.MAIN.event_blocklisted);
    const logChannel = await useClient().channels.fetch("1126077157895053312");
    if (logChannel?.isTextBased()) {
        await logChannel.send({
            content: `${interaction.user} event blocklisted ${member}`,
            allowedMentions: { parse: [] },
        });
    }
    return `Event blocklisted ${member}`;
});
