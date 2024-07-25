import { useEvent } from "../../hooks";
import { Message } from "discord.js";
import { GUILDS } from "../../globals";

useEvent("messageCreate", async (message: Message) => {
    if (message.guildId !== GUILDS.MAIN) {
        return;
    }
    if (message.author.bot) {
        return;
    }
    const messages = await message.channel.messages.fetch({ limit: 5 });

    if (
        messages.some(
            (msg) => msg.author.bot && msg.content === message.content,
        )
    ) {
        return;
    }

    if (
        messages.filter(
            (msg) => !msg.author.bot && msg.content === message.content,
        ).size >= 3
    ) {
        await message.channel.send({
            content: message.content,
            allowedMentions: {
                parse: [],
            },
        });
    }
});
