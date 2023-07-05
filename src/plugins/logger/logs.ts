import {Embed, EmbedBuilder} from "discord.js";
import {useClient} from "../../hooks";

export enum LOG_THREADS {
    ROLE = "1126064307214487602",
    DELETION = "1126064249035296879",
    EDIT = "1126064213207568416",
    JOIN_LEAVE = "1126064154730565693"
}

export const log = async (thread: LOG_THREADS, embed: EmbedBuilder) => {
    const channel = await useClient().client.channels.fetch(thread);
    if (channel?.isTextBased()) {
        await channel.send({embeds: [embed]});
    } else {
        throw new Error(`${thread} is not a valid log thread.`)
    }
}