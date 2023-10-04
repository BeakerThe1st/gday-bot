import {ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, userMention} from "discord.js";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import {useClient} from "../../hooks";

const app = express();

app.use(cors());
app.use(morgan("combined"));
app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json("Hello World!");
});

app.get("/guild-info", async (req, res) => {
    const {client} = useClient();
    const guild = await client.guilds.fetch("332309672486895637");

    res.status(200).json({
        iconURL: guild.iconURL({size: 128}),
        members: guild.memberCount,
        bannerURL: guild.bannerURL({size: 2048}),
    });
});

app.post("/ban-appeal", async (req, res) => {
    const {tag, id, reason} = req.body;
    if (!tag || !id || !reason) {
        return res.status(400).json({
            error: "Missing required parameters",
        });
    }
    try {
        const {client} = useClient();
        const appealChannel = await client.channels.fetch("700365232542973979");
        const rApple = await client.guilds.fetch("332309672486895637");
        const ban = await rApple.bans.fetch(id);
        if (!appealChannel || !appealChannel.isTextBased()) {
            throw new Error("Could not find appeal channel");
        }
        const embed = new EmbedBuilder()
            .setTitle("Ban Appeal")
            .setDescription(`${userMention(id)}`)
            .setColor("Blue")
            .addFields(
                {name: "User", value: `${tag} (${id})`, inline: true},
                {
                    name: "Ban Reason",
                    value: ban.reason ?? "No reason found",
                    inline: true,
                },
                {
                    name: "Argument",
                    value: reason,
                },
            );
        const actionRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel("Thread")
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(`appeal-thread-${tag}-${id}`),
            new ButtonBuilder()
                .setLabel("Unban")
                .setStyle(ButtonStyle.Success)
                .setCustomId(`appeal-unban-${id}`),
        );
        await appealChannel.send({
            content: `${id}`,
            embeds: [embed],
            //@ts-ignore
            components: [actionRow],
            allowedMentions: {
                users: [],
            },
        });
        return res.status(200).json("Submitted appeal");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        if (error.code === 50035) {
            return res.status(400).json({
                error: `${id} is not a valid user ID. Read the instructions to learn where to find your user ID.`,
            });
        } else if (error.code === 10026) {
            return res.status(400).json({
                error:
                    "You are not banned from r/Apple. Ensure your user ID is correct.",
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
