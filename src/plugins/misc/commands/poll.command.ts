import {useChatCommand} from "../../../hooks/useChatCommand";
import {SlashCommandBuilder, SlashCommandScope,} from "../../../builders/SlashCommandBuilder";
import {
    ActionRowBuilder,
    BaseMessageOptions,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    Interaction,
    Message,
    User,
} from "discord.js";
import {useEvent} from "../../../hooks";

const builder = new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Creates a poll.")
    .addStringOption((option) =>
        option
            .setName("question")
            .setDescription("The question you want to poll.")
            .setRequired(true)
    )
    .setScope(SlashCommandScope.GLOBAL);

const polls = new Map<string, PollCommand>();

useChatCommand(builder, async (interaction: ChatInputCommandInteraction) => {
    const message = await interaction.fetchReply();
    const poll = new PollCommand(
        interaction.options.getString("question", true),
        message
    );
    polls.set(message.id, poll);
    return poll.getMessage();
});

useEvent("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isButton()) {
        return;
    }
    const [type, action] = interaction.customId.split("-");
    if (type !== "poll") {
        return;
    }
    await interaction.deferReply({ephemeral: true});

    const poll = polls.get(interaction.message.id);
    if (!poll) {
        await interaction.editReply("That poll can no longer be found.");
        return;
    }

    await interaction.editReply(
        poll.setVote(interaction.user, action as "yes" | "no")
    );
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
                return Object.assign(acc, {[vote]: acc[vote] + 1});
            },
            {yes: 0, no: 0}
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
                }
            )
            .setColor("Blurple");
        const actionRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("poll-yes")
                    .setStyle(ButtonStyle.Success)
                    .setLabel("Yes"),
                new ButtonBuilder()
                    .setCustomId("poll-no")
                    .setStyle(ButtonStyle.Danger)
                    .setLabel("No")
            )
            .toJSON();
        return {
            embeds: [embed],
            //@ts-ignore
            components: [actionRow],
        };
    };

    setVote = (user: User, vote: "yes" | "no") => {
        const previousVote = this.users.get(user.id);
        if (previousVote === vote) {
            this.users.delete(user.id);
            this.updateMessage();
            return `Successfully removed your vote.`;
        } else {
            this.users.set(user.id, vote);
            this.updateMessage();
            return `Successfully voted ${vote}.`;
        }
    };

    updateMessage = async () => {
        await this.message.edit(this.getMessage());
    };
}
