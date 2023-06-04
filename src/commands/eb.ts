import {useChatCommand} from "../hooks/useChatCommand";
import {ChatInputCommandInteraction, GuildMember, PermissionFlagsBits,} from "discord.js";
import {SlashCommandBuilder, SlashCommandScope,} from "../builders/SlashCommandBuilder";

const builder = new SlashCommandBuilder()
    .setName("eb")
    .setDescription(
        "Event blocklists a user."
    )
    .addUserOption((option) =>
        option
            .setName("user")
            .setDescription(
                "User to event blocklist."
            )
            .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setScope(SlashCommandScope.MAIN_GUILD)
    .setEphemeral(true);

useChatCommand(builder, async (interaction: ChatInputCommandInteraction) => {
    const member = interaction.options.getMember("user");
    if (!(member instanceof GuildMember)) {
        throw new Error("Member is not a GuildMember");
    }
    await member.roles.add("1110551464394362921");
    const logChannel = await member.client.channels.fetch("1033960979224088596");
    if (logChannel?.isTextBased()) {
        await logChannel.send({
            content: `${interaction.user} event blocklisted ${member}`,
            allowedMentions: {parse: []}
        });
    }
    return `Event blocklisted ${member}`;
});
