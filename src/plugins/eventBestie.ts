import {MAIN_GUILD_ID, NEXT_EVENT} from "../globals";
import {Typing} from "discord.js";
import {useEvent} from "../hooks";

useEvent("typingStart", async (typing: Typing) => {
    if (!NEXT_EVENT) {
        return;
    }

    //1 day before event, cut it off
    if (Date.now() > NEXT_EVENT.timestamp - 86400000) {
        return;
    }

    if (typing.guild?.id !== MAIN_GUILD_ID) {
        return;
    }

    const roleId = "1110545998377406484";

    if (!typing.member) {
        return;
    }
    const {roles} = typing.member;
    if (!roles.cache.has(roleId)) {
        await roles.add(roleId);
    }
});
