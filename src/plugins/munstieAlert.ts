import { Message, userMention } from "discord.js";
import { useEvent } from "../hooks";

useEvent("messageCreate", async (message: Message) => {
  if (!message.guild) {
    return;
  }
  if (
    message.guild.id === "332309672486895637" &&
    message.content.toLowerCase().includes("moo")
  ) {
    if (!message.mentions.users.get("297567836254240768")) {
      await message.reply({
        content: `${userMention("297567836254240768")} 🤪`,
        allowedMentions: {
          users: ["297567836254240768"],
        },
      });
    }
  }
});
