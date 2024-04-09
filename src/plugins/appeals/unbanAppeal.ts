import { useClient } from "../../hooks";
import { ButtonInteraction, userMention } from "discord.js";
import { CHANNELS, GUILDS } from "../../globals";
import { useButton } from "../../hooks/useButton";

useButton("appeal:unban", async (interaction: ButtonInteraction, [userId]) => {
    await interaction.deferReply({ ephemeral: true });
    const { client } = useClient();
    const rApple = await client.guilds.fetch(GUILDS.MAIN);
    await rApple.bans.remove(userId, `${interaction.user.id} appealed`);
    await interaction.message.edit({
        content: `${userMention(userId)} unbanned by ${interaction.user}`,
        components: []
    });

    const unbanChannel = await client.channels.fetch(
        CHANNELS.APPEALS.unban_announcements
    );
    if (unbanChannel?.isTextBased()) {
        await unbanChannel.send({
            content: `${userMention(userId)}, your appeal was successful and you have been unbanned. You may rejoin the server at https://discord.gg/apple`,
            allowedMentions: {
                users: [userId]
            }
        });
    }

    return `Unbanned ${userMention(userId)}`;
});
