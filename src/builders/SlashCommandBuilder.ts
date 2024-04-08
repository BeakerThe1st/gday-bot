import {SlashCommandBuilder as djsSlashCommandBuilder} from "discord.js";

export enum SlashCommandScope {
    GLOBAL,
    MAIN_GUILD = "332309672486895637",
    STAFF_SERVER = "337792272693461002",
}

export class SlashCommandBuilder extends djsSlashCommandBuilder {
    public readonly ephemeral: boolean = false;
    public readonly deferrable: boolean = true;
    public readonly scope: SlashCommandScope = SlashCommandScope.GLOBAL;

    constructor() {
        super();
    }

    public setEphemeral(ephemeral: boolean) {
        Reflect.set(this, "ephemeral", ephemeral);
        return this;
    }

    public setScope(scope: SlashCommandScope) {
        Reflect.set(this, "scope", scope);
        return this;
    }

    public setDeferrable(deferrable: boolean) {
        Reflect.set(this, "deferrable", deferrable);
        return this;
    }
}
