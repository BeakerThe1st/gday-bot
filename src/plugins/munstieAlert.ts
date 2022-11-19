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
      await message.reply({
        content: `${userMention("247133649206640640")} 🤪`,
        allowedMentions: {
          users: ["247133649206640640"],
        },
      });
    }
  }
});
