import {ChatInputCommandInteraction, PermissionFlagsBits, userMention,} from "discord.js";
import {SlashCommandBuilder, SlashCommandScope,} from "../../../builders/SlashCommandBuilder";
import {useChatCommand} from "../../../hooks/useChatCommand";
import { Case, CaseType } from "../../cases/Case.model";
import { GUILDS } from "../../../globals";

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
    const reason = interaction.options.getString("reason", false);

    if (!interaction.guild) {
        throw new Error("This command has to be executed in a guild.");
    }
    const ban = await interaction.guild?.bans.fetch(uid);
    if (!ban) {
        return `The user ${uid} is not banned.` 
    }     
    await interaction.guild.members.unban(uid);
    if (interaction.guild.id === GUILDS.MAIN) {
        const generatedCase = await Case.create({
            type: CaseType.UNBAN,
            guild: interaction.guild?.id,
            deleted: false,
            target: uid,
            executor: interaction.user.id,
            duration: undefined, // Unbans are not meant to have a duration
            reason: reason ? reason : "No reason provided.",
        })
    }
    return `Successfully unbanned user ${userMention(uid)}`;  
});
