import {
    ButtonStyle,
    EmbedBuilder,
    inlineCode,
    time,
    userMention,
} from "discord.js";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { useClient } from "../../hooks";
import { GdayButtonBuilder } from "../../structs/GdayButtonBuilder";
import { Case } from "../cases/Case.model";
import { CHANNELS, GUILDS } from "../../globals";

const app = express();

app.use(cors());
app.use(morgan("combined"));
app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json("Hello World!");
});

app.get("/guild-info", async (req, res) => {
    const guild = await useClient().guilds.fetch("332309672486895637");

    res.status(200).json({
        iconURL: guild.iconURL({ size: 128 }),
        members: guild.memberCount,
        bannerURL: guild.bannerURL({ size: 2048 }),
    });
});

app.post("/ban-appeal", async (req, res) => {
    const { tag, id, reason } = req.body;
    if (!(tag && id && reason)) {
        return res.status(400).json({
            error: "Missing required parameters",
        });
    }
    try {
        const appealChannel = await useClient().channels.fetch(
            CHANNELS.STAFF.appeals,
        );
        const rApple = await useClient().guilds.fetch(GUILDS.MAIN);
        const ban = await rApple.bans.fetch(id);
        const banCase = await Case.findOne({
            target: id,
            guild: GUILDS.MAIN,
            type: "BAN",
            deleted: false,
        });
        if (!appealChannel || !appealChannel.isTextBased()) {
            throw new Error("Could not find appeal channel");
        }
        const embed = new EmbedBuilder()
            .setTitle("Ban Appeal")
            .setDescription(`${userMention(id)}`)
            .setColor("Blue")
            .addFields({ name: "User", value: `${tag} (${id})`, inline: true });
        if (banCase) {
            embed.addFields({
                name: "Fetched Ban Case",
                value: `${inlineCode(banCase._id)} by ${banCase.executor ? userMention(banCase.executor) : "Unknown"} for ${banCase.reason ?? "No reason specified"} at ${time(Math.round(+banCase.createdAtTimestamp / 1000))}`,
            });
        } else {
            embed.addFields({
                name: "Fetched Reason",
                value: ban.reason ?? "None",
                inline: true,
            });
        }
        embed.addFields({ name: "Argument", value: reason });
        embed.setFooter({
            text: `User has ${await Case.count({
                target: id,
                guild: GUILDS.MAIN,
                deleted: false,
            })} total case(s)`,
        });
        await appealChannel.send({
            content: `${id}`,
            embeds: [embed],
            components: [
                new GdayButtonBuilder("appeal:unban")
                    .setLabel("Unban")
                    .setStyle(ButtonStyle.Success)
                    .addArg(id)
                    .asActionRow(),
            ],
            allowedMentions: {
                users: [],
            },
        });
        return res.status(200).json("Submitted appeal");
    } catch (error: any) {
        if (error.code === 50035) {
            return res.status(400).json({
                error: `${id} is not a valid user ID. Read the instructions to learn where to find your user ID.`,
            });
        } else if (error.code === 10026) {
            return res.status(400).json({
                error: "You are not banned from r/Apple. Ensure your user ID is correct.",
            });
        } else {
            console.error(error);
            return res.status(500).json({
                error: `An unexpected error occurred while submitting the ban appeal. (${
                    error.code ?? error.message ?? error
                })`,
            });
        }
    }
});

const port = process.env.PORT || 3001;
app.listen(port);
