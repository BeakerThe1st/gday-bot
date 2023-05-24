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
    const completion = await useOpenAI().createCompletion({
        model: "text-davinci-003",
        prompt,
        max_tokens: 512
    });
    return completion.data.choices[0].text ?? "Unable to do that";
});