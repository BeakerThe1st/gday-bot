import { useChatCommand } from "../../hooks";
import { GdayChatCommandBuilder } from "../../structs/GdayChatCommandBuilder";
import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { CommandScope } from "../../structs/GdayCommandBuilder";
import { RAppleUser } from "../rApple/RAppleUser.model";

let guessEnabled = false;

const enableGuessBuilder = new GdayChatCommandBuilder()
    .setName("toggleguess")
    .setDescription("Toggles whether macOS Guess is enabled.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setScope(CommandScope.MAIN_GUILD)
    .setEphemeral(true);

useChatCommand(enableGuessBuilder, () => {
    guessEnabled = !guessEnabled;
    return `${guessEnabled ? "Enabled" : "Disabled"} the guess module.`;
});

const guessBuilder = new GdayChatCommandBuilder()
    .setName("guess")
    .setDescription("Guess the name of macOS 15.")
    .setScope(CommandScope.MAIN_GUILD)
    .setEphemeral(true)
    .addStringOption((option) =>
        option
            .setName("name")
            .setDescription("Your guess for the name of macOS.")
            .setRequired(true),
    );

const toTitleCase = (str: string): string => {
    return str.replace(/\w\S*/g, (txt: string): string => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

useChatCommand(guessBuilder as GdayChatCommandBuilder, async (interaction) => {
    const { id: userId } = interaction.user;

    let rAppleUser = await RAppleUser.findOne({ userId });
    if (!rAppleUser) {
        rAppleUser = await RAppleUser.create({ userId });
    }

    if (!guessEnabled) {
        const embed = new EmbedBuilder()
            .setTitle("macOS Name Guess is not enabled")
            .setDescription(
                "Sorry, but you're not able to set your guess right now.",
            )
            .setColor("Red");

        if (rAppleUser?.macosGuess) {
            embed.addFields({
                name: "Your current guess",
                value: `macOS ${rAppleUser.macosGuess}`,
                inline: false,
            });
        }

        return {
            embeds: [embed],
        };
    }

    rAppleUser.macosGuess = toTitleCase(
        interaction.options.getString("name", true),
    );

    await rAppleUser.save();

    const embed = new EmbedBuilder()
        .setTitle("You've submitted your guess for macOS 15's name.")
        .setDescription(
            `You set your guess to 'macOS ${rAppleUser.macosGuess}'`,
        )
        .setColor("Fuchsia");

    return {
        embeds: [embed],
    };
});
