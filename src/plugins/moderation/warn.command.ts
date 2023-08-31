import {SlashCommandBuilder, SlashCommandScope} from "../../builders/SlashCommandBuilder";
import {ChatInputCommandInteraction, inlineCode, PermissionFlagsBits} from "discord.js";
import {useChatCommand} from "../../hooks/useChatCommand";
import {Case, CaseType} from "../cases/Case.model";

const builder = new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warns user.")
    .addUserOption((option) =>
        option.setName("user").setDescription("User to be warned.").setRequired(true)
    )
    .addStringOption((option) =>
        option.setName("reason").setDescription("Reason for the warning.").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setEphemeral(true)
    .setScope(SlashCommandScope.MAIN_GUILD);

useChatCommand(builder, async (interaction: ChatInputCommandInteraction) => {
    const target = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason", true);
    await Case.create({
        type: CaseType.WARN,
        guild: interaction.guildId,
        deleted: false,
        target: target.id,
        executor: interaction.user.id,
        reason,
    })
    return `Warned ${target} for ${inlineCode(reason)}`;
})