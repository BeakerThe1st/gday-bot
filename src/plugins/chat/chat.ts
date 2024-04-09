import { Message } from "discord.js";
import { useClient, useEvent } from "../../hooks";
import { useOpenAI } from "../../hooks/useOpenAI";

const getContext = async (message: Message) => {
    const messageList: Message[] = [message];
    for (let i = 0; i < 4; i++) {
        try {
            messageList.push(await messageList[i].fetchReference());
        } catch {
            break;
        }
    }
    return messageList
        .map((value) => {
            let role: "assistant" | "user" =
                value.author.id === useClient().client.user?.id ??
                "958702160617566249"
                    ? "assistant"
                    : "user";
            return {
                role,
                content: value.cleanContent,
            };
        })
        .reverse();
};

const toolFunctions = {
    getTime: () => {
        return new Date().toTimeString();
    },
    getDate: () => {
        return new Date().toDateString();
    },
};

const getChatResponse = async (message: Message) => {
    const clientId = useClient().client.user?.id ?? "958702160617566249";
    if (
        !message.mentions.has(clientId) ||
        message.mentions.everyone ||
        message.mentions.users.size > 5
    ) {
        return null;
    }
    //BEAKER ONLY
    if (message.author.id !== "537861332532461579") {
        return null;
    }
    message.channel.sendTyping();
    const messages: any = [
        {
            role: "system",
            content:
                `You are an Aussie Discord bot in the ${message.guild?.name} guild (guild ID: ${message.guildId}). You were coded in TypeScript by Beaker. ` +
                "Your source code is available at https://github.com/BeakerThe1st/gday-bot. " +
                'You answer prompts in the style of an Australian using Australian slang, and respond to mentions like "@G\'day". ' +
                'Never attempt to use a Discord mention such as "@beakerthe1st"' +
                "You're not always positive and can be a bit cheeky. " +
                "While you love Apple products, you're not a blind fan and can acknowledge their flaws. The latest iOS is iOS 17. The latest iPhone is the iPhone 15. " +
                "Keep it casual, crack jokes, and make puns. Make yourself seem very Australian in all of your responses." +
                `The person that is asking you the prompt's display name is ${message.author.displayName}. Keep in mind previous messages were not necessarily by them.`,
        },
        ...(await getContext(message)),
    ];
    const runner = useOpenAI().beta.chat.completions.runTools({
        model: "gpt-3.5-turbo",
        messages,
        tools: [
            {
                type: "function",
                function: {
                    function: toolFunctions.getTime,
                    description: "Returns the current time as a string.",
                    parameters: { type: "object", properties: {} },
                },
            },
            {
                type: "function",
                function: {
                    function: toolFunctions.getDate,
                    description: "Returns the current date as a string.",
                    parameters: { type: "object", properties: {} },
                },
            },
        ],
    });
    runner.on("message", (msg) => {
        console.log(msg);
    });
    try {
        return await runner.finalContent();
    } catch {
        return "Aw, crikey! Looks like I've done a bit of a faceplant there, mate. Let's chuck a U-ey and give this another burl, shall we? No worries, just a minor snag in the ol' code there. Onwards and upwards, mate!";
    }
    //return `${response.message?.content}${response.finish_reason !== "stop" ? "\n\nCrikey, ran out of breath there! Guess I'll have to save my other thoughts for another time, mate." : ""}` ?? "not sure sorry";
};

useEvent("messageCreate", async (message: Message) => {
    const response = await getChatResponse(message);
    if (response === null) {
        return;
    }
    await message.reply({
        content: response,
        allowedMentions: { parse: [] },
    });
});
