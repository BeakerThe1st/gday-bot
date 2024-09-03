import { useError } from "./useError";
import { ClientEvents } from "discord.js";
import { useClient } from "./useClient";

export type EventHandler<K extends keyof ClientEvents> = (
    ...args: ClientEvents[K]
) => void | Promise<void>;

export const useEvent = <K extends keyof ClientEvents>(
    eventName: K,
    executor: EventHandler<K>,
) => {
    useClient().on(eventName, async (...args: ClientEvents[K]) => {
        try {
            await executor(...args);
        } catch (error) {
            useError(`Error with ${eventName} event, ${error}`);
            //throw error;
        }
    });
};
