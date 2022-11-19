import { Message, userMention } from "discord.js";
import { useEvent } from "../hooks";

useEvent("messageCreate", async (message: Message) => {
  if (!message.guild) {
    return;
  }
  if (
    message.guild.id === "332309672486895637" &&
    message.content.toLowerCase().includes("munstie")
  ) {
    if (!message.mentions.users.get("247133649206640640")) {
      await message.reply(`${userMention("247133649206640640")} 🤪`);
    }
  }
});
