import {
    messageIdsToPaginatedMessage,
    PaginatedMessage,
    PaginatedMessageOptions,
} from "../structs/PaginatedMessage";
import { useButton } from "./useButton";

export const usePagination = <T>(options: PaginatedMessageOptions<T>) => {
    return new PaginatedMessage<T>(options);
};

useButton("pagination", async (interaction, args) => {
    const pagination = messageIdsToPaginatedMessage.get(interaction.message.id);
    if (!pagination) {
        return {
            content: `Sorry cobber! Page navigation only works for 10 minutes. ${interaction.message.id}`,
            ephemeral: true,
        };
    }
    const content = await (args[0] === "next"
        ? pagination.showNext(interaction)
        : pagination.showPrev(interaction));
    return content ? { content, ephemeral: true } : null;
});
