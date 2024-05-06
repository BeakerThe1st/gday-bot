import { GdayChatCommandBuilder } from "../../structs/GdayChatCommandBuilder";
import { PermissionFlagsBits } from "discord.js";
import { useChatCommand } from "../../hooks/";
import { GByeConfig } from "./GByeConfig.model";
import { fetchGbyeBansString, gByeGuilds } from "./gBye";
import { CommandScope } from "../../structs/GdayCommandBuilder";

const builder = new GdayChatCommandBuilder()
    .setName("gbye")
    .setDescription("G'bye main command.")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setScope(CommandScope.GLOBAL)
    .addSubcommand((command) =>
        command
            .setName("set_channel")
            .setDescription(
                "Locks in the channel where all the G’bye action goes down, mate.",
            )
            .addChannelOption((option) =>
                option
                    .setName("channel")
                    .setDescription("G'bye output channel.")
                    .setRequired(true),
            ),
    )
    .addSubcommand((command) =>
        command
            .setName("standing")
            .setDescription(
                "Spills the beans on a user’s G’bye status, like knowing if they're a legend or not.",
            )
            .addUserOption((option) =>
                option
                    .setName("user")
                    .setDescription("User to show G'bye standing for.")
                    .setRequired(true),
            ),
    );

useChatCommand(builder as GdayChatCommandBuilder, async (interaction) => {
    const subcommand = interaction.options.getSubcommand();
    const { guildId } = interaction;
    let config = await GByeConfig.findOne({ guild: guildId });
    if (!interaction.guildId || !gByeGuilds.includes(interaction.guildId)) {
        return "That command can only be run in G'bye guilds";
    }
    if (!config) {
        config = new GByeConfig({ guild: guildId });
    }
    if (subcommand === "set_channel") {
        const channel = interaction.options.getChannel("channel", true);
        if ("send" in channel) {
            config.set("channel", channel.id);
            await config.save();
            return `The G'bye output channel has been set to ${channel}`;
        } else {
            throw new Error("G'bye output must be in a text channel");
        }
    } else if (subcommand === "standing") {
        const user = interaction.options.getUser("user", true);
        const bans = await fetchGbyeBansString(user);
        if (!bans) {
            return `${user} is not banned in any G'bye guilds.`;
        }
        return `${user} is banned in:\n${bans}`;
    }
    throw new Error("Exhausted G'bye command options");
});
