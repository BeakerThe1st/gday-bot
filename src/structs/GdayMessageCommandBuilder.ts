import {
    ApplicationCommandType,
    ContextMenuCommandBuilder as djsContextMenuCommandBuilder,
} from "discord.js";
import { CommandScope, GdayCommandBuilder } from "./GdayCommandBuilder";

export class GdayMessageCommandBuilder
    extends djsContextMenuCommandBuilder
    implements GdayCommandBuilder
{
    public readonly ephemeral: boolean = false;
    public readonly deferrable: boolean = true;
    public readonly scope: CommandScope = CommandScope.GLOBAL;

    constructor() {
        super();
        this.setType(ApplicationCommandType.Message);
    }

    public setEphemeral(ephemeral: boolean) {
        Reflect.set(this, "ephemeral", ephemeral);
        return this;
    }

    public setScope(scope: CommandScope) {
        Reflect.set(this, "scope", scope);
        return this;
    }

    public setDeferrable(deferrable: boolean) {
        Reflect.set(this, "deferrable", deferrable);
        return this;
    }
}
