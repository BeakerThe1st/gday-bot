import {useChatCommand} from "../../hooks/useChatCommand";
import {
    ActionRowBuilder,
    BaseMessageOptions,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    inlineCode,
    PermissionFlagsBits,
    TextBasedChannel,
    time,
    TimestampStyles,
} from "discord.js";
import {SlashCommandBuilder, SlashCommandScope} from "../../builders/SlashCommandBuilder";
import {NEXT_EVENT} from "../../globals";

const builder = new SlashCommandBuilder()
    .setName("eventmode")
    .setDescription("Manages event mode.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setScope(SlashCommandScope.MAIN_GUILD)
    .addSubcommand((subcommand) =>
        subcommand.setName("start").setDescription("Kicks off event mode, time to throw another shrimp on the barbie!"),
    )
    .addSubcommand((subcommand) =>
        subcommand.setName("stop").setDescription("Puts a stop to event mode, like closing up shop after a ripper day."),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("prompt")
            .setDescription("Pops up the prompt for event mode, time to crack open a cold one."),
    )
    .addSubcommandGroup((group) =>
        group
            .setName("set")
            .setDescription("Sets event mode parameters.")
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("image")
                    .setDescription("Sets the image for the event mode prompt, fair dinkum.")
                    .addStringOption((option) =>
                        option
                            .setName("image_url")
                            .setDescription("Image URL for event mode prompt")
                            .setRequired(true),
                    ),
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("interval")
                    .setDescription("Sets how long between event mode prompts, like timing your snag on the barbie just right.")
                    .addNumberOption((option) =>
                        option
                            .setName("interval")
                            .setDescription(
                                "Interval between event mode prompts in seconds.",
                            )
                            .setRequired(true)
                            .setMinValue(1)
                            .setMaxValue(1440),
                    ),
            ),
    );

const eventModes: Map<string, EventMode> = new Map();

useChatCommand(
    builder as SlashCommandBuilder,
    (interaction: ChatInputCommandInteraction) => {
        if (!interaction.channel) {
            throw new Error("That command must only be run in a channel.");
        }
        const {channelId} = interaction;
        let eventMode = eventModes.get(channelId);
        if (!eventMode) {
            eventMode = new EventMode(interaction.channel);
            eventModes.set(channelId, eventMode);
        }

        const subCommand = interaction.options.getSubcommand();
        switch (subCommand) {
            case "start":
                if (eventMode.isRunning()) {
                    return `Event mode is already running in this channel.`;
                } else {
                    eventMode.startTimer();
                    return `Event mode started with a ${eventMode.timerInterval / 1000} second interval.`;
                }
            case "stop":
                if (!eventMode.isRunning()) {
                    return `Event mode is not currently running in this channel.`;
                } else {
                    eventMode.stopTimer();
                    return `Event mode stopped.`;
                }
            case "image":
                const imageUrl = interaction.options.getString("image_url", true);
                eventMode.setImage(imageUrl);
                return `Event mode prompt image set to ${imageUrl}`;
            case "interval":
                const interval = interaction.options.getNumber("interval", true);
                eventMode.setTimerInterval(interval);
                return `Event mode prompt interval set to ${inlineCode(
                    `${interval}s`,
                )}`;
            default:
                return eventMode.getPrompt();
        }
    },
);

class EventMode {
    image: string;
    timerInterval: number;
    channel: TextBasedChannel;
    timer?: NodeJS.Timeout;

    constructor(channel: TextBasedChannel) {
        this.image = "https://i.imgur.com/TTLYc3D.png";
        this.timerInterval = 60000;
        this.channel = channel;
    }

    getPrompt(): BaseMessageOptions {
        if (!NEXT_EVENT) {
            return {content: "No event is planned at this time."};
        }
        const eventDate = new Date(NEXT_EVENT.timestamp);
        const embed = new EmbedBuilder()
            .setTitle(NEXT_EVENT.name)
            .setDescription(
                `The event ${
                    Date.now() > eventDate.getTime() ? "began" : "begins"
                } ${time(
                    eventDate,  
                    TimestampStyles.RelativeTime,
                )}. Watch at the links below.`,
            )
            .setImage(this.image)
            .setColor(NEXT_EVENT?.color ?? "White");
        const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setLabel("Apple Website")
                .setStyle(ButtonStyle.Link)
                .setURL("https://www.apple.com/apple-events/"),
            new ButtonBuilder()
                .setLabel("YouTube")
                .setStyle(ButtonStyle.Link)
                .setURL("https://youtu.be/ctkW3V0Mh-k"),
            new ButtonBuilder()
                .setLabel("Leaked Event Footage")
                .setStyle(ButtonStyle.Link)
                .setURL("https://youtu.be/ZoG5jJ3E8rg"),
        );
        return {embeds: [embed], components: [actionRow]};
    }

    startTimer(timerInterval: number = this.timerInterval) {
        if (this.timer) {
            this.stopTimer();
        }
        this.timer = setInterval(async () => {
            try {
                await this.channel.send(this.getPrompt());
            } catch {
                //ignored
            }
        }, timerInterval);
    }

    stopTimer() {
        clearInterval(this.timer);
        this.timer = undefined;
    }

    setImage(image: string) {
        this.image = image;
    }

    setTimerInterval(intervalInSeconds: number) {
        this.timerInterval = intervalInSeconds * 1000;
        if (this.isRunning()) {
            this.stopTimer();
            this.startTimer();
        }
    }

    isRunning() {
        return this.timer !== undefined;
    }
}
