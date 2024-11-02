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
    for (const char of replaceChars) {
        console.log(`Replacing ${char}`);
        cleanContent = cleanContent.replaceAll(char, "");
    }
    console.log(`Content: ${cleanContent}`);

    const data = fs.readFileSync("antidoxx.json").toString();
    const json = JSON.parse(data);
    let matches = [];
    let naughty = false;
    for (const keyword of json) {
        console.log(`trying ${keyword}`);
        if (cleanContent.includes(keyword)) {
            console.log(`includes ${keyword}`);
            naughty = true;
            matches.push(keyword);
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
            reason: `${useClient().user?.id} doxxing auto-ban`,
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
            `${message.author} [${message.author.id}] doxx attempt, ${banned ? "banned" : "not banned"}\n${codeBlock(cleanContent)}\n${codeBlock(JSON.stringify(matches))}`,
        );
    }
});
