import { Message } from "discord.js";
import { useEvent } from "../hooks";

useEvent("messageCreate", async (message: Message) => {
  if (message.content.includes("🤭")) {
    if (message.author.id === "863834256484728862") {
      await message.delete();
      await message.channel.send(
        `Sorry ${message.author} you are banned from using that emote. 🤭🤭🤭`
      );
    }
  }
});
