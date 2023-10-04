import { useEvent } from "../../hooks";
import { Interaction, userMention } from "discord.js";

useEvent("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isButton()) {
        return;
    }
    const [interactionType, action, userId] = interaction.customId.split("-");
    const message = interaction.message;
    
    if (interactionType !== "appeal" || action !== "thread") {
        return;
    }

    const sendEphemeralReply = async (content: string) => {
        await interaction.reply({
            content: content,
            ephemeral: true
        });
    };

    try {
        await message.startThread({
            name: `${userId}`
        });
        await sendEphemeralReply(`A thread for ${userMention(userId)} (${userId}) is created.`);
    }
    
    catch (error) {
        if (error && typeof error === "object" && "code" in error && error.code === "MessageExistingThread") {
            await sendEphemeralReply(`The thread for ${userMention(userId)} (${userId}) already exists.`);
        } else {
            // Handle other possible errors with a custom message
            await sendEphemeralReply(`An error occurred when creating this thread.`);
            console.error(error);
        }
    }
});