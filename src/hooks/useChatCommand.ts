import {
    ChatInputCommandInteraction,
    Interaction,
    REST,
    Routes,
} from "discord.js";

import {
    SlashCommandBuilder,
    SlashCommandScope,
} from "../builders/SlashCommandBuilder";
import { useEnv } from "./useEnv";
import { useError } from "./useError";
import { InteractionReply, useInteraction } from "./useInteraction";

type CommandHandler = (
    interaction: ChatInputCommandInteraction,
) => InteractionReply | Promise<InteractionReply>;

const commandHandlers = new Map<string, CommandHandler>();

const buildersByName = new Map<string, SlashCommandBuilder>();
const buildersByScope = new Map<SlashCommandScope, SlashCommandBuilder[]>();

export const useChatCommand = (
    builder: SlashCommandBuilder,
    handler: CommandHandler,
) => {
    const { name, scope } = builder;
    const buildersForGuild = buildersByScope.get(builder.scope) ?? [];
    buildersByScope.set(scope, [builder, ...buildersForGuild]);
    buildersByName.set(name, builder);
    commandHandlers.set(name, handler);
};

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

export const updateSlashCommands = async () => {
    const rest = new REST({ version: "10" }).setToken(useEnv("DISCORD_TOKEN"));
    const clientId = useEnv("DISCORD_CLIENT_ID");
    for (const [scope, builders] of buildersByScope) {
        const route =
            scope === SlashCommandScope.GLOBAL
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

setTimeout(updateSlashCommands, 5000);

if (process.env.NODE_ENV === "development") {
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
}
