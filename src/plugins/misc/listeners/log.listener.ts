import {useEvent} from "../../../hooks";
import {codeBlock, Events, Guild, GuildAuditLogsEntry, userMention} from "discord.js";
import {CHANNELS, GUILDS} from "../../../globals";

useEvent(Events.GuildAuditLogEntryCreate, async (entry: GuildAuditLogsEntry, guild: Guild) => {
    if (guild.id !== GUILDS.MAIN) {
        return;
    }
    const logChannel = await guild.channels.fetch(CHANNELS.MAIN.log);
    if (logChannel?.isTextBased()) {
        logChannel.send(`${entry.action}\n${codeBlock("json", JSON.stringify(entry, null, 2))}`)
    }
})