import {
    ActionRowBuilder,
    bold,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    Message,
    PermissionFlagsBits,
    userMention,
} from "discord.js";
import {
    SlashCommandBuilder,
    SlashCommandScope,
} from "../../builders/SlashCommandBuilder";
import { Case } from "./Case.model";
import { useButton, useChatCommand } from "../../hooks";
import { GdayButtonBuilder } from "../../builders/GdayButtonBuilder";

const builder = new SlashCommandBuilder()
    .setName("cases")
    .setDescription(
        "Has a squiz at all the cases in the guild, filtered by your specs.",
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setScope(SlashCommandScope.MAIN_GUILD)
    .addUserOption((option) =>
        option.setName("executor").setDescription("Case executor."),
    )
    .addUserOption((option) =>
        option.setName("target").setDescription("Case target."),
    )
    .addStringOption((option) =>
        option
            .setName("type")
            .setDescription("Case type.")
            .setChoices(
                { name: "Warn", value: "WARN" },
                { name: "Ban", value: "BAN" },
                { name: "Unban", value: "UNBAN" },
                { name: "Kick", value: "KICK" },
                { name: "Timeout", value: "TIMEOUT" },
            ),
    );
useChatCommand(builder as SlashCommandBuilder, async (interaction) => {
    //Create a filter and push it to messagesToFilters
    const executor = interaction.options.getUser("executor");
    const target = interaction.options.getUser("target");
    const type = interaction.options.getString("type");
    let filter: CaseMessageFilter = {
        deleted: false,
    };
    if (executor) {
        filter.executor = executor.id;
    }
    if (target) {
        filter.target = target.id;
    }
    if (type) {
        filter.type = type;
    }

    const paginatedCases = new PaginatedCasesMessage(
        await interaction.fetchReply(),
        filter,
        interaction.user.id,
    );
    await interaction.editReply(await paginatedCases.generateMessage());
    return null;
});

const messageIdsToPagination = new Map<string, PaginatedCasesMessage>();

useButton("cases:pagination", async (interaction, args) => {
    const pagination = messageIdsToPagination.get(interaction.message.id);
    if (!pagination) {
        return {
            content: `Sorry cobber! Page navigation only works for 10 minutes, you might have to search again!!`,
            ephemeral: true,
        };
    }
    const content = await (args[0] === "next"
        ? pagination.showNext(interaction)
        : pagination.showPrev(interaction));
    if (content) {
        return {
            content,
            ephemeral: true,
        };
    }
    return null;
});

interface CaseMessageFilter {
    deleted?: boolean;
    executor?: string;
    target?: string;
    type?: string;
}

class PaginatedCasesMessage {
    message: Message;
    filter: CaseMessageFilter;
    page: number;
    owner: string;
    maxPages?: number;

    constructor(message: Message, filter: CaseMessageFilter, owner: string) {
        this.message = message;
        this.filter = filter;
        this.page = 1;
        this.owner = owner;
        messageIdsToPagination.set(message.id, this);
        setTimeout(this.destroy, 10 * 60 * 1000);
    }

    async generateMessage() {
        const count = await Case.count(this.filter);
        this.maxPages = Math.ceil(count / 6);
        if (count < 1) {
            return `Sorry mate, couldn't find any cases that match your search! 🤠`;
        }

        const results = await Case.find(this.filter)
            .sort({ createdAtTimestamp: "desc" })
            .skip((this.page - 1) * 6)
            .limit(6);
        const resultsString = results.reduce((acc, result) => {
            let currentStr = `${bold(result._id)} - ${result.type} on ${userMention(
                result.target,
            )}`;
            if (result.executor) {
                currentStr += ` by ${userMention(result.executor)}`;
            }
            if (result.reason) {
                currentStr += ` for ${result.reason}`;
            }
            return acc + `\n- ${currentStr.replaceAll("\n", " ")}`;
        }, "");

        if (count <= 6) {
            //No pagination required, we can display them all
            await this.destroy();
            return `Found ${count.toLocaleString()} cases that fit the bill. Here ya go cobber!\n${resultsString}`;
        }

        //Otherwise return w/ pagination
        const actionRow = new ActionRowBuilder<
            GdayButtonBuilder | ButtonBuilder
        >().addComponents(
            new GdayButtonBuilder("cases:pagination")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("⬅️")
                .addArg("prev"),
            new ButtonBuilder()
                .setCustomId("dummy")
                .setLabel(`Page ${this.page}/${this.maxPages}`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true),
            new GdayButtonBuilder("cases:pagination")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("➡️")
                .addArg("next"),
        );
        return {
            content: `Strewth! Found ${count.toLocaleString()} cases that match what you're after:\n${resultsString}`,
            components: [actionRow],
        };
    }

    async update() {
        await this.message.edit(await this.generateMessage());
    }

    async showNext(interaction: ButtonInteraction) {
        if (interaction.user.id !== this.owner) {
            return `You'll need to make your own search mate!`;
        }
        if (this.page === this.maxPages) {
            return `I'm already showing you the last page!`;
        }
        this.page += 1;
        await interaction.update(await this.generateMessage());
        return null;
    }

    async showPrev(interaction: ButtonInteraction) {
        if (interaction.user.id !== this.owner) {
            return `You'll need to make your own search mate!`;
        }
        if (this.page === 1) {
            return `I'm already showing you the first page!`;
        }
        this.page -= 1;
        await interaction.update(await this.generateMessage());
        return null;
    }

    private async destroy() {
        messageIdsToPagination.delete(this.message.id);
    }
}
