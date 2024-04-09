import {
  codeBlock,
  Interaction,
  InteractionReplyOptions,
  MessagePayload,
  ModalBuilder,
  RepliableInteraction,
} from "discord.js";
import { useEvent } from "./useEvent";
import { useError } from "./useError";

export type InteractionReply =
  | string
  | MessagePayload
  | InteractionReplyOptions
  | ModalBuilder
  | null;

type InteractionHandler = (
  interaction: RepliableInteraction,
) => InteractionReply | Promise<InteractionReply>;

export const useInteraction = (handler: InteractionHandler) => {
  useEvent("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isRepliable()) {
      throw new Error("useInteraction used on non-repliable interaction");
    }
    let response;

    //Obtain the response or set response to the error thrown by the handler
    try {
      response = await handler(interaction);
      if (!response) {
        return;
      }
    } catch (error) {
      response = `Looks like something's gone walkabout! Apologies for the inconvenience, mate. Here's what could be happening: \n\n${codeBlock(`${error}`)}`;
    }

    //Send out the reply
    try {
      const alreadyReplied = interaction.replied || interaction.deferred;
      if (response instanceof ModalBuilder) {
        if (alreadyReplied) {
          throw new Error(
            `Cannot show a modal to an already replied or deferred interaction`,
          );
        }
        if (!("showModal" in interaction)) {
          throw new Error(
            `Cannot show a modal to interaction of type ${interaction.type}`,
          );
        }
        await interaction.showModal(response);
      } else {
        await (alreadyReplied
          ? interaction.editReply(response)
          : interaction.reply(response));
      }
    } catch (error) {
      useError(`Error attempting to respond to interaction: ${error}`);
    }
  });
};
