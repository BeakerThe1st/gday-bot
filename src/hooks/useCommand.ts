import {
    ChatInputCommandInteraction,
    MessageContextMenuCommandInteraction,
    REST,
    Routes,
    UserContextMenuCommandInteraction,
} from "discord.js";
import { useEnv } from "./useEnv";
import { GdayChatCommandBuilder } from "../structs/GdayChatCommandBuilder";
import { useError } from "./useError";
import { InteractionReply, useInteraction } from "./useInteraction";
import {
    CommandScope,
    GdayCommandBuilder,
} from "../structs/GdayCommandBuilder";
import { GdayUserCommandBuilder } from "../structs/GdayUserCommandBuilder";
import { GdayMessageCommandBuilder } from "../structs/GdayMessageCommandBuilder";

type ChatCommandHandler = (
    interaction: ChatInputCommandInteraction,
) => InteractionReply | Promise<InteractionReply>;

type UserCommandHandler = (
    interaction: UserContextMenuCommandInteraction,
) => InteractionReply | Promise<InteractionReply>;

type MessageCommandHandler = (
    interaction: MessageContextMenuCommandInteraction,
) => InteractionReply | Promise<InteractionReply>;

interface ChatCommand {
    handler: ChatCommandHandler;
    builder: GdayChatCommandBuilder;
}

interface ContextMenuCommand {
    handler: UserCommandHandler | MessageCommandHandler;
    builder: GdayUserCommandBuilder | GdayMessageCommandBuilder;
}

const chatCommands = new Map<string, ChatCommand>();
const contextMenuCommands = new Map<string, ContextMenuCommand>();

export const useChatCommand = (
    builder: GdayChatCommandBuilder,
    handler: ChatCommandHandler,
) => chatCommands.set(builder.name, { handler, builder });

export const useUserCommand = (
    builder: GdayUserCommandBuilder,
    handler: UserCommandHandler,
) => contextMenuCommands.set(builder.name, { handler, builder });

export const useMessageCommand = (
    builder: GdayMessageCommandBuilder,
    handler: MessageCommandHandler,
) => contextMenuCommands.set(builder.name, { handler, builder });

useInteraction(async (interaction) => {
    if (
        !(
            interaction.isChatInputCommand() ||
            interaction.isContextMenuCommand()
        )
    ) {
        return null;
    }
    const { commandName } = interaction;
    let command;
    if (interaction.isChatInputCommand()) {
        command = chatCommands.get(commandName);
    } else if (interaction.isContextMenuCommand()) {
        command = contextMenuCommands.get(commandName);
    }
    if (!command) {
        throw new Error(
            `${commandName} does not have a corresponding command in memory.`,
        );
    }
    if (command.builder.deferrable) {
        await interaction.deferReply({ ephemeral: command.builder.ephemeral });
    }
    // @ts-ignore
    return command.handler(interaction);
});

/*
useInteraction(async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) {
        return null;
    }
    const { commandName } = interaction;
    const handler = commandHandlers.get(commandName);
    const builder = buildersByName.get(commandName);
    if (!(handler && builder)) {
        throw new Error(
            `${commandName} does not have a corresponding handler or builder.`,
        );
    }
    if (builder.deferrable) {
        await interaction.deferReply({ ephemeral: builder.ephemeral });
    }
    return handler(interaction);
});
 */

export const registerCommands = async () => {
    console.log(`Registering commands`);
    const rest = new REST({ version: "10" }).setToken(useEnv("DISCORD_TOKEN"));
    const clientId = useEnv("DISCORD_CLIENT_ID");
    const buildersByScope = new Map<CommandScope, GdayCommandBuilder[]>();
    const mapToScope = ({ builder }: ChatCommand | ContextMenuCommand) =>
        buildersByScope.set(builder.scope, [
            ...(buildersByScope.get(builder.scope) ?? []),
            builder,
        ]);

    chatCommands.forEach(mapToScope);
    contextMenuCommands.forEach(mapToScope);

    for (const [scope, builders] of buildersByScope) {
        const route =
            scope === CommandScope.GLOBAL
                ? Routes.applicationCommands(clientId)
                : Routes.applicationGuildCommands(clientId, scope);
        try {
            await rest.put(route, {
                body: builders.map((builder) => builder.toJSON()),
            });
        } catch (error) {
            useError(`${error}`);
        }
    }
};

/*if (process.env.NODE_ENV === "development") {
    const commandCleanup = async () => {
        setTimeout(() => {
            console.error("Slash command cleanup incomplete, exiting anyway.");
            process.exit(1);
        }, 5000);
        for (const scope of buildersByScope.keys()) {
            buildersByScope.set(scope, []);
        }
        await updateSlashCommands();
        console.log("Slash commands cleaned up, exiting.");
        process.exit(0);
    };
    process.on("SIGTERM", commandCleanup);
    process.on("SIGINT", commandCleanup);
    process.on("exit", commandCleanup);
}*/
