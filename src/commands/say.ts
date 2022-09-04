import {
  ChatInputCommandInteraction,
  inlineCode,
  PermissionFlagsBits,
} from "discord.js";
import {
  SlashCommandBuilder,
  SlashCommandScope,
} from "../builders/SlashCommandBuilder";
import { useChatCommand } from "../hooks/useChatCommand";

const builder = new SlashCommandBuilder()
  .setName("say")
  .setDescription("Make G'day say a message.")
  .addStringOption((option) =>
    option.setName("message").setDescription("Message to say").setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .setEphemeral(true)
  .setScope(SlashCommandScope.GLOBAL);

useChatCommand(builder, async (interaction: ChatInputCommandInteraction) => {
  const message = interaction.options.getString("message", true);
  if (!interaction.channel) {
    throw new Error("Channel undefined.");
  }
  await interaction.channel.send({
    content: message,
    allowedMentions: {
      parse: ["users"],
    },
  });
  return `Said ${inlineCode(message)} in ${interaction.channel}`;
});
