import {useClient, useEvent} from "../hooks";
import {codeBlock, Message, userMention} from "discord.js";
import {useOpenAI} from "../hooks/useOpenAI";
import {CreateModerationResponseResultsInnerCategories} from "openai";

useEvent("messageCreate", async (message: Message) => {
    if (message.author.bot) {
        return;
    }
    const moderation = await useOpenAI().createModeration({
        input: message.cleanContent,
        model: "text-moderation-latest"
    });

    const [result] = moderation.data.results;
    if (!result.flagged) {
        return;
    }
    const zeroToleranceFlags = ["hate", "hate/threatening", "self-harm", "sexual/minors", "violence/graphic"];
    const matchedFlags = Object.entries(result.categories)
        .filter((value) => value[1])
        .map((value) => value[0]);
    const zeroTolerance = matchedFlags.some((flag => zeroToleranceFlags.includes(flag)));
    let responseMessage: Message;
    let responseDeletionDelay = 5000;
    if (zeroTolerance) {
        const logChannel = await useClient().client.channels.fetch("1033960979224088596");
        if (logChannel?.isTextBased()) {
            await logChannel.send(`Blocked a message by ${message.author} in ${message.channel} due to \`${matchedFlags.join(", ")}\`\n${codeBlock(message.cleanContent)}`)
        }
        let response;
        if (matchedFlags.includes("self-harm")) {
            response = `${message.author} We do not allow discussion of self-harm related topics on this server. If you or someone you know are struggling, help is available. You can find a list of worldwide suicide crisis lines here: https://en.wikipedia.org/wiki/List_of_suicide_crisis_lines. `
            responseDeletionDelay = -1;
        } else {
            response = `${userMention(message.author.id)}, that message is not allowed on this server as per rule 1. \`${matchedFlags.join(", ")}\``;
        }
        responseMessage = await message.channel.send(response);
        await message.delete();
    } else {
        await message.react("❗");
        responseMessage = await message.reply("Let's remember rule 1 and be nice to each other! I think we all have the best intent, but sometimes we can get a little caught up! 🙂")
    }
    if (responseDeletionDelay > 0) {
        setTimeout(() => {
            responseMessage.delete().catch(() => {});
        }, responseDeletionDelay)
    }
})
