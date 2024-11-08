import { useClient, useEvent, useOpenAI } from "../../hooks";
import { codeBlock, Message } from "discord.js";
import { GUILDS } from "../../globals";

const authorMap = new Map<string, number>();

useEvent("messageCreate", async (message: Message) => {
    const { guild, cleanContent, member } = message;
    if (guild?.id !== GUILDS.MAIN) {
        return;
    }
    if (message.author.bot || !member?.joinedTimestamp) {
        return;
    }

    const logChannel = await message.guild?.channels.fetch(
        "1302197173139673098",
    );

    if (!logChannel || !("send" in logChannel)) {
        return;
    }

    //joined more than 24 hour ago
    if (member.joinedTimestamp < Date.now() - 24 * 60 * 60 * 1000) {
        if (authorMap.has(member.id)) {
            //member was previously in the map but we don't care about them anymore
            authorMap.delete(member.id);
        }
        return;
    }

    const msgCount = authorMap.get(member.id);

    if (msgCount && msgCount >= 5) {
        return;
    }

    const runner = await useOpenAI().chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content:
                    "You identify if a message is a doxxing attempt, even if it is slightly obfuscated.",
            },
            {
                role: "user",
                content: cleanContent,
            },
        ],
        response_format: {
            // See /docs/guides/structured-outputs
            type: "json_schema",
            json_schema: {
                name: "info_schema",
                schema: {
                    type: "object",
                    properties: {
                        flag: {
                            description:
                                "Whether the message is a doxxing attempt",
                            type: "boolean",
                        },
                        info: {
                            description:
                                "The personal information that is doxxed",
                            type: "string",
                        },
                    },
                    additionalProperties: false,
                },
            },
        },
    });

    authorMap.set(member.id, (authorMap.get(member.id) ?? 0) + 1);

    const content = runner.choices[0].message.content;

    const parsed = JSON.parse(content ?? "{}");

    parsed.content = cleanContent;

    logChannel.send(
        `Analysed ${authorMap.get(member.id)}th message by ${member}\n\n${codeBlock("json", JSON.stringify(parsed, null, 2))}`,
    );

    if (!parsed.flag) {
        return;
    }

    logChannel.send(`Flagged ${member}, muting`);

    await message.delete();

    await member.disableCommunicationUntil(
        Date.now() + 1000 * 60 * 60 * 24 * 7,
        `${useClient().user?.id} doxxing auto-mute`,
    );
});
