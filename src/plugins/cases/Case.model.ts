import {model, Schema} from "mongoose";
import cryptoRandomString from "crypto-random-string";
import {useClient} from "../../hooks";
import {EmbedBuilder, time, TimestampStyles, userMention,} from "discord.js";

export enum CaseType {
    WARN = "WARN",
    BAN = "BAN",
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

caseSchema.pre("save", async function () {
    if (!this.isNew) return;
    if (this.guild !== "332309672486895637") return;
    const channel = await useClient().client.channels.fetch(
        "1033960979224088596"
    );
    if (channel?.isTextBased()) {
        const embed = new EmbedBuilder()
            .setTitle("✅ New Case Generated")
            .addFields({name: "Type", value: this.type, inline: true})
            .setColor("Fuchsia")
            .setFooter({text: this._id});
        if (this.duration) {
            embed.addFields({
                name: "Expiry",
                value: time(
                    new Date(+this.createdAtTimestamp + this.duration),
                    TimestampStyles.RelativeTime
                ),
                inline: true,
            });
        }
        embed.addFields({
            name: "Target",
            value: userMention(this.target),
            inline: true,
        });
        if (this.executor) {
            embed.addFields({
                name: "Executor",
                value: userMention(this.executor),
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
