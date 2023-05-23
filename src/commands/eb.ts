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
    await member.roles.add("1013093153248641095");
    const logChannel = await member.client.channels.fetch("1015966536315445390");
    if (logChannel && logChannel.isTextBased()) {
        await logChannel.send({
            content: `${interaction.user} blocklisted ${member}`,
            allowedMentions: {},
        });
    }
    return `Event blocklisted ${member}`;
});
