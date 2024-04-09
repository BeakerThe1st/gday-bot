import { ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";
import {
    SlashCommandBuilder,
    SlashCommandScope,
} from "../../builders/SlashCommandBuilder";
import { useChatCommand } from "../../hooks/useChatCommand";

const builder = new SlashCommandBuilder()
    .setName("unban")
    .setDescription(
        "Gives a user a fair go by unbanning them with the given ID, everyone deserves a second chance.",
    )
    .addUserOption((option) =>
        option
            .setName("user")
            .setDescription("User to unban")
            .setRequired(true),
    )
    .addStringOption((option) =>
        option
            .setName("reason")
            .setDescription("Reason for the unban")
            .setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setScope(SlashCommandScope.GLOBAL);

useChatCommand(builder, async (interaction) => {
    const user = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason");
    if (!interaction.guild) {
        throw new Error("This command can only be run in a guild.");
    }
    await interaction.guild.bans.remove(
        user,
        `${interaction.user.id}${reason ? ` ${reason}` : ""}`,
    );
    return `Unbanned ${user}.`;
});
