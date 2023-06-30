import {useClient, useEvent} from "../../hooks";
import {Events, GuildBan, GuildMember, inlineCode} from "discord.js";
import {fetchGbyeBans, fetchGbyeBansString, gByeGuilds, getGbyeChannel} from "./gBye";
useEvent(Events.GuildBanAdd, async (ban: GuildBan) => {
    const {user, guild: txGuild, reason} = ban;
    if (!gByeGuilds.includes(txGuild.id)) {
        return; //not a g'bye guild - we don't care about this ban
    }
    for (const gByeGuildId of gByeGuilds) {
        try {
            const rxGuild = await useClient().client.guilds.fetch(gByeGuildId);
            //This line verifies they are in fact in the guild
            await rxGuild.members.fetch(user);
            const channel = await getGbyeChannel(rxGuild);
            await channel?.send({content: `# G'bye \n${user} was banned from ${txGuild.name}${reason ? ` for ${inlineCode(reason)}` : `. No reason specified`}.`, allowedMentions: { parse: []}});
        } catch {
            //ignored - they or we aren't in guild
        }
    }
});

useEvent(Events.GuildMemberAdd, async (member: GuildMember) => {
    if (!gByeGuilds.includes(member.guild.id)) {
        return;
    }
    const bans = await fetchGbyeBans(member.user);
    if (!bans) {
        return;
    }
    const channel = await getGbyeChannel(member.guild);
    await channel?.send({content: `# G'bye \n${member} just joined your server, they are banned in:\n${await fetchGbyeBansString(member.user)}`, allowedMentions: {parse: []}});
})