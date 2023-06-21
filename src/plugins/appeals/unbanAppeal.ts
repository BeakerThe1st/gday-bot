import {useClient, useEvent} from "../../hooks";
import {Interaction, Message} from "discord.js";
import {GUILDS} from "../../globals";

useEvent("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isButton()) {
        return;
    }
    const {customId} = interaction;
    const [interactionType, action, userId] = customId.split("-");
    if (interactionType !== "appeal") {
        return;
    }
    if (action !== "unban") {
        return;
    }
    await interaction.deferReply({ephemeral: true});
    const {client} = useClient();
    try {
        const rApple = await client.guilds.fetch(GUILDS.MAIN);
        await rApple.bans.remove(userId, `${interaction.user.id} via ban appeal button`);
        await interaction.editReply(`Unbanned <@${userId}>`);
    } catch {
        await interaction.reply("Could not unban user");
        return;
    }
    const {message} = interaction;
    if (message instanceof Message) {
        await message.edit({
            content: `<@${userId}> unbanned by ${interaction.user}`,
            components: [],
        });
    }
    const unbanChannel = await client.channels.fetch("934958626257375244");
    if (unbanChannel?.isTextBased()) {
        await unbanChannel.send({
            content: `<@${userId}>, your appeal was successful and you have been unbanned. You may rejoin the server at https://discord.gg/apple`,
            allowedMentions: {
                users: [userId],
            },
        });
    }
});
