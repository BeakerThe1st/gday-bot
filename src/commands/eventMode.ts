import { useChatCommand } from "./../hooks/useChatCommand";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  inlineCode,
  PermissionFlagsBits,
  TextBasedChannel,
  time,
  TimestampStyles,
  BaseMessageOptions,
} from "discord.js";
import {
  SlashCommandBuilder,
  SlashCommandScope,
} from "../builders/SlashCommandBuilder";
import { NEXT_EVENT } from "../globals";

const builder = new SlashCommandBuilder()
  .setName("eventmode")
  .setDescription("Manages event mode.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .setScope(SlashCommandScope.MAIN_GUILD)
  .addSubcommand((subcommand) =>
    subcommand.setName("start").setDescription("Starts event mode.")
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("stop").setDescription("Stops event mode.")
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("prompt")
      .setDescription("Displays the event mode prompt.")
  )
  .addSubcommandGroup((group) =>
    group
      .setName("set")
      .setDescription("Sets event mode parameters.")
      .addSubcommand((subcommand) =>
        subcommand
          .setName("image")
          .setDescription("Sets event mode prompt image.")
          .addStringOption((option) =>
            option
              .setName("image_url")
              .setDescription("Image URL for event mode prompt")
              .setRequired(true)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("interval")
          .setDescription("Sets interval between event mode prompts.")
          .addNumberOption((option) =>
            option
              .setName("interval")
              .setDescription(
                "Interval between event mode prompts (IN MILLISECONDS 1000MS = 1 SEC)."
              )
              .setRequired(true)
              .setMinValue(1000)
              .setMaxValue(2147483647)
          )
      )
  );

const eventModes: Map<string, EventMode> = new Map();

useChatCommand(
  builder as SlashCommandBuilder,
  (interaction: ChatInputCommandInteraction) => {
    if (!interaction.channel) {
      throw new Error("That command must only be run in a channel.");
    }
    const { channelId } = interaction;
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
          return `Successfully started event mode with a ${eventMode.timerInterval}ms interval.`;
        }
      case "stop":
        if (!eventMode.isRunning()) {
          return `Event mode is not currently running in this channel.`;
        } else {
          eventMode.stopTimer();
          return `Successfully stopped event mode.`;
        }
      case "image":
        const imageUrl = interaction.options.getString("image_url", true);
        eventMode.setImage(imageUrl);
        return `Event mode prompt image set to ${imageUrl}`;
      case "interval":
        const interval = interaction.options.getNumber("interval", true);
        eventMode.setTimerInterval(interval);
        return `Event mode prompt interval set to ${inlineCode(
          `${interval}ms`
        )}`;
      default:
        return eventMode.getPrompt();
    }
  }
);

class EventMode {
  image: string;
  timerInterval: number;
  channel: TextBasedChannel;
  timer?: NodeJS.Timer;

  constructor(channel: TextBasedChannel) {
    this.image = "https://i.imgur.com/2qyUcTl.png";
    this.timerInterval = 60000;
    this.channel = channel;
  }

  getPrompt(): BaseMessageOptions {
    if (!NEXT_EVENT) {
      return { content: "No event is planned at this time." };
    }
    const eventDate = new Date(NEXT_EVENT.timestamp);
    const embed = new EmbedBuilder()
      .setTitle(NEXT_EVENT.name)
      .setDescription(
        `The event ${
          Date.now() > eventDate.getTime() ? "began" : "begins"
        } ${time(
          eventDate,
          TimestampStyles.RelativeTime
        )}. Watch at the links below.`
      )
      .setImage(this.image)
      .setColor("Aqua");
    const actionRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Apple Website")
        .setStyle(ButtonStyle.Link)
        .setURL("https://www.apple.com/apple-events/"),
      new ButtonBuilder()
        .setLabel("YouTube")
        .setStyle(ButtonStyle.Link)
        .setURL("https://youtu.be/ux6zXguiqxM"),
      new ButtonBuilder()
        .setLabel("Leaked Event Footage")
        .setStyle(ButtonStyle.Link)
        .setURL("https://youtu.be/ZoG5jJ3E8rg")
    );
    //@ts-ignore
    return { embeds: [embed], components: [actionRow] };
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

  setTimerInterval(interval: number) {
    this.timerInterval = interval;
    if (this.isRunning()) {
      this.stopTimer();
      this.startTimer();
    }
  }

  isRunning() {
    return this.timer !== undefined;
  }
}
