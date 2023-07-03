import {model, Schema} from "mongoose";
import cryptoRandomString from "crypto-random-string";
import {useClient} from "../../hooks";
import {EmbedBuilder, inlineCode, time, TimestampStyles, userMention} from "discord.js";
import {CHANNELS, GUILDS} from "../../globals";

export enum CaseType {
    WARN = "WARN",
    BAN = "BAN",
    UNBAN = "UNBAN",
    KICK = "KICK",
    TIMEOUT = "TIMEOUT",
}

export interface ICase {
    _id: string;
    type: CaseType;
    guild: string;
    deleted: boolean;
    target: string;
    executor?: string;
    duration?: number;
    reason?: string;
    createdAtTimestamp: string;
    userNotified: boolean;
}

const caseSchema = new Schema<ICase>({
    _id: String,
    type: {type: String, enum: CaseType},
    guild: {type: String, required: true},
    deleted: {
        type: Boolean,
        default: false,
    },
    target: {type: String, required: true},
    executor: String,
    duration: Number,
    reason: String,
    createdAtTimestamp: {
        type: String,
        default: function () {
            return Date.now().toString();
        },
    },
    userNotified: Boolean,
});

//ID creation middleware
caseSchema.pre("save", async function () {
    if (!this.isNew) return;
    let id;
    do {
        id = cryptoRandomString({length: 10, type: "distinguishable"});
    } while (await Case.findById(id));
    this._id = id;
});

//DM the user to tell them

const friendlyNames = new Map<CaseType, string>();
friendlyNames.set(CaseType.TIMEOUT, "timed out in");
friendlyNames.set(CaseType.BAN, "banned from");
friendlyNames.set(CaseType.KICK, "kicked from");
friendlyNames.set(CaseType.WARN, "warned in");
friendlyNames.set(CaseType.UNBAN, "unbanned from");
caseSchema.pre("save", async function () {
    if (!this.isNew) return;
    try {
        const user = await useClient().client.users.fetch(this.target);
        const guild = await useClient().client.guilds.fetch(this.guild);
        await user.send(`You have been ${friendlyNames.get(this.type)} ${guild.name}${this.reason ? ` for ${inlineCode(this.reason)}` : ""}.${this.duration ? ` Expiry: ${time(new Date(parseInt(this.createdAtTimestamp) + this.duration), TimestampStyles.RelativeTime)}` : ""}`);
        this.userNotified = true;
    } catch {
        this.userNotified = false;
    }
});

const getUsernameFromId = async (id: string) => {
    try {
        const user = await useClient().client.users.fetch(id);
        return user.username;
    } catch {
        return null;
    }
}

//Logging middleware
caseSchema.pre("save", async function () {
    if (!this.isNew) return;
    if (this.guild !== GUILDS.MAIN) return;
    const channel = await useClient().client.channels.fetch(
        CHANNELS.MAIN.case_log,
    );
    if (channel?.isTextBased()) {
        const embed = new EmbedBuilder()
            .setTitle("✅ New Case Generated")
            .addFields({name: "Type", value: this.type, inline: true})
            .setColor("Fuchsia")
            .setFooter({text: `${this._id} • ${this.userNotified ? "User has been notified" : "User has not been notified"}`});
        if (this.duration) {
            embed.addFields({
                name: "Expiry",
                value: time(
                    new Date(+this.createdAtTimestamp + this.duration),
                    TimestampStyles.RelativeTime,
                ),
                inline: true,
            });
        }
        embed.addFields({
            name: "Target",
            value: `${userMention(this.target)} (${await getUsernameFromId(this.target)})`,
            inline: true,
        });
        if (this.executor) {
            embed.addFields({
                name: "Executor",
                value: `${userMention(this.executor)} (${await getUsernameFromId(this.executor)}`,
                inline: true,
            });
        }
        embed.addFields({
            name: "Reason",
            value: this.reason ?? "No reason specified.",
        });
        channel.send({content: this._id, embeds: [embed]});
    }
});

export const Case = model<ICase>("Case", caseSchema);
