import {
    ApplicationCommandType,
    ChatInputCommandInteraction,
    CommandInteraction,
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
    if (!interaction.isCommand()) {
        return null;
    }
    const { commandName } = interaction;
    let command = interaction.isChatInputCommand()
        ? chatCommands.get(commandName)
        : contextMenuCommands.get(commandName);
    if (!command) {
        throw new Error(
            `${commandName} does not have a corresponding command in memory.`,
        );
    }
    if (command.builder.deferrable) {
        await interaction.deferReply({ ephemeral: command.builder.ephemeral });
    }
    //@ts-expect-error
    return command.handler(interaction);
});
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
    console.log(`Command registration complete`);
};

export const deregisterCommands = async () => {
    console.log(`Deregistering commands`);
    const rest = new REST({ version: "10" }).setToken(useEnv("DISCORD_TOKEN"));
    const clientId = useEnv("DISCORD_CLIENT_ID");
    const usedScopes = new Set<CommandScope>();
    const collectScopes = (command: ChatCommand | ContextMenuCommand) =>
        usedScopes.add(command.builder.scope);
    chatCommands.forEach(collectScopes);
    contextMenuCommands.forEach(collectScopes);
    for (const scope of usedScopes) {
        const route =
            scope === CommandScope.GLOBAL
                ? Routes.applicationCommands(clientId)
                : Routes.applicationGuildCommands(clientId, scope);
        await rest
            .put(route, { body: [] })
            .catch((error) => useError(`${error}`));
    }
    console.log(`Command deregistration complete`);
};

const exitHandler = async () => {
    console.log(`Received exit`);
    setTimeout(() => {
        console.log(`Command deregistration took too long, exiting anyway...`);
        process.exit(1);
    }, 5000);
    await deregisterCommands();
    console.log(`Exiting`);
    process.exit(0);
};

if (process.env.NODE_ENV === "development") {
    process.on("SIGINT", exitHandler);
}
