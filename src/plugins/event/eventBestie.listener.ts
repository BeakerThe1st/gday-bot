import { Typing } from "discord.js";
import { useEvent } from "../../hooks";
import { GUILDS, NEXT_EVENT, ROLES } from "../../globals";

useEvent("typingStart", async (typing: Typing) => {
    if (!NEXT_EVENT) {
        return;
    }

    //1 day before event, cut it off
    if (Date.now() > NEXT_EVENT.timestamp - 86400000) {
        return;
    }

    if (typing.guild?.id !== GUILDS.MAIN) {
        return;
    }

    if (!typing.member) {
        return;
    }
    const { roles } = typing.member;
    if (!roles.cache.has(ROLES.MAIN.event_reserved)) {
        await roles.add(ROLES.MAIN.event_reserved);
    }
});
