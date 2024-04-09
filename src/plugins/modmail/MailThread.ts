import { model, Schema } from "mongoose";
import { useClient } from "../../hooks";
import { CHANNELS, GUILDS } from "../../globals";
import {
    ChannelType,
    Colors,
    EmbedBuilder,
    time,
    userMention,
} from "discord.js";
import { forwardModmailMessage } from "./modmail.listener";

export interface IMailThread {
    author: string;
    channel: string;
    initialMessage: string;
}

const mailThreadSchema = new Schema<IMailThread>({
    author: String,
    channel: String,
    initialMessage: String,
});

mailThreadSchema.pre("save", async function () {
    if (!this.isNew) return;
    const { client } = useClient();
    const staffServer = await client.guilds.fetch(GUILDS.STAFF);
    const resolvedAuthor = await client.users.fetch(this.author);
    const channel = await staffServer.channels.create({
        name: resolvedAuthor.username,
        type: ChannelType.GuildText,
        parent: CHANNELS.STAFF.modmail_parent,
    });
    const embed = new EmbedBuilder()
        .setTitle(`New thread for ${resolvedAuthor.username}`)
        .setDescription(
            `${userMention(resolvedAuthor.id)} (${resolvedAuthor.username})\nAccount Created: ${time(resolvedAuthor.createdAt)}`,
        )
        .setColor(Colors.Aqua);
    channel.send({
        embeds: [embed],
        content: process.env.NODE_ENV === "development" ? "" : "@here",
        allowedMentions: { parse: ["everyone"] },
    });
    this.channel = channel.id;
});

mailThreadSchema.post("save", async function () {
    try {
        const resolvedAuthor = await useClient().client.users.fetch(
            this.author,
        );
        const initialMessage = await resolvedAuthor.dmChannel?.messages.fetch(
            this.initialMessage,
        );
        if (initialMessage) {
            await forwardModmailMessage(initialMessage);
        }
    } catch {
        console.log("errored");
        //ignored
    }
});

export const MailThread = model<IMailThread>("mailThread", mailThreadSchema);
