import "./env";
import { useClient, useEnv, useEvent } from "./hooks";
import { ActivityType, Client, User } from "discord.js";
import mongoose from "mongoose";
import { loadFilesFromFolder } from "./loader";

// @ts-ignore
User.prototype.toString = function (): string {
    return `<@${this.id}> (${this.username})`;
};

try {
    await useClient().login(useEnv("DISCORD_TOKEN"));
} catch (error) {
    console.error(`Unable to login: ${error}`);
    process.exit(1);
}

loadFilesFromFolder("./plugins");

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

useEvent("ready", async (client: Client) => {
    try {
        await mongoose.connect(useEnv("MONGO_URI"));
    } catch (error) {
        console.error(`Error connecting to database: ${error}`);
        process.exit(1);
    }

    const chosenStatus = statuses[Math.floor(Math.random() * statuses.length)];

    client.user?.setActivity({
        name: chosenStatus[1],
        type: chosenStatus[0],
    });
});
