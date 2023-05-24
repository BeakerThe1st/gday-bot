import {useEvent} from "./hooks";
import {useClient} from "./hooks";
import "./env";
import fs from "fs";
import path from "path";
import {useEnv} from "./hooks";
import {ActivityType, Client, GatewayIntentBits, Partials} from "discord.js";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildBans,
    ],
    allowedMentions: {
        parse: ["users"]
    },
    partials: [Partials.GuildMember],
});
useClient().setClient(client);

const folders = ["./plugins", "./commands"];

for (const folder of folders) {
    const url = new URL(folder, import.meta.url);
    const files = fs.readdirSync(url);
    for (const file of files) {
        import(path.join(url.href, file));
    }
}

//IGNORED PROMISE -> not really needed as we have ready function, may be useful in error handling
client.login(useEnv("DISCORD_TOKEN"));

useEvent("ready", (client: Client) => {
    client.user?.setActivity({
        name: "with iPhone 14",
        type: ActivityType.Playing,
    });
});
