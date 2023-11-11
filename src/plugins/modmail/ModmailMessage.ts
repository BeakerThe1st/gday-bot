import {Colors, EmbedBuilder} from "discord.js";

interface ModmailMessageOptions {
    from: string;
    to: string;
    body: string;
    anon?: boolean;
    attachments?: string[];
}
export class ModmailMessage extends EmbedBuilder implements ModmailMessageOptions {
    from: string;
    to: string;
    body: string;
    anon?: boolean;
    attachments?: string[];
    constructor(options: ModmailMessageOptions) {
        super();
        const { from, to, body, anon, attachments } = options;
        this.from = from;
        this.to = to;
        this.body = body;
        this.anon = anon;
        this.attachments = attachments;
        this.build();
    }
    private build() {
        this.setTitle((this.anon ? "r/Apple Mod Team" : this.from) + ":");
        this.setColor(Colors.Green)
        this.setDescription(this.body);
    }
    public addStaffFields() {
        this
            .setFooter({text: `${this.from}${this.anon ? " (anon.)" : ""} → ${this.to}`})
            .setTimestamp(Date.now());
        return this;
    }
}