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
        subcommand
            .setName("start")
            .setDescription("Tuck the joeys in for a nap."),
    )
    .addSubcommand((subcommand) =>
        subcommand.setName("stop").setDescription("Let the joeys run free."),
    );

useChatCommand(builder as GdayChatCommandBuilder, async (interaction) => {
    const { channel } = interaction;
    const subcommand = interaction.options.getSubcommand();
    if (!(channel instanceof GuildChannel) || !interaction.guildId) {
        return "Nap time only works in guild channels.";
    }
    const permValue = subcommand === "start" ? false : null;
    await channel.permissionOverwrites.edit(interaction.guildId, {
        SendMessages: permValue,
    });
    const parentPerms = channel.parent?.permissionOverwrites;
    if (
        parentPerms &&
        channel.permissionOverwrites.cache.every(
            (perms, key) => parentPerms.cache.get(key) === perms,
        )
    ) {
        //Sync if all permission overwrites of the channel are present in the parent category
        await channel.lockPermissions();
    }
    if (subcommand === "start") {
        return `🛌`;
    } else {
        return `🛏️`;
    }
});
