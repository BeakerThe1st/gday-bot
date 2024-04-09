import { useEvent } from "../../hooks";
import { Message } from "discord.js";

useEvent("messageCreate", async (message: Message) => {
  /*if (message.guildId !== GUILDS.MAIN) {
        return;
    }
    if (message.author.bot) {
        return;
    }
    const roleCache = message.member?.roles.cache;
    if (roleCache && roleCache.has(ROLES.MAIN.mod_squad)) {
        return;
    }
    if (message.author.bot) {
        return;
    }
    const moderation = await useOpenAI().createModeration({
        input: message.cleanContent,
        model: "text-moderation-latest",
    });

    const [result] = moderation.data.results;
    if (!result.flagged) {
        return;
    }
    const matchedFlags = Object.entries(result.categories)
        .filter((value) => value[1])
        .map((value) => value[0]);
    if (matchedFlags.includes("sexual")) {
        const logChannel = await useClient().client.channels.fetch("476924704528138271");
        if (logChannel?.isTextBased()) {
            await logChannel.send(`# Potential sexual message\n${message.author} (${message.author.username}): ${inlineCode(message.cleanContent)}\n${messageLink(message.channelId, message.id)}`)
        }
    }
    const zeroTolerance = matchedFlags.some((flag => zeroToleranceFlags.includes(flag)));
    const zeroToleranceFlags = ["harassment/threatening", "hate/threatening", "self-harm/intent", "self-harm/instructions", "sexual/minors", "violence/graphic"];
    if (zeroTolerance) {
        if (logChannel?.isTextBased()) {
            await logChannel.send(`Blocked a message by ${message.author} in ${message.channel} due to \`${matchedFlags.join(", ")}\`\n${codeBlock(message.cleanContent)}`)
        }
        let response;
        if (matchedFlags.includes("self-harm")) {
            response = `${message.author} We do not allow discussion of self-harm related topics on this server. If you or someone you know are struggling, help is available. You can find a list of worldwide suicide crisis lines here: https://en.wikipedia.org/wiki/List_of_suicide_crisis_lines. `
        } else {
            response = `${userMention(message.author.id)}, that message is not allowed on this server as per rule 1. \`${matchedFlags.join(", ")}\``;
        }
        await message.delete();
        await message.channel.send(response);
    } else {*/
  /*if (logChannel?.isTextBased()) {
        await logChannel.send(`Message by ${message.author} flagged in ${message.channel} due to ${inlineCode(matchedFlags.join(", "))}\n${codeBlock(message.cleanContent)}`);
    }
    await message.react("❗");*/
  //}
});
