import { GdayMessageCommandBuilder } from "../../structs/GdayMessageCommandBuilder";
import { CommandScope } from "../../structs/GdayCommandBuilder";
import { useClient, useMessageCommand } from "../../hooks";
import { CHANNELS } from "../../globals";
import { Colors, EmbedBuilder } from "discord.js";

const builder = new GdayMessageCommandBuilder()
    .setName("Report to Mod Team")
    .setEphemeral(true)
    .setScope(CommandScope.MAIN_GUILD);

useMessageCommand(builder as GdayMessageCommandBuilder, async (interaction) => {
    const message = interaction.targetMessage;
    const staffNotices = await useClient().channels.fetch(
        CHANNELS.MAIN.staff_notices,
    );
    if (!(staffNotices && "send" in staffNotices)) {
        return "Could not submit your report. Please notify a moderator by DMing me instead!";
    }

    const embed = new EmbedBuilder()
        .setTitle("Report Submitted")
        .setColor(Colors.DarkRed)
        .setDescription(
            `${interaction.user} has reported ${message.author}'s message in ${message.channel}\n\n${message.url}`,
        )
        .addFields([
            {
                name: "Content",
                value: `${interaction.targetMessage.cleanContent}`,
            },
        ]);

    if (interaction.targetMessage.attachments.size > 0) {
        embed.addFields([
            {
                name: "Attachments",
                value: `${interaction.targetMessage.attachments.map((value) => value.url).join("\n")}`,
            },
        ]);
    }

    await staffNotices.send({ embeds: [embed] });

    return "Your report has been submitted, thanks for helping make r/Apple safer.";
});
