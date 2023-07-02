import {useChatCommand} from "../hooks/useChatCommand";
import {SlashCommandBuilder, SlashCommandScope} from "../builders/SlashCommandBuilder";
import {Guess} from "./Guess.model";
import {ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits} from "discord.js";

let guessEnabled = true;

const enableGuessBuilder = new SlashCommandBuilder()
    .setName("toggleguess")
    .setDescription("Toggles whether macOS Guess is enabled.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setScope(SlashCommandScope.MAIN_GUILD)
    .setEphemeral(true);

useChatCommand(enableGuessBuilder, () => {
    guessEnabled = !guessEnabled;
    return `${guessEnabled ? "Enabled" : "Disabled"} the guess module.`;
});

const guessBuilder = new SlashCommandBuilder()
    .setName("guess")
    .setDescription(
        "Guess the name of macOS 14.",
    )
    .addStringOption((option) =>
        option
            .setName("name")
            .setDescription(
                "Your guess for the name of macOS.",
            )
            .setRequired(true),
    )
    .setScope(SlashCommandScope.MAIN_GUILD)
    .setEphemeral(true);

const toTitleCase = (str: string): string => {
    return str.replace(
        /\w\S*/g,
        (txt: string): string => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        },
    );
};

useChatCommand(guessBuilder, async (interaction: ChatInputCommandInteraction) => {
    const userId = interaction.user.id;
    const userGuess = toTitleCase(interaction.options.getString("name", true));

    if (!guessEnabled) {
        const embed = new EmbedBuilder()
            .setTitle("macOS Name Guess is not enabled")
            .setDescription("Sorry, but you're not able to set your guess right now.")
            .setColor("Red");

        let guess = await Guess.findOne({user: userId});

        if (guess) {
            embed.addFields({
                name: "Your current guess",
                value: `macOS ${guess.guess}`,
                inline: false,
            });
        }

        return {
            embeds: [embed],
        };
    }

    let guess = await Guess.findOneAndUpdate(
        {user: userId},
        {user: userId, guess: userGuess},
        {new: true, upsert: true},
    );

    const embed = new EmbedBuilder()
        .setTitle("You've submitted your guess for macOS 14's name.")
        .setDescription(`You set your guess to 'macOS ${guess.guess}'`)
        .setColor("Fuchsia");

    return {
        embeds: [embed],
    };
});