import { Client, GatewayIntentBits, Partials } from "discord.js";

let client: Client;

export const useClient = () => {
    if (!client) {
        client = new Client({
            intents: [
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.DirectMessageTyping,
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessageTyping,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildModeration,
            ],
            allowedMentions: {
                parse: ["users"],
            },
            partials: [Partials.GuildMember, Partials.Channel],
        });
    }
    return client;
};
