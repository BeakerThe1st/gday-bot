import { Guild, GuildBan, inlineCode, RESTJSONErrorCodes, User } from "discord.js";
import { useClient } from "../../hooks";
import { GByeConfig } from "./GByeConfig.model";

export const gByeGuilds = [
    "332309672486895637", // r/Apple
    "950207745250979860", // iPhone | iOS
    "114407194971209731", // Droidcord
    "549448381613998103", // Samsung
    "871642313561096194", // Nashy cab
    "1041118987787972678", // G'day server
    "150662382874525696" // Microsoft Community
];

export const fetchGbyeBans = async (user: User) => {
    const bans: GuildBan[] = [];
    for (const gByeGuildId of gByeGuilds) {
        try {
            const guild = await useClient().client.guilds.fetch(gByeGuildId);
            const ban = await guild.bans.fetch(user);
            bans.push(ban);
        } catch (error: any) {
            if ("code" in error && error.code === RESTJSONErrorCodes.UnknownBan) {
                //ignored - they just aren't banned
            } else {
                console.error(`Error fetching G'bye bans in ${gByeGuildId}: ${error}`);
            }
        }
    }
    if (bans.length > 0) {
        return bans;
    }
    return null;
};

export const fetchGbyeBansString = async (user: User) => {
    const bans = await fetchGbyeBans(user);
    if (!bans) {
        return null;
    }

    const banStrings = bans.map((ban) => {
        const { reason, guild } = ban;
        const formattedReason = reason
            ? `for ${inlineCode(reason.replaceAll("\n", " "))}`
            : "- No reason specified.";
        return `\n- ${guild.name} ${formattedReason}`;
    });
    return banStrings.join(" ");
};

export const getGbyeChannel = async (guild: Guild) => {
    const config = await GByeConfig.findOne({ guild: guild.id });
    if (!config?.channel) {
        return null;
    }
    const channel = await useClient().client.channels.fetch(config.channel);
    if (!channel || !("send" in channel)) {
        return null;
    }
    return channel;
};
