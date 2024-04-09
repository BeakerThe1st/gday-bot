import { useChatCommand } from "../../../hooks/useChatCommand";
import {
    SlashCommandBuilder,
    SlashCommandScope,
} from "../../../builders/SlashCommandBuilder";
import {
    ActionRowBuilder,
    BaseMessageOptions,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    Message,
    User,
} from "discord.js";
import { GdayButtonBuilder } from "../../../builders/GdayButtonBuilder";
import { useButton } from "../../../hooks/useButton";

const builder = new SlashCommandBuilder()
    .setName("poll")
    .setDescription(
        "Gets the convo going with a poll, find out what the mob reckons.",
    )
    .addStringOption((option) =>
        option
            .setName("question")
            .setDescription("The question you want to poll.")
            .setRequired(true),
    )
    .setScope(SlashCommandScope.GLOBAL);

const polls = new Map<string, PollCommand>();

useChatCommand(builder, async (interaction) => {
    const message = await interaction.fetchReply();
    const poll = new PollCommand(
        interaction.options.getString("question", true),
        message,
    );
    polls.set(message.id, poll);
    return poll.getMessage();
});

useButton("poll:vote", async (interaction, args) => {
    await interaction.deferReply({ ephemeral: true });
    const poll = polls.get(interaction.message.id);
    if (!poll) {
        throw new Error("That poll no longer exists");
    }
    return poll.setVote(interaction.user, args[0] as "yes" | "no");
});

class PollCommand {
    question: string;
    users: Map<string, "yes" | "no">;
    message: Message;

    constructor(question: string, message: Message) {
        this.question = question;
        this.users = new Map();
        this.message = message;
    }

    countVotes = () => {
        return Array.from(this.users.values()).reduce(
            (acc, vote) => {
                return Object.assign(acc, { [vote]: acc[vote] + 1 });
            },
            { yes: 0, no: 0 },
        );
    };

    getMessage = (): BaseMessageOptions => {
        const count = this.countVotes();
        const embed = new EmbedBuilder()
            .setTitle(this.question)
            .setFields(
                {
                    name: "Yes",
                    value: count.yes.toLocaleString(),
                    inline: true,
                },
                {
                    name: "No",
                    value: count.no.toLocaleString(),
                    inline: true,
                },
            )
            .setColor("Blurple");
        const actionRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new GdayButtonBuilder("poll:vote")
                    .setStyle(ButtonStyle.Success)
                    .setLabel("Yes")
                    .addArg("yes"),
                new GdayButtonBuilder("poll:vote")
                    .setStyle(ButtonStyle.Danger)
                    .setLabel("No")
                    .addArg("no"),
            )
            .toJSON();
        return {
            embeds: [embed],
            components: [actionRow],
        };
    };

    setVote = (user: User, vote: "yes" | "no") => {
        const previousVote = this.users.get(user.id);
        if (previousVote === vote) {
            this.users.delete(user.id);
            this.updateMessage();
            return `Your vote has been removed.`;
        } else {
            this.users.set(user.id, vote);
            this.updateMessage();
            return `You have voted ${vote}.`;
        }
    };

    updateMessage = async () => {
        await this.message.edit(this.getMessage());
    };
}
