import { model, Schema } from "mongoose";
import { useClient } from "../../hooks";
import { CHANNELS, GUILDS } from "../../globals";
import {
    ChannelType,
    Colors,
    EmbedBuilder,
    Snowflake,
    time,
    userMention,
} from "discord.js";
import { forwardModmailMessage } from "./modmail.listener";
import { RAppleUser } from "../rApple/RAppleUser.model";

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

    let rAppleUser = await RAppleUser.findOne({ userId: this.author });
    if (!rAppleUser) {
        rAppleUser = new RAppleUser({ userId: this.author });
    }
    rAppleUser.modmailThreadCount = rAppleUser.modmailThreadCount + 1;
    await rAppleUser.save();

    const channel = await staffServer.channels.create({
        name: resolvedAuthor.username,
        type: ChannelType.GuildText,
        parent: CHANNELS.STAFF.modmail_parent,
    });
    const embed = new EmbedBuilder()
        .setTitle(`New thread for ${resolvedAuthor.username}`)
        .setDescription(
            `${userMention(resolvedAuthor.id)} (${resolvedAuthor.username})
            Account Created: ${time(resolvedAuthor.createdAt)}
            ${rAppleUser.modmailThreadCount === 1 ? `This is their first thread.` : `User has previously had ${rAppleUser.modmailThreadCount - 1} other thread(s)`}`,
        )
        .setColor(Colors.Aqua);
    await channel.send({
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
            this.initialMessage as Snowflake,
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
