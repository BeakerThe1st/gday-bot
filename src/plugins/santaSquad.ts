import { useEvent } from "./../hooks/useEvent";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  Embed,
  EmbedBuilder,
  GuildMember,
  Interaction,
  PermissionFlagsBits,
  userMention,
} from "discord.js";
import {
  SlashCommandBuilder,
  SlashCommandScope,
} from "../builders/SlashCommandBuilder";
import { useChatCommand } from "../hooks/useChatCommand";
import { useClient } from "../hooks";

const builder = new SlashCommandBuilder()
  .setName("sendsanta")
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
    channel.send({
      content:
        "**Please read the information above before applying for Santa Squad.**",
      //@ts-ignore
      components: [actionRow],
    });
  } else {
    throw new Error("Bad channel");
  }
  return "Sent.";
});

useEvent("interactionCreate", async (interaction: Interaction) => {
  if (!interaction.isButton()) {
    return;
  }

  if (interaction.customId !== "santa-apply") {
    return;
  }
  try {
    const apps = await interaction.client.channels.fetch("1045659665771540511");
    if (!(interaction.member instanceof GuildMember)) {
      throw new Error("You are not a member!?!?");
    }
    if (!apps?.isTextBased()) {
      throw new Error("Bad Apps Channel");
    }
    const embed = new EmbedBuilder()
      .setTitle(interaction.user.tag)
      .setColor("Red")
      .setDescription(
        `${userMention(
          interaction.user.id
        )} Ho ho ho sleigh queens! Please only accept if the santa hat is recognisable and visible.`
      )
      .setThumbnail(interaction.member.displayAvatarURL());
    const actionRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Accept")
        .setEmoji("🎅")
        .setStyle(ButtonStyle.Primary)
        .setCustomId(`santa-accept-${interaction.user.id}`),
      new ButtonBuilder()
        .setLabel("Deny")
        .setStyle(ButtonStyle.Danger)
        .setCustomId(`santa-deny-${interaction.user.id}`)
    );
    //@ts-ignore
    await apps.send({ embeds: [embed], components: [actionRow] });
  } catch (error) {
    await interaction.reply({
      ephemeral: true,
      content: `Error processing your Santa Squad application! Please DM ModMail. Error: ${error}`,
    });
    return;
  }

  await interaction.reply({
    ephemeral: true,
    content:
      "Thanks for applying for Santa Squad! Please wait patiently for us to review your application! 💪🎅",
  });
});

useEvent("interactionCreate", async (interaction: Interaction) => {
  if (!interaction.isButton()) {
    return;
  }
  const [c1, c2, c3] = interaction.customId.split("-");
  if (c1 !== "santa" || !["accept", "deny"].includes(c2)) {
    return;
  }
  try {
    const member = await interaction.guild?.members.fetch(c3);
    if (!member) {
      throw new Error("No member");
    }
    if (interaction.channel?.isTextBased()) {
      interaction.channel.send(
        `${interaction.user} ${c2 === "accept" ? "accepted" : "denied"} ${
          member.user
        } for Santa Squad.`
      );
    }

    await interaction.message.delete();
    if (c2 === "accept") {
      await member.roles.add("1045677894757789696");
    } else {
      try {
        await member.user.send(
          "Your Santa Squad application in r/Apple was denied. Please ensure you have a visible and recognisible santa hat in your profile and re-apply. If you changed your profile picture immediately before applying, please wait before applying again as sometimes Discord can take a while to update profile pictures. If you have any further questions, please read the info provided in the channel and then feel free to contact staff about why your application was denied."
        );
      } catch {
        `${member} was denied from Santa Squad but I was unable to DM them. Please contact them directly.`;
      }
    }
  } catch (error) {
    await interaction.reply(`Error ${error}. Please tell Beaker.`);
  }
});
