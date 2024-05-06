import { Message, PartialMessage, ReadonlyCollection } from "discord.js";

export const listify = (items: string[]) => {
    return `- ${items.join(`\n- `)}`;
};

export const createBulkMessageLogFile = (
    messageCollection: ReadonlyCollection<string, Message | PartialMessage>,
) => {
    let fileContent = "";
    let messages = messageCollection.map((value) => value);
    messages = messages.reverse();
    for (const message of messages) {
        const { author } = message;
        if (fileContent !== "") {
            fileContent += "\n";
        }
        fileContent += `[${message.createdTimestamp}] ${author?.username ?? "No Username"} (${author?.id ?? "No ID"}): ${message.cleanContent?.replaceAll("\n", "\n\t\t\t")}`;
    }
    return Buffer.from(fileContent);
};
