import { useClient, useEnv, useEvent } from "./hooks";
import "./env";
import fs from "fs";
import path from "path";
import {
    ActivityType,
    Client,
    GatewayIntentBits,
    Partials,
    User,
} from "discord.js";
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
client.setMaxListeners(100);

useClient().setClient(client);
const loadFilesFromFolder = (folder: string) => {
    const folderUrl = new URL(folder, import.meta.url);
    const files = fs.readdirSync(folderUrl);
    for (const file of files) {
        const filePath = path.join(folderUrl.href, file);
        if (!filePath.includes(".")) {
            loadFilesFromFolder(filePath);
        } else if (file.endsWith(".ts") || file.endsWith(".js")) {
            if (file.includes(".model.")) {
                continue;
            }
            import(filePath)
                .then(() => console.log(`Loaded ${file}`))
                .catch(() => console.error(`Error loading ${file}`));
        } else {
            console.warn(`${file} was present in /plugins but ignored.`);
        }
    }
};

loadFilesFromFolder("./plugins");

try {
    await client.login(useEnv("DISCORD_TOKEN"));
} catch {
    console.log("UNABLE TO LOGIN");
    process.exit(1);
}

let statuses: [ActivityType, string][];
if (process.env.NODE_ENV === "development") {
    statuses = [
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
    ];
} else {
    statuses = [[ActivityType.Playing, "DM to contact staff."]];
}

// @ts-ignore
User.prototype.toString = function (): string {
    return `<@${this.id}> (${this.username})`;
};

useEvent("ready", async (client: Client) => {
    try {
        await mongoose.connect(useEnv("MONGO_URI"));
    } catch (error) {
        console.warn(`Error connecting to database: ${error}`);
    }

    const chosenStatus = statuses[Math.floor(Math.random() * statuses.length)];

    client.user?.setActivity({
        name: chosenStatus[1],
        type: chosenStatus[0],
    });
});
