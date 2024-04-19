import { useChatCommand } from "../../hooks/useChatCommand";
import { GuildMember, PermissionFlagsBits } from "discord.js";
import {
    SlashCommandBuilder,
    SlashCommandScope,
} from "../../structs/SlashCommandBuilder";

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
    await member.roles.add("1166975967433080894");
    const logChannel = await member.client.channels.fetch(
        "1168668680075366420",
    );
    if (logChannel?.isTextBased()) {
        await logChannel.send({
            content: `${interaction.user} event blocklisted ${member}`,
            allowedMentions: { parse: [] },
        });
    }
    return `Event blocklisted ${member}`;
});
