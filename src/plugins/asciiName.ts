import { MAIN_GUILD_ID, NEXT_EVENT } from "../globals";
import {
  bold,
  EmbedBuilder,
  GuildMember,
  Message,
  PartialGuildMember,
  Typing,
} from "discord.js";
import { useEvent } from "../hooks";
import ASCIIFolder from "fold-to-ascii";

useEvent(
  "guildMemberUpdate",
  async (
    _oldMember: GuildMember | PartialGuildMember,
    member: GuildMember | PartialGuildMember
  ) => {
    await validateNickname(member);
  }
);

useEvent("guildMemberAdd", async (member: GuildMember | PartialGuildMember) => {
  await validateNickname(member);
});

useEvent("messageCreate", async (message: Message) => {
  if (!message.author.bot && message.member) {
    await validateNickname(message.member);
  }
});

const validateNickname = async (member: GuildMember | PartialGuildMember) => {
  if (!member.nickname) {
    return;
  }
  let foldedNickname = ASCIIFolder.foldReplacing(member.nickname);
  if (foldedNickname === member.nickname) {
    return;
  }
  if (foldedNickname.replaceAll(/\s/g, "").length < 1) {
    foldedNickname = `G'day Victim #${Math.floor(1000 + Math.random() * 9000)}`;
  }
  await member.setNickname(foldedNickname.substring(0, 32), "Illegal Nickname");
  const notificationEmbed = new EmbedBuilder()
    .setAuthor({
      name: member.guild.name,
      iconURL: member.guild.iconURL() ?? undefined,
    })
    .setTitle("Nickname Changed")
    .setDescription(
      `Your display name was found to violate server rules. Your nickname was changed to **${bold(
        foldedNickname
      )}**.`
    )
    .setColor("Red");

  await member.send({
    embeds: [notificationEmbed],
  });
};
