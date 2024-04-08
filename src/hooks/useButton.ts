import {ButtonInteraction, Interaction} from "discord.js";
import {InteractionReply, useInteraction} from "./useInteraction";

type ButtonHandler = (
    interaction: ButtonInteraction,
    data: string[]
) => InteractionReply | Promise<InteractionReply>;

export const useButton = (ref: string, handler: ButtonHandler) => {
    useInteraction((interaction: Interaction) => {
        if (!interaction.isButton()) {
            return null;
        }
        const [prefix, ...args] = interaction.customId.split("-");
        if (prefix !== ref) {
            return null;
        }
        return handler(interaction, args);
    })
};