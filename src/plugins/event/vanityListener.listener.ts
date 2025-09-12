import { Typing } from "discord.js";
import { useEvent } from "../../hooks";
import { VANITY_EVENT, GUILDS } from "../../globals";

useEvent("typingStart", async (typing: Typing) => {
    if (!VANITY_EVENT) {
        return;
    }

    if (typing.guild?.id !== GUILDS.MAIN) {
        return;
    }

    if (!typing.member) {
        return;
    }

    if (typing.channel?.id !== VANITY_EVENT.channelId) { 
        return
    }

    const now = Date.now();
    if (now < VANITY_EVENT.startTime || now > VANITY_EVENT.endTime) return;

    const { roles } = typing.member;

    if (!roles.cache.has(VANITY_EVENT.roleId)) {
        try {
        await roles.add(VANITY_EVENT.roleId);
        } catch (err) {
        console.error("Failed to add vanity role:", err);
        }
    }
});
