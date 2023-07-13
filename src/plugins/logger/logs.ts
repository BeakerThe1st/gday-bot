import {Embed, EmbedBuilder} from "discord.js";
import {useClient} from "../../hooks";

export enum LOG_THREADS {
    ROLE = "1126077128677523536",
    DELETION = "1126077258436722768",
    EDIT = "1126077292024713266",
    JOIN_LEAVE = "1126077595658756096",
    NICKNAME = "1128915824200142888"
}

export const log = async (thread: LOG_THREADS, embed: EmbedBuilder) => {
    const channel = await useClient().client.channels.fetch(thread);
    if (channel?.isTextBased()) {
        await channel.send({embeds: [embed]});
    } else {
        throw new Error(`${thread} is not a valid log thread.`)
    }
}