import {
  bold,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  userMention,
} from "discord.js";
import {
  SlashCommandBuilder,
  SlashCommandScope,
} from "../builders/SlashCommandBuilder";
import { Case, CaseType } from "../database/Case";
import { useChatCommand } from "./../hooks/useChatCommand";

const builder = new SlashCommandBuilder()
  .setName("cases")
  .setDescription(
    "Searches all cases in the guild, filtered by the given parameters."
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
  .setScope(SlashCommandScope.MAIN_GUILD)
  .addUserOption((option) =>
    option.setName("executor").setDescription("Case executor.")
  )
  .addUserOption((option) =>
    option.setName("target").setDescription("Case target.")
  )
  .addStringOption((option) =>
    option
      .setName("type")
      .setDescription("Case type.")
      .setChoices(
        { name: "Warn", value: "WARN" },
        { name: "Ban", value: "BAN" },
        { name: "Kick", value: "KICK" },
        { name: "Timeout", value: "TIMEOUT" }
      )
  );

useChatCommand(
  builder as SlashCommandBuilder,
  async (interaction: ChatInputCommandInteraction) => {
    let filter = {};
    const executor = interaction.options.getUser("executor");
    const target = interaction.options.getUser("target");
    const type = interaction.options.getString("type");
    if (executor) {
      filter = { ...filter, executor: executor.id };
    }
    if (target) {
      filter = { ...filter, target: target.id };
    }
    if (type) {
      filter = { ...filter, type: type };
    }
    const count = await Case.count(filter);

    if (count < 1) {
      return `There are no cases that match your search query! 🤠`;
    }
    const results = await Case.find(filter)
      .sort({ createdAtTimestamp: "desc" })
      .limit(6);

    const resultsList = results.reduce((acc, result) => {
      let currentStr = `${bold(result._id)} - ${result.type} on ${userMention(
        result.target
      )}`;
      if (result.executor) {
        currentStr += ` by ${userMention(result.executor)}`;
      }
      if (result.reason) {
        currentStr += ` for ${result.reason}`;
      }
      return acc + `\n${currentStr}.`;
    }, "");

    return `I found ${count.toLocaleString()} cases that match what you're looking for. ${
      count > 6 ? "Here are the latest 6!" : "Here they are!"
    } \n${resultsList}`;
  }
);
