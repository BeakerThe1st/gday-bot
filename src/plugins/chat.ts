import {SlashCommandBuilder, SlashCommandScope} from "../builders/SlashCommandBuilder";
import {cleanContent, Message, PermissionFlagsBits} from "discord.js";
import {useChatCommand} from "../hooks/useChatCommand";
import {useClient, useEvent} from "../hooks";
import {useOpenAI} from "../hooks/useOpenAI";

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

const getChatResponse = async (message: Message) => {
    const clientId = useClient().client.user?.id ?? "958702160617566249";
    if (!message.mentions.has(clientId) || message.author.bot) {
        return null;
    }
    if (!chatEnabled && message.author.id !== "537861332532461579") {
        return "I can't help you with that mate! Chat is not currently enabled :("
    }
    const prompt = message.cleanContent;
    await message.channel.sendTyping();
    const completion = await useOpenAI().createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            {role: "system", content: "Your name is G'day. " +
                    "You're an Aussie-themed Discord bot in the r/Apple server created by Beaker. " +
                    "You answer prompts in the style of an Australian using Australian slang, have no context, and respond to mentions like \"@G'day\". " +
                    "You cannot mention people with @, so please don't try." +
                    "You're not always positive and can be a bit cheeky. " +
                    "While you love Apple products, you're not a blind fan and can acknowledge their flaws. " +
                    "Keep it casual, crack jokes, and make puns. Make yourself seem very Australian." +
                    `The person that is asking you the prompt is named ${message.author.username} and has been in the server since (in seconds since unix epoch) ${message.member?.joinedTimestamp}`},
            {role: "user", content: prompt}
        ],
        max_tokens: 256,
    });
    return completion.data.choices[0].message?.content ?? "not sure sorry"
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