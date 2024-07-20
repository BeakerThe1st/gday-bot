import { useClient, useEvent } from "../../hooks";
import { GUILDS } from "../../globals";
import {
    DiscordAPIError,
    DiscordjsErrorCodes,
    DiscordjsRangeError,
    User,
} from "discord.js";

const userCooldown = new Set<User>();

useEvent("messageCreate", async (message) => {
    if (message.guildId !== GUILDS.MAIN) {
        return;
    }

    const rApple = await useClient().guilds.fetch(GUILDS.MAIN);
    let reference;
    try {
        reference = await message.fetchReference();
    } catch {
        return;
    }

    if (userCooldown.has(reference.author)) {
        return;
    }

    try {
        await rApple.members.fetch(reference.author);
    } catch (error) {
        if (error instanceof DiscordAPIError && error.status === 404) {
            userCooldown.add(reference.author);
            setTimeout(() => userCooldown.delete(reference.author), 15000);
            await message.reply(
                `Heads up mate, the person you're replying to is no longer in the server.`,
            );
        } else {
            throw error;
        }
    }
});
