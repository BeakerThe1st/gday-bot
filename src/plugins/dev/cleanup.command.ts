import { GdayChatCommandBuilder } from "../../structs/GdayChatCommandBuilder";
import { PermissionFlagsBits } from "discord.js";
import { CommandScope } from "../../structs/GdayCommandBuilder";
import { deregisterCommands, useChatCommand } from "../../hooks";

const cleanupCommand = () => {
    if (process.env.NODE_ENV !== "development") return;
    const builder = new GdayChatCommandBuilder()
        .setName("cleanup")
        .setDescription("Dev instance cleanup")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setScope(CommandScope.MAIN_GUILD);
    useChatCommand(builder as GdayChatCommandBuilder, async (interaction) => {
        if (interaction.user.id !== "537861332532461579")
            return `You cannot cleanup.`;
        await deregisterCommands();
        return `Cleanup complete!`;
    });
};

cleanupCommand();
