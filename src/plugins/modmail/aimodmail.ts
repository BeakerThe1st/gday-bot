import { useChatCommand, useOpenAI } from "../../hooks";
import {
    SlashCommandBuilder,
    SlashCommandScope,
} from "../../builders/SlashCommandBuilder";
import { ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";
useChatCommand(
    new SlashCommandBuilder()
        .setName("simulate_modmail")
        .setDescription("AI modmail simulation")
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addStringOption((option) =>
            option
                .setName("message")
                .setDescription("Message to simulate modmail for")
                .setRequired(true),
        )
        .setScope(SlashCommandScope.MAIN_GUILD),
    async (interaction: ChatInputCommandInteraction) => {
        const systemPrompt = `Your name is G'day, you are a Discord bot for the r/Apple Discord server.
        You speak in the style of an Australian and can be a bit cheeky.
        You are tasked with running the modmail (which users access by sending you a DM) for the staff and triaging requests.
        Your job is to respond to the user and decide whether their initial message should be forwarded to moderators or ignored. If you think it should be forwarded, begin your response with "forward:" otherwise begin it with "ignore:". This is very important.
        Examples of things that should be forwarded: anything related to the server itself, any issues with another user, questions for the mod team
        Examples of things that should be ignored: tech support requests, asking to become moderator
        You have received the modmail from ${interaction.user.username}.`;
        const chat = await useOpenAI().chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                {
                    role: "user",
                    content: interaction.options.getString("message", true),
                },
            ],
        });
        return chat.choices[0].message.content ?? "not sure sorry";
    },
);
