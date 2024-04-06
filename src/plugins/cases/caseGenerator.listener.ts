import {AuditLogEvent, Events, Guild, GuildAuditLogsEntry} from "discord.js";
import {useClient, useEvent} from "../../hooks";
import {Case, CaseType} from "./Case.model";
import {GUILDS} from "../../globals";

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
};
useEvent(Events.GuildAuditLogEntryCreate, async (entry: GuildAuditLogsEntry, guild: Guild) => {
    const {client} = useClient();
    let {executorId, reason} = entry;
    const {targetId} = entry;

    if (guild.id !== GUILDS.MAIN) {
        return;
    }
    const caseType = actionsToCaseType.get(entry.action);
    if (!caseType) {
        //The action does not have a corresponding case type - we can just ignore it
        return;
    }

    const gDayId = client.user?.id;

    if (entry.executorId === gDayId) {
        //If the case was by g'day it should have the user's id in the first word of the reason, otherwise we will keep it at g'day.
        const splitReason = reason?.split(" ");
        if (splitReason) {
            //Changes executor id to first word and changes reason to rest of the audit log entry reason.
            executorId = splitReason.shift() ?? gDayId;
            reason = splitReason.length > 0 ? splitReason.join(" ") : null;
        }
    }

    let expiry;
    if (caseType == CaseType.TIMEOUT) {
        /*We've assumed it's a timeout when it could be any member update - getTimeoutExpiry will be undefined
            if it's not actually a timeout and will stop execution of this func
         */
        if (entry.action === AuditLogEvent.AutoModerationUserCommunicationDisabled) {
            //Expiry is in 1 hour (default for naughties violation in r/apple)
            expiry = Date.now() + 1000 * 60 * 60;
        } else {
            //User initiated timeout - will have an expiry
            expiry = getTimeoutExpiry(entry);
        }
        //Finally if we did not get an expiry from default (automod did it) or entry (user did it), return as it is not actually a timeout
        if (!expiry) {
            return;
        }
    }

    //If some kind of ID is missing, throw an error
    if (!(executorId && targetId)) {
        throw new Error("Missing an ID for case generation");
    }

    await Case.create({
        type: caseType,
        guild: guild.id,
        deleted: false,
        target: targetId,
        executor: executorId,
        duration: expiry ? expiry - Date.now() : undefined,
        reason,
    });
});
