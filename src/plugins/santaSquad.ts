import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import {
  SlashCommandBuilder,
  SlashCommandScope,
} from "../builders/SlashCommandBuilder";
import { useChatCommand } from "../hooks/useChatCommand";

const builder = new SlashCommandBuilder()
  .setName("sendSantaApplication")
  .setDescription("Send santa application")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .setScope(SlashCommandScope.MAIN_GUILD);

useChatCommand(builder, async (interaction: ChatInputCommandInteraction) => {
  const { channel } = interaction;
  const actionRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("Apply for Santa Squad")
      .setEmoji("🎅")
      .setStyle(ButtonStyle.Primary)
      .setCustomId(`santa-apply`)
  );
  if (channel) {
    //@ts-ignore
    channel.send({ components: [actionRow] });
  } else {
    throw new Error("Bad channel");
  }
  return "Sent.";
});
