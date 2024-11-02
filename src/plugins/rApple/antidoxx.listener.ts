import { useEvent } from "../../hooks";
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
    for (const char of replaceChars) {
        cleanContent = cleanContent.replaceAll(char, "");
    }

    const data = fs.readFileSync("antidoxx.json").toString();
    const json = JSON.parse(data);
    let naughty = false;
    for (const keyword of json) {
        if (cleanContent.includes(keyword)) {
            naughty = true;
            break;
        }
    }
    if (!naughty) {
        return;
    }
    await message.delete();
    let banned = false;
    try {
        if (message.author.id === "537861332532461579") {
            throw new Error("not banning me lol");
        }
        //Deletes 7 days worth of messages
        await guild.bans.create(message.author, {
            reason: "doxxing",
            deleteMessageSeconds: 60 * 60 * 24 * 7,
        });
        banned = true;
    } catch {
        //ignored
    }
    const logChannel = await message.guild?.channels.fetch(
        "1169993577741434942",
    );
    if (logChannel && "send" in logChannel) {
        logChannel.send(
            `${message.author} [${message.author.id}] doxx attempt, ${banned ? "banned" : "not banned"}\n${codeBlock(cleanContent)}`,
        );
    }
});
