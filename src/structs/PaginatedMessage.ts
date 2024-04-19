import { Query } from "mongoose";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
} from "discord.js";
import { GdayButtonBuilder } from "./GdayButtonBuilder";

export interface PaginatedMessageOptions<T> {
    preamble?: string;
    emptyMsg: string;
    query: Query<T[], T>;
    stringify: (a: T) => string;
    perPage: number;
    owner: string;
}

export const messageIdsToPaginatedMessage = new Map<
    string,
    PaginatedMessage<any>
>();

export class PaginatedMessage<T> {
    options: PaginatedMessageOptions<T>;
    page: number;
    maxPages?: number;
    constructor(options: PaginatedMessageOptions<T>) {
        this.options = options;
        this.page = 1;
    }

    setMessageId(messageId: string) {
        messageIdsToPaginatedMessage.set(messageId, this);
        setTimeout(
            () => messageIdsToPaginatedMessage.delete(messageId),
            10 * 60 * 1000,
        );
    }

    async generateMessage() {
        const count = await this.options.query.clone().count();
        if (this.options.preamble?.includes("%count")) {
            this.options.preamble = this.options.preamble?.replaceAll(
                "%count",
                count.toLocaleString(),
            );
        }
        if (count < 1) {
            return this.options.emptyMsg;
        }
        this.maxPages = Math.ceil(count / this.options.perPage);
        const results = await this.options.query
            .clone()
            .skip((this.page - 1) * this.options.perPage)
            .limit(this.options.perPage);

        const resultsString = results.reduce((acc, result) => {
            return acc + `\n- ${this.options.stringify(result)}`;
        }, "");

        if (count <= this.options.perPage) {
            return `${this.options.preamble}\n${resultsString}`;
        }

        const actionRow = new ActionRowBuilder<
            GdayButtonBuilder | ButtonBuilder
        >().addComponents(
            new GdayButtonBuilder("pagination")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("⬅️")
                .addArg("prev"),
            new ButtonBuilder()
                .setCustomId("dummy")
                .setLabel(`Page ${this.page}/${this.maxPages}`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true),
            new GdayButtonBuilder("pagination")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("➡️")
                .addArg("next"),
        );
        return {
            content: `${this.options.preamble}\n${resultsString}`,
            components: [actionRow],
            allowedMentions: { parse: [] },
        };
    }

    async showNext(interaction: ButtonInteraction) {
        if (interaction.user.id !== this.options.owner) {
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
        if (interaction.user.id !== this.options.owner) {
            return `You'll need to make your own search mate!`;
        }
        if (this.page === 1) {
            return `I'm already showing you the first page!`;
        }
        this.page -= 1;
        await interaction.update(await this.generateMessage());
        return null;
    }
}
