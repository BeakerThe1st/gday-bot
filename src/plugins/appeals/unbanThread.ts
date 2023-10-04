import {useEvent} from "../../hooks";
import {Interaction, Message} from "discord.js";

useEvent("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isButton()) {
        return;
    }
    const {customId} = interaction;
    const [interactionType, action, userTag, userId] = customId.split("-");
    const {message} = interaction;
    if (interactionType !== "appeal") {
        return;
    }
    if (action !== "thread") {
        return;
    }
    try {
        await interaction.message.startThread ({
            name: `Appeal Thread - ${userTag}`
        })
    } catch {
        await interaction.reply({
            content: `A thread was already created for <@${userId}>.`,
            ephemeral: true,
        });
        return;
    }
    if (message instanceof Message) {
        await interaction.reply({
            // Replace interaction.user with appealee's username.
            content: `The thread for <@${userId}> is created.`,
            ephemeral: true,
        });
    }
});