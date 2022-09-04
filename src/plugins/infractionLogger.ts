/*import {
  AuditLogEvent,
  Embed,
  EmbedBuilder,
  Guild,
  GuildAuditLogsEntry,
  GuildMember,
  Invite,
  PartialGuildMember,
} from "discord.js";
import { GuildBan } from "discord.js";
import { useClient } from "../hooks";
import { useEvent } from "./../hooks/useEvent";

useEvent("guildBanAdd", async (ban: GuildBan) => {
  logEvent(AuditLogEvent.MemberBanAdd, ban);
});

useEvent("guildBanRemove", async (ban: GuildBan) => {
  logEvent(AuditLogEvent.MemberBanRemove, ban);
});

useEvent(
  "guildMemberRemove",
  async (member: GuildMember | PartialGuildMember) => {
    logEvent(AuditLogEvent.MemberKick, member);
  }
);

useEvent(
  "guildMemberUpdate",
  async (
    oldMember: GuildMember | PartialGuildMember,
    newMember: GuildMember | PartialGuildMember
  ) => {
    const [oldComm, newComm] = [oldMember, newMember].map((member) =>
      member.isCommunicationDisabled()
    );
    if (oldComm === newComm) {
      return;
    }
    logEvent(AuditLogEvent.MemberUpdate, newMember);
  }
);

const fetchAuditLogEntry = async (
  type: AuditLogEvent,
  guild: Guild,
  targetId: string
) => {
  const entry = (
    await guild.fetchAuditLogs({ limit: 1, type })
  ).entries.first();
  if (!entry || !entry.target) {
    return;
  }
  if (entry.action === 22 && type === AuditLogEvent.MemberKick) {
    return;
  }
  if (entry.target instanceof Invite || entry.target.id !== targetId) {
    return;
  }
  return entry;
};

const getAuditActionTitle = (event: AuditLogEvent) => {
  switch (event) {
    case AuditLogEvent.MemberBanAdd:
      return "🔨 Member Banned";
    case AuditLogEvent.MemberBanRemove:
      return "🔨 Member Unbanned";
    case AuditLogEvent.MemberKick:
      return "👟 Member Kicked";
    default:
      return AuditLogEvent[event];
  }
};
const getAuditActionColour = (action: "Update" | "Create" | "Delete") => {
  switch (action) {
    case "Delete":
      return "Red";
    case "Create":
      return "Green";
    case "Update":
      return "Blue";
    default:
      return "White";
  }
};

const logEvent = async (
  type: AuditLogEvent,
  target: GuildBan | GuildMember
) => {
  if (target.guild.id !== "332309672486895637") {
    return;
  }
  const entry = await fetchAuditLogEntry(type, target.guild, target.user.id);
  if (!entry) {
    return;
  }
  const embed = new EmbedBuilder()
    .setTitle(getAuditActionTitle(type))
    .setColor(getAuditActionColour(entry.actionType))
    .addFields(
      { name: "Target", value: `${entry.target}` },
      { name: "Executor", value: `${entry.executor}` }
    );
  if (entry.reason) {
    embed.addFields({ name: "Reason", value: `${entry.reason}` });
  } else {
    embed.setFooter({ text: `No reason provided.` });
  }
  const logChannel = await useClient().client.channels.fetch(
    "1006469453187387432"
  );
  if (logChannel?.isTextBased()) {
    logChannel.send({ embeds: [embed] });
  }
};*/
