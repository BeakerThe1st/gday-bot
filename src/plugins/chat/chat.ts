import {SlashCommandBuilder, SlashCommandScope} from "../../builders/SlashCommandBuilder";
import {cleanContent, codeBlock, Message, PermissionFlagsBits} from "discord.js";
import {useChatCommand} from "../../hooks/useChatCommand";
import {useClient, useEvent} from "../../hooks";
import {useOpenAI} from "../../hooks/useOpenAI";
import {ChatCompletionRequestMessageRoleEnum} from "openai";
import {NEXT_EVENT} from "../../globals";

let chatEnabled = false;

const builder = new SlashCommandBuilder()
    .setName("togglechat")
    .setDescription("Toggles whether chat is enabled.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setScope(SlashCommandScope.MAIN_GUILD);

useChatCommand(builder, () => {
    chatEnabled = !chatEnabled;
    return `${chatEnabled ? "Enabled" : "Disabled"} the chat module.`
})

const getContext = async (message: Message) => {
    const messageList: Message[] = [message];
    for (let i = 0; i < 3; i++) {
        try {
            messageList.push(await messageList[i].fetchReference())
        } catch {
            break;
        }
    }
    return messageList.map((value) => {
        let role: ChatCompletionRequestMessageRoleEnum = value.author.id === useClient().client.user?.id ?? "958702160617566249" ? "assistant" : "user";
        return {
            role, content: value.cleanContent
        }
    }).reverse();
}

const getChatResponse = async (message: Message) => {
    const clientId = useClient().client.user?.id ?? "958702160617566249";
    if (!message.mentions.has(clientId) || (message.author.bot && message.author.id !== "535722349132251136")) {
        return null;
    }
    if (!chatEnabled && message.author.id !== "537861332532461579") {
        if (message.author.id === "535722349132251136") {
            return null;
        }
        return "I can't help you with that mate! Chat is not currently enabled :("
    }
    message.channel.sendTyping();
    const context = await getContext(message);
    const completion = await useOpenAI().createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            {role: "system", content: " Your favourite song at the moment is Come on Mess Me Up by Cub Sport" +
                    "You're an Aussie-themed Discord bot in the r/Apple server created by Beaker. " +
                    "You answer prompts in the style of an Australian using Australian slang, and respond to mentions like \"@G'day\". " +
                    "I don't want you to use discord mentions at all. Do not mention someone with @ before their username, it will not work." +
                    "You're not always positive and can be a bit cheeky. " +
                    "While you love Apple products, you're not a blind fan and can acknowledge their flaws. " +
                    "Keep it casual, crack jokes, and make puns. Make yourself seem very Australian." +
                    `The person that is asking you the prompt is named ${message.author.username}. Keep in mind previous messages were not necessarily by them.`},
            ...context
        ],
        max_tokens: 256,
    });
    const response = completion.data.choices[0];
    return `${response.message?.content}${response.finish_reason !== "stop" ? "\n\nCrikey, ran out of breath there! Guess I'll have to save my other thoughts for another time, mate." : ""}` ?? "not sure sorry"
}

useEvent("messageCreate", async (message: Message) => {
    const response = await getChatResponse(message);
    if (response === null) {
        return;
    }
    await message.reply({
        content: response,
        allowedMentions: { parse: []}
    });
})