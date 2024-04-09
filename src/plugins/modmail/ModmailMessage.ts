import { Colors, EmbedBuilder } from "discord.js";

interface ModmailMessageOptions {
    from: string;
    to: string;
    body: string;
    anon?: boolean;
    attachments?: string[];
}

export class ModmailMessage
    extends EmbedBuilder
    implements ModmailMessageOptions
{
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

    public addStaffFields() {
        this.setFooter({
            text: `${this.from}${this.anon ? " (anon.)" : ""} → ${this.to}`,
        }).setTimestamp(Date.now());
        if (this.to !== "r/Apple Mod Team") {
            this.setColor(Colors.Red);
        }
        return this;
    }

    private build() {
        this.setTitle((this.anon ? "r/Apple Mod Team" : this.from) + ":");
        this.setColor(Colors.Green);
        if (this.body) {
            this.setDescription(this.body);
        }
        if (this.attachments) {
            this.setImage(this.attachments[0]);
        } else {
            const urlMatch = this.body.match(/\bhttps?:\/\/\S+/gi);
            if (urlMatch) {
                this.setImage(urlMatch[0]);
            }
        }
    }
}
