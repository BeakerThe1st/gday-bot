import { EmbedBuilder, MessageCreateOptions } from "discord.js";
import { useClient } from "../../hooks";

export enum LOG_THREADS {
    ROLE = "1126077128677523536",
    DELETION = "1126077258436722768",
    EDIT = "1126077292024713266",
    JOIN_LEAVE = "1126077595658756096",
    NICKNAME = "1128915824200142888",
}

type LogItem = EmbedBuilder | MessageCreateOptions;

export const log = async (thread: LOG_THREADS, item: LogItem) => {
    if (process.env.NODE_ENV === "development") {
        console.log(`Ignored logging bound for ${thread}`);
        return;
    }
    const channel = await useClient().channels.fetch(thread);
    if (item instanceof EmbedBuilder) {
        item = { embeds: [item] };
    }
    if (channel?.isTextBased()) {
        await channel.send(item);
    } else {
        throw new Error(`${thread} is not a valid log thread.`);
    }
};
