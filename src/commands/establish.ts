import {SlashCommandBuilder, SlashCommandScope} from "../builders/SlashCommandBuilder";
import {ChatInputCommandInteraction, GuildMember, PermissionFlagsBits} from "discord.js";
import {useChatCommand} from "../hooks/useChatCommand";
import {ROLES} from "../globals";

const builder: SlashCommandBuilder = new SlashCommandBuilder()
    .setName("establish")
    .setDescription("Gives a user image perms via the established role")
    .addUserOption((option) =>
        option
            .setName("user")
            .setDescription("User to establish")
            .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setScope(SlashCommandScope.MAIN_GUILD);

useChatCommand(builder, async (interaction:ChatInputCommandInteraction) => {
   const member = interaction.options.getMember("user");
   if (!(member instanceof GuildMember)) {
       throw new Error("User is not a GuildMember");
   }
   if (member.roles.cache.has(ROLES.established)) {
       return `${member} is already established!`
   }
   await member.roles.add(ROLES.established);
   return `Successfully established ${member}.`
});