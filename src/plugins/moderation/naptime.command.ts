import { GdayChatCommandBuilder } from "../../structs/GdayChatCommandBuilder";
import { GuildChannel, PermissionFlagsBits } from "discord.js";
import { CommandScope } from "../../structs/GdayCommandBuilder";
import { useChatCommand } from "../../hooks";

const builder = new GdayChatCommandBuilder()
    .setName("naptime")
    .setDescription("Tuck the joeys in for a nap.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setScope(CommandScope.MAIN_GUILD)
    .addSubcommand((subcommand) =>
        subcommand.setName("start").setDescription("Starts nap time."),
    )
    .addSubcommand((subcommand) =>
        subcommand.setName("stop").setDescription("Stops nap time."),
    );

useChatCommand(builder as GdayChatCommandBuilder, async (interaction) => {
    const { channel } = interaction;
    const subcommand = interaction.options.getSubcommand();
    if (!(channel instanceof GuildChannel) || !interaction.guildId) {
        return "Nap time only works in guild channels.";
    }
    const permValue = subcommand === "start" ? true : null;
    await channel.permissionOverwrites.edit(interaction.guildId, {
        SendMessages: permValue,
    });
    if (subcommand === "start") {
        return `🛌`;
    } else {
        return `🛏️`;
    }
});
