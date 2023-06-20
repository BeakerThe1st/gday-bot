import {ChatInputCommandInteraction, PermissionFlagsBits, userMention,} from "discord.js";
import {SlashCommandBuilder, SlashCommandScope,} from "../../builders/SlashCommandBuilder";
import {useChatCommand} from "../../hooks/useChatCommand";
import { Case, CaseType } from "../cases/Case.model";
import { GUILDS } from "../../globals";
import { unbanWithBlame } from "./unbanGenerator";

const builder = new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Unbans user with the given ID")
    .addStringOption((option) =>
        option.setName("user_id").setDescription("ID for the user to unban").setRequired(true)
    )
    .addStringOption((option) => 
        option.setName("reason").setDescription("Reason for the unban").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setScope(SlashCommandScope.GLOBAL);

useChatCommand(builder, async (interaction: ChatInputCommandInteraction) => {
    const uid = interaction.options.getString("user_id", true);
    const reason = interaction.options.getString("reason", false) ?? undefined;

    if (!interaction.guild) {
        throw new Error("This command has to be executed in a guild.");
    }
    unbanWithBlame(interaction.user, uid, reason);
    return `Successfully unbanned user ${userMention(uid)}`;  
});
