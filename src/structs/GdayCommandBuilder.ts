import {
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from "discord.js";

export enum CommandScope {
    GLOBAL,
    MAIN_GUILD = "332309672486895637",
    STAFF_SERVER = "337792272693461002",
}

export interface GdayCommandBuilder {
    readonly scope: CommandScope;

    toJSON():
        | RESTPostAPIChatInputApplicationCommandsJSONBody
        | RESTPostAPIContextMenuApplicationCommandsJSONBody;
}
