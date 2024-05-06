import { ApplicationCommandType, userMention } from "discord.js";
import { GdayContextMenuCommandBuilder } from "../../structs/GdayContextMenuCommandBuilder";
import { CommandScope } from "../../structs/GdayCommandBuilder";
import { useUserCommand } from "../../hooks";

const builder = new GdayContextMenuCommandBuilder()
    .setName("hi")
    .setType(ApplicationCommandType.User)
    .setEphemeral(true)
    .setScope(CommandScope.MAIN_GUILD);

useUserCommand(builder, (interaction) => {
    return `hi ${interaction.targetUser}`;
});
