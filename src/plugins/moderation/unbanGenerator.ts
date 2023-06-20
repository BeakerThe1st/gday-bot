import { User, UserResolvable } from "discord.js";
import { useClient } from "../../hooks";
import { Case, CaseType } from "../cases/Case.model";

export const unbanWithBlame = (async (executor: User, targetId: UserResolvable, reason?: String) => {
    const {client} = useClient();
    const rApple = await client.guilds.fetch("332309672486895637");
    const target = await client.users.fetch(targetId);
    const ban = rApple.bans.fetch(targetId);
    if (!ban) {
        return;   
    }
    await rApple.members.unban(target);
    const generatedCase = await Case.create({
        type: CaseType.UNBAN,
        guild: "332309672486895637",
        deleted: false,
        target: target.id,
        executor: executor.id,
        duration: undefined, // Unbans are not meant to have a duration
        reason: reason ?? "No reason provided.",
    })
});