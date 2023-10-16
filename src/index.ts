import {useClient, useEnv, useEvent} from "./hooks";
import "./env";
import fs from "fs";
import path from "path";
import {ActivityType, Client, GatewayIntentBits, Partials} from "discord.js";
import mongoose from "mongoose";

const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildBans,
    ],
    allowedMentions: {
        parse: ["users"],
    },
    partials: [Partials.GuildMember, Partials.Channel],
});
useClient().setClient(client);
const loadFilesFromFolder = (folder: string) => {
    const folderUrl = new URL(folder, import.meta.url);
    const files = fs.readdirSync(folderUrl);
    for (const file of files) {
        const filePath = path.join(folderUrl.href, file);
        if (!file.includes(".")) {
            loadFilesFromFolder(filePath);
        } else if ((file.endsWith(".ts") || file.endsWith(".js")) && !file.includes(".model.")) {
            import(filePath);
            console.log(`Loaded ${file}`);
        }
    }
};

loadFilesFromFolder("./plugins");

//IGNORED PROMISE -> better to let the whole bot crash than to continue without login :DDD
client.login(useEnv("DISCORD_TOKEN"));


/*const statuses: [ActivityType, string][] = [
    [ActivityType.Watching, "the sunset with a coldie"],
    [ActivityType.Competing, "a TimTam race"],
    [ActivityType.Watching, "the roos hop by"],
    [ActivityType.Listening, "some didgeridoo"],
    [ActivityType.Streaming, "Home and Away"],
    [ActivityType.Playing, "some cricket, legend"],
    [ActivityType.Watching, "the waves roll in, sheila"],
    [ActivityType.Listening, "the rustle of gum trees"],
    [ActivityType.Competing, "a BBQ competition"],
    [ActivityType.Streaming, "some classic INXS"],
];*/
const statuses: [ActivityType, string][] = [[ActivityType.Playing, "DM to contact staff"]];

useEvent("ready", async (client: Client) => {
    try {
        await mongoose.connect(useEnv("MONGO_URI"));
    } catch (error) {
        console.warn(`Error connecting to database: ${error}`);
    }

    const chosenStatus = statuses[Math.floor(Math.random() * statuses.length)];

    // @ts-ignore
    client.user?.setActivity({
        name: chosenStatus[1],
        type: chosenStatus[0],
    });
});
