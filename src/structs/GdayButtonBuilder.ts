import { ActionRowBuilder, ButtonBuilder } from "discord.js";

export class GdayButtonBuilder extends ButtonBuilder {
    ref: string;
    args: string[];

    constructor(ref: string) {
        super();
        if (ref.includes("-")) {
            throw new Error("G'day buttons cannot contain - in their refs");
        }
        this.ref = ref;
        this.args = [];
        this.updateCustomID();
    }

    addArg(arg: string): this {
        if (arg.includes("-")) {
            throw new Error(`G'day buttons cannot have - in their args`);
        }
        this.args.push(arg);
        return this.updateCustomID();
    }

    setCustomId(_customId: string): this {
        throw new Error("Setting custom IDs is not permitted on G'day buttons");
    }

    asActionRow() {
        return new ActionRowBuilder<GdayButtonBuilder>().addComponents(this);
    }

    private updateCustomID(): this {
        return super.setCustomId(`${this.ref}-${this.args.join("-")}`);
    }
}
