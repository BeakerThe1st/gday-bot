import {useEvent} from "../../../hooks";
import {AuditLogEvent, codeBlock, Events, Guild, GuildAuditLogsEntry} from "discord.js";
import {CHANNELS, GUILDS} from "../../../globals";

const excludedActions = [146, 144];
useEvent(Events.GuildAuditLogEntryCreate, async (entry: GuildAuditLogsEntry, guild: Guild) => {
    if (guild.id !== GUILDS.MAIN) {
        return;
    }
    if (excludedActions.includes(entry.action)) {
        return;
    }
    const logChannel = await guild.channels.fetch(CHANNELS.MAIN.log);
    if (logChannel?.isTextBased()) {
        logChannel.send(`${entry.action}\n${codeBlock("json", JSON.stringify(entry, null, 2))}`)
    }
})