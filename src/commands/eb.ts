import { useChatCommand } from "./../hooks/useChatCommand";
import {
  ChatInputCommandInteraction,
  GuildMember,
  PermissionFlagsBits,
} from "discord.js";
import {
  SlashCommandBuilder,
  SlashCommandScope,
} from "../builders/SlashCommandBuilder";

const builder = new SlashCommandBuilder()
  .setName("eb")
  .setDescription(
    "Event blocklists a user. DO NOT USE WITHOUT READING THE PIN IN #plus"
  )
  .addUserOption((option) =>
    option
      .setName("user")
      .setDescription(
        "User to event blocklist. DO NOT USE WITHOUT READING THE PIN IN #plus"
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
  return `Event blocklisted ${member}`;
});
