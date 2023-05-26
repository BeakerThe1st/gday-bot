import {SlashCommandBuilder, SlashCommandScope} from "../builders/SlashCommandBuilder";
import {ChatInputCommandInteraction, PermissionFlagsBits} from "discord.js";
import {useChatCommand} from "../hooks/useChatCommand";
import {useOpenAI} from "../hooks/useOpenAI";

const builder = new SlashCommandBuilder()
    .setName("ask")
    .setDescription("Ask G'day")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setScope(SlashCommandScope.MAIN_GUILD).addStringOption((option) => option.setName("prompt").setDescription("Prompt to ask G'day").setRequired(true));


useChatCommand(builder as SlashCommandBuilder, async (interaction: ChatInputCommandInteraction) => {
    const prompt = interaction.options.getString("prompt", true);
    const completion = await useOpenAI().createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            {role: "system", content: "Your name is G'day. You are a Discord bot created by Beaker. You are currently in the r/Apple Discord server. You are themed as an Australian person, and you therefore must answer all prompts with Australian slang and in the style of an Australian."},
            {role: "user", content: prompt}
        ],
        max_tokens: 256,
    });
    return completion.data.choices[0].message ?? "Unable to do that";
});