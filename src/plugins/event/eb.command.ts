import { useChatCommand } from "../../hooks/useChatCommand";
import { GuildMember, PermissionFlagsBits } from "discord.js";
import {
    SlashCommandBuilder,
    SlashCommandScope,
} from "../../structs/SlashCommandBuilder";
import { GUILDS, ROLES } from "../../globals";
import { useClient } from "../../hooks";

const builder = new SlashCommandBuilder()
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
    .setScope(SlashCommandScope.MAIN_GUILD)
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
