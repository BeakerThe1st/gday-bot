import { MAIN_GUILD_ID } from "../globals";
import { Typing } from "discord.js";
import { useEvent } from "../hooks";

useEvent("typingStart", async (typing: Typing) => {
  if (typing.guild?.id !== MAIN_GUILD_ID) {
    return;
  }

  const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
  const { member } = typing;

  if (!member || !member.joinedTimestamp) {
    return;
  }
  if (member.joinedTimestamp > twentyFourHoursAgo) {
    return;
  }

  const roleId = "881503056091557978";

  const { roles } = member;
  if (!roles.cache.has(roleId)) {
    await roles.add(roleId);
  }
});
