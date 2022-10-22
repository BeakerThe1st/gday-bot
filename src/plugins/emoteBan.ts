import { Message } from "discord.js";
import { useEvent } from "../hooks";

useEvent("messageCreate", async (message: Message) => {
  const { author } = message;
  if (author.id === "863834256484728862") {
    await message.delete();
    await message.channel.send(
      `Sorry ${author} you are banned from sending messages.`
    );
  }
});
