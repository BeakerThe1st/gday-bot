import { useClient, useEvent } from "../../hooks";
import { AuditLogEvent, Events, Guild, GuildAuditLogsEntry, GuildMember, inlineCode, User } from "discord.js";
import { fetchGbyeBansString, gByeGuilds, getGbyeChannel } from "./gBye";

useEvent(
    Events.GuildAuditLogEntryCreate,
    async (entry: GuildAuditLogsEntry, txGuild: Guild) => {
        if (entry.action !== AuditLogEvent.MemberBanAdd) {
            return;
        }
        const { target: user, reason } = entry;
        if (!(user instanceof User)) {
            //Target is not a user
            return;
        }
        if (!gByeGuilds.includes(txGuild.id)) {
            return; //not a g'bye guild - we don't care about this ban
        }
        for (const gByeGuildId of gByeGuilds) {
            try {
                if (gByeGuildId == txGuild.id) {
                    //Continue to not broadcast in originating guild.
                    continue;
                }
                const rxGuild = await useClient().client.guilds.fetch(gByeGuildId);
                //This line verifies they are in fact in the guild
                await rxGuild.members.fetch(user);
                const channel = await getGbyeChannel(rxGuild);
                await channel?.send({
                    content: `# G'bye \n${user} (${user.username}) was banned from ${txGuild.name}${reason ? ` for ${inlineCode(reason)}` : `. No reason specified`}.`,
                    allowedMentions: { parse: [] }
                });
            } catch {
                //ignored - they or we aren't in guild
            }
        }
    }
);

useEvent(Events.GuildMemberAdd, async (member: GuildMember) => {
    if (!gByeGuilds.includes(member.guild.id)) {
        return;
    }
    const gByeBanString = await fetchGbyeBansString(member.user);
    if (!gByeBanString) {
        return;
    }
    const channel = await getGbyeChannel(member.guild);
    await channel?.send({
        content: `# G'bye \n${member} (${member.user.username}) just joined your server, they are banned in:\n${gByeBanString}`,
        allowedMentions: { parse: [] }
    });
});
