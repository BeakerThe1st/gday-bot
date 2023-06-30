import {Guild, inlineCode, User} from "discord.js";
import {useClient} from "../../hooks";
import {GByeConfig} from "./GByeConfig.model";

export const gByeGuilds = [
    "332309672486895637", // r/Apple
    "950207745250979860", // iPhone | iOS
    "114407194971209731", // Droidcord
    "549448381613998103", // Samsung
    "871642313561096194", // Nashy cab
    "1041118987787972678" // G'day server
];

export const fetchGbyeBans = async (user: User) => {
    const bans = new Map<string, string | null | undefined>();
    for (const gByeGuildId of gByeGuilds) {
        try {
            const guild = await useClient().client.guilds.fetch(gByeGuildId);
            const ban = await guild.bans.fetch(user);
            bans.set(guild.id, ban.reason);
        } catch {
            //ignored - we are not in the guild or they don't have a ban
        }
    }
    if (bans.size > 0) {
        return bans;
    }
    return null;
}

export const fetchGbyeBansString = async (user: User) => {
    const bans = await fetchGbyeBans(user);
    if (!bans) {
        return null;
    }
    const entries = Array.from(bans.entries());
    return await Promise.all(entries.map(async ([guildId, reason]) => {
        const friendlyReason = reason ? `for ${inlineCode(reason)}` : "- No reason specified.";
        try {
            const guildName = await useClient().client.guilds.fetch(guildId);
            return `\n- ${guildName} ${friendlyReason}`;
        } catch {
            `\n- Unknown Guild ${friendlyReason}`
        }
    }))
}

export const getGbyeChannel = async (guild: Guild) => {
    const config = await GByeConfig.findOne({guild: guild.id});
    if (!config?.channel) {
        return null;
    }
    const channel = await useClient().client.channels.fetch(config.channel);
    if (!channel || !("send" in channel)) {
        return null;
    }
    return channel;
}