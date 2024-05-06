import { inlineCode, PermissionFlagsBits } from "discord.js";
import { GdayChatCommandBuilder } from "../../structs/GdayChatCommandBuilder";
import { useChatCommand } from "../../hooks/";
import { CommandScope } from "../../structs/GdayCommandBuilder";

const builder = new GdayChatCommandBuilder()
    .setName("say")
    .setDescription(
        "Makes me, G’day, have a chinwag and say a message, like having a yarn with a mate.\n",
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setEphemeral(true)
    .setScope(CommandScope.GLOBAL)
    .addStringOption((option) =>
        option
            .setName("message")
            .setDescription("Message to say")
            .setRequired(true),
    );
useChatCommand(builder as GdayChatCommandBuilder, async (interaction) => {
    const message = interaction.options.getString("message", true);
    if (!interaction.channel) {
        throw new Error("Channel undefined.");
    }
    await interaction.channel.send({
        content: message,
        allowedMentions: {
            parse: ["users"],
        },
    });
    return `Said ${inlineCode(message)} in ${interaction.channel}`;
});
