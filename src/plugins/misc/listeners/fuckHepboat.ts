import { useEvent } from "../../../hooks";
import { Events, Message } from "discord.js";
import { GUILDS } from "../../../globals";

useEvent(Events.MessageCreate, (message: Message) => {
    if (message.guildId !== GUILDS.MAIN) {
        return;
    }
    const commands = ["ban", "kick", "mute"];
    const weCare = commands.some((command) =>
        message.cleanContent.startsWith("!" + command)
    );
    if (!weCare) {
        return;
    }
    message.reply(
        `This command has been disabled as we transition to G'day for moderation, for more info check out https://discord.com/channels/337792272693461002/733562025321431112/1119619493233184778`
    );
});
