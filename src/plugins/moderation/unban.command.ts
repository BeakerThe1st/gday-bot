import { PermissionFlagsBits } from "discord.js";
import { GdayChatCommandBuilder } from "../../structs/GdayChatCommandBuilder";
import { useChatCommand } from "../../hooks/";
import { CommandScope } from "../../structs/GdayCommandBuilder";

const builder = new GdayChatCommandBuilder()
    .setName("unban")
    .setDescription(
        "Gives a user a fair go by unbanning them with the given ID, everyone deserves a second chance.",
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setScope(CommandScope.MAIN_GUILD)
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
    );
useChatCommand(builder as GdayChatCommandBuilder, async (interaction) => {
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
