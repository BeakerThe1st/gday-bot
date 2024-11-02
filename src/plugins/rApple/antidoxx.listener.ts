import { useClient, useEvent } from "../../hooks";
import { codeBlock, Message } from "discord.js";
import { GUILDS } from "../../globals";
import fs from "fs";

useEvent("messageCreate", async (message: Message) => {
    const { guild } = message;
    if (guild?.id !== GUILDS.MAIN) {
        return;
    }
    if (message.author.bot) {
        return;
    }
    const replaceChars = [".", ",", " "];
    let { cleanContent } = message;
    cleanContent = cleanContent.toLowerCase();
    for (const char of replaceChars) {
        cleanContent = cleanContent.replaceAll(char, "");
    }

    const data = fs.readFileSync("antidoxx.json").toString();
    const json = JSON.parse(data);
    let matches = [];
    let naughty = false;
    for (const keyword of json) {
        if (cleanContent.includes(keyword)) {
            naughty = true;
            matches.push(keyword);
        }
    }
    if (!naughty) {
        return;
    }
    await message.delete();
    let muted = false;
    try {
        if (!message.member) {
            throw new Error("no member");
        }
        //7 day mute
        await message.member?.disableCommunicationUntil(
            Date.now() + 1000 * 60 * 60 * 24 * 7,
            `${useClient().user?.id} doxxing auto-mute`,
        );
        muted = true;
    } catch {
        //ignored
    }
    const logChannel = await message.guild?.channels.fetch(
        "1302197173139673098",
    );
    if (logChannel && "send" in logChannel) {
        logChannel.send(
            `${message.author} [${message.author.id}] doxx attempt, ${muted ? "muted" : "not muted"}, ${message.channel}\n${codeBlock(cleanContent)}\n${codeBlock(JSON.stringify(matches))}`,
        );
    }
});
