import {
    ChatInputCommandInteraction,
    Interaction,
    InteractionReplyOptions,
    MessagePayload,
    ModalBuilder,
    REST,
    Routes,
} from "discord.js";

import {SlashCommandBuilder, SlashCommandScope} from "../builders/SlashCommandBuilder";
import {useEnv} from "./useEnv";
import {useError} from "./useError";
import {useEvent} from "./useEvent";

type InteractionReply =
    | string
    | MessagePayload
    | InteractionReplyOptions
    | ModalBuilder
    | null;
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
    const {name, scope} = builder;
    const buildersForGuild = buildersByScope.get(builder.scope) ?? [];
    buildersByScope.set(scope, [builder, ...buildersForGuild]);
    buildersByName.set(name, builder);
    commandHandlers.set(name, handler);
};

useEvent("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) {
        return;
    }

    const {commandName} = interaction;
    const handler = commandHandlers.get(commandName);
    const builder = buildersByName.get(commandName);
    if (!handler || !builder) {
        useError(
            `${commandName} does not have a corresponding handler or builder.`,
        );
        return;
    }

    if (builder.deferrable) {
        await interaction.deferReply({ephemeral: builder.ephemeral});
    }

    let response;

    //Get a response from the handler or exit if response is null
    try {
        response = await handler(interaction);
        if (!response) {
            return;
        }
    } catch (error) {
        response = `${error}`;
    }

    //Send out the reply
    try {
        const alreadyReplied = interaction.replied || interaction.deferred
        if (response instanceof ModalBuilder) {
            //Handle modal responses
            if (alreadyReplied) {
                throw new Error(`Cannot reply with a modal to an already replied to interaction.`);
            } else {
                await interaction.showModal(response);
            }
        } else {
            //Handle everything else
            if (alreadyReplied) {
                await interaction.editReply(response);
            } else {
                await interaction.reply(response);
            }
        }
    } catch (error) {
        useError(`${error}`);
    }
});

export const updateSlashCommands = () => {
    setTimeout(() => {
        const rest = new REST({version: "10"}).setToken(useEnv("DISCORD_TOKEN"));
        const clientId = useEnv("DISCORD_CLIENT_ID");
        for (const [scope, builders] of buildersByScope) {
            const route =
                scope === SlashCommandScope.GLOBAL
                    ? Routes.applicationCommands(clientId)
                    : Routes.applicationGuildCommands(clientId, scope);
            (async () => {
                try {
                    await rest.put(route, {
                        body: builders.map((builder) => builder.toJSON()),
                    });
                } catch (error) {
                    useError(`${error}`);
                }
            })();
        }
    }, 5000);
};

updateSlashCommands();


