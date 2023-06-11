import {GUILDS, ROLES} from "../../../globals";
import {Typing} from "discord.js";
import {useEvent} from "../../../hooks";

useEvent("typingStart", async (typing: Typing) => {
    if (typing.guild?.id !== GUILDS.MAIN) {
        return;
    }

    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
    const {member} = typing;

    if (!member || !member.joinedTimestamp) {
        return;
    }
    if (member.joinedTimestamp > twentyFourHoursAgo) {
        return;
    }

    const {roles} = member;
    const established = ROLES.MAIN.established
    if (!roles.cache.has(established)) {
        await roles.add(established);
    }
});
