import {AuditLogEvent, Events, Guild, GuildAuditLogsEntry, GuildBan, GuildMember, PartialGuildMember} from "discord.js";
import {useEvent} from "../../hooks";
import {Case, CaseType, ICase} from "./Case.model";

const fetchLogEntry = async (
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
/*useEvent(Events.GuildBanRemove, async (ban: GuildBan) => {
  //ignore unban at this stage?
  const log = await fetchLogEntry(
    ban.guild,
    ban.user.id,
    AuditLogEvent.MemberBanRemove
  );
});*/

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
);

const generateCase = (
    type: CaseType,
    guild: Guild,
    log: GuildAuditLogsEntry,
    options?: Partial<ICase>
) => {
    if (!log.target || !log.executor || !("id" in log.target)) {
        throw new Error("Must have target and executor to generate case.");
    }
    return Case.create({
        ...{
            type,
            guild: guild.id,
            target: log.target?.id,
            executor: log.executor?.id,
            reason: log.reason ?? undefined,
        },
        ...options,
    });
};
