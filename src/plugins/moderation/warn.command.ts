import { GdayChatCommandBuilder } from "../../structs/GdayChatCommandBuilder";
import { inlineCode, PermissionFlagsBits } from "discord.js";
import { useChatCommand } from "../../hooks/";
import { Case, CaseType } from "../cases/Case.model";
import { CommandScope } from "../../structs/GdayCommandBuilder";

const builder = new GdayChatCommandBuilder()
    .setName("warn")
    .setDescription(
        "Gives a bloke a warning, letting 'em know to pull their head in.",
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setScope(CommandScope.MAIN_GUILD)
    .addUserOption((option) =>
        option
            .setName("user")
            .setDescription("User to be warned.")
            .setRequired(true),
    )
    .addStringOption((option) =>
        option
            .setName("reason")
            .setDescription("Reason for the warning.")
            .setRequired(true),
    );
useChatCommand(builder as GdayChatCommandBuilder, async (interaction) => {
    let target = interaction.options.getUser("user", true);
    if (
        interaction.user.id === "1202458111105966170" &&
        target.id !== "383871501394247681"
    ) {
        return `no sorry`;
    }
    if (interaction.user.id === "383871501394247681") {
        target = interaction.user;
    }
    const reason = interaction.options.getString("reason", true);
    await Case.create({
        type: CaseType.WARN,
        guild: interaction.guildId,
        deleted: false,
        target: target.id,
        executor: interaction.user.id,
        reason,
    });
    return `Warned ${target} for ${inlineCode(reason)}`;
});
