import {AuditLogEvent, codeBlock, Events, Guild, GuildAuditLogsEntry,} from "discord.js";
import {useClient, useEvent} from "../../hooks";
import {Case, CaseType, ICase} from "./Case.model";
import {CHANNELS, GUILDS} from "../../globals";

const actionsToCaseType = new Map<AuditLogEvent, CaseType>();

actionsToCaseType.set(AuditLogEvent.MemberKick, CaseType.KICK);
actionsToCaseType.set(AuditLogEvent.MemberBanAdd, CaseType.BAN);
actionsToCaseType.set(AuditLogEvent.MemberBanRemove, CaseType.UNBAN);
actionsToCaseType.set(AuditLogEvent.MemberUpdate, CaseType.TIMEOUT);
actionsToCaseType.set(AuditLogEvent.AutoModerationUserCommunicationDisabled, CaseType.TIMEOUT);

//This function returns the duration of a timeout, or undefined if there is no timeout
const getTimeoutExpiry = (entry: GuildAuditLogsEntry) => {
    for (const change of entry.changes) {
        if (change.key == "communication_disabled_until" && change.new) {
            return Date.parse(`${change.new}`);
        }
    }
}
useEvent(Events.GuildAuditLogEntryCreate, async (entry: GuildAuditLogsEntry, guild: Guild) => {
    if (guild.id !== GUILDS.MAIN) {
        return;
    }
    const caseType = actionsToCaseType.get(entry.action);
    if (!caseType) {
        //The action does not have a corresponding case type - we can just ignore it
        return;
    }

    let expiry;
    if (caseType == CaseType.TIMEOUT) {
        /*We've assumed it's a timeout when it could be any member update - getTimeoutExpiry will be undefined
            if it's not actually a timeout and will stop execution of this func
         */
        if (entry.action === AuditLogEvent.AutoModerationUserCommunicationDisabled) {
            //Expiry is in 1 hour (default for naughties violation in r/apple)
            expiry = Date.now() + 1000 * 60 * 60
        } else {
            //User initiated timeout - will have an expiry
            expiry = getTimeoutExpiry(entry);
        }
        //Finally if we did not get an expiry from default (automod did it) or entry (user did it), return as it is not actually a timeout
        if (!expiry) {
            return;
        }
    }

    const {executorId, targetId, reason} = entry;

    //If some kind of ID is missing, throw an error
    if (!(executorId && targetId)) {
        throw new Error("Missing an ID for case generation");
    }

    const generatedCase = await Case.create({
        type: caseType,
        guild: guild.id,
        deleted: false,
        target: targetId,
        executor: executorId,
        duration: expiry ?  expiry - Date.now() : undefined,
        reason,
    })
});

/*const fetchLogEntry = async (
    guild: Guild,
    targetId: string,
    event: AuditLogEvent
) => {
    const fetchedLogs = await guild.fetchAuditLogs({limit: 1, type: event});
    const log = fetchedLogs.entries.first();
    if (!log) {
        return null;
    }
    if (log.createdTimestamp < Date.now() - 1000) {
        return null;
    }
    const {target} = log;
    if (!target || !("id" in target)) {
        return null;
    }
    if (target.id === targetId) {
        return log;
    }
};

//Kick Listener
useEvent(
    Events.GuildMemberRemove,
    async (member: GuildMember | PartialGuildMember) => {
        const log = await fetchLogEntry(
            member.guild,
            member.id,
            AuditLogEvent.MemberKick
        );
        if (log) {
            generateCase(CaseType.KICK, member.guild, log);
        }
    }
);

//Ban Listener
useEvent(Events.GuildBanAdd, async (ban: GuildBan) => {
    const log = await fetchLogEntry(
        ban.guild,
        ban.user.id,
        AuditLogEvent.MemberBanAdd
    );
    if (log) {
        generateCase(CaseType.BAN, ban.guild, log);
    }
});

//Unban Listener
useEvent(Events.GuildBanRemove, async (ban: GuildBan) => {
  //ignore unban at this stage?
  const log = await fetchLogEntry(
    ban.guild,
    ban.user.id,
    AuditLogEvent.MemberBanRemove
  );
});

//Timeout Listener
useEvent(
    Events.GuildMemberUpdate,
    async (oldMember: GuildMember | PartialGuildMember, member: GuildMember) => {
        const log = await fetchLogEntry(
            member.guild,
            member.user.id,
            AuditLogEvent.MemberUpdate
        );
        if (!log) {
            return;
        }
        if (
            !oldMember.isCommunicationDisabled() &&
            member.isCommunicationDisabled()
        ) {
            generateCase(CaseType.TIMEOUT, member.guild, log, {
                duration: member.communicationDisabledUntilTimestamp - Date.now(),
            });
        } else if (
            oldMember.isCommunicationDisabled() &&
            !member.isCommunicationDisabled()
        ) {
            //Member was unmuted, ignore at this stage
        }
    }
);*/
