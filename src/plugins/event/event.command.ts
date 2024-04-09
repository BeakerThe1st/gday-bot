import { useChatCommand } from "../../hooks/useChatCommand";
import {
  SlashCommandBuilder,
  SlashCommandScope,
} from "../../builders/SlashCommandBuilder";
import { NEXT_EVENT } from "../../globals";
import { EmbedBuilder, time, TimestampStyles } from "discord.js";

const builder = new SlashCommandBuilder()
  .setName("event")
  .setDescription("Throws up info on the next Apple event!")
  .setScope(SlashCommandScope.MAIN_GUILD);

useChatCommand(builder, () => {
  const event = NEXT_EVENT;
  if (!event) {
    return "no event soz";
  }
  const eventDate = new Date(event.timestamp);
  const afterEvent = Date.now() > eventDate.getTime();
  const embed = new EmbedBuilder()
    .setTitle(event.name)
    .setDescription(
      `Apple's ${event.name} event ${
        afterEvent ? "started" : "starts"
      } at ${time(eventDate, TimestampStyles.ShortDateTime)}`,
    )
    .setColor(NEXT_EVENT?.color ?? "White")
    .setThumbnail(event.image)
    .addFields({
      name: "Time to Event",
      value: `Event ${afterEvent ? "began" : "begins"} ${time(
        eventDate,
        TimestampStyles.RelativeTime,
      )}`,
    })
    .setFooter({ text: "All times shown in your local time zone." });
  return { embeds: [embed] };
});
