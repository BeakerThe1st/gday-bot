import { useChatCommand } from "../../hooks/useChatCommand";
import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    inlineCode,
    PermissionFlagsBits,
    time,
    TimestampStyles,
    userMention,
} from "discord.js";
import {
    SlashCommandBuilder,
    SlashCommandScope,
} from "../../builders/SlashCommandBuilder";
import { Case } from "./Case.model";

const builder = new SlashCommandBuilder()
    .setName("case")
    .setDescription("Manages a given case.")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setScope(SlashCommandScope.GLOBAL)
    .addSubcommand((subcommand) =>
        subcommand
            .setName("info")
            .setDescription(
                "Spills the beans on all the deets for a particular case, aye.",
            )
            .addStringOption((option) =>
                option
                    .setName("case_id")
                    .setDescription("Case ID")
                    .setRequired(true),
            ),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("reason")
            .setDescription(
                "Gives ya the chance to change the story on a case, just like a good yarn.",
            )
            .addStringOption((option) =>
                option
                    .setName("case_id")
                    .setDescription("Case ID")
                    .setRequired(true),
            )
            .addStringOption((option) =>
                option
                    .setName("new_reason")
                    .setDescription("New reason")
                    .setRequired(true),
            ),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("delete")
            .setDescription("Fair dinkum deletes a specific case, no worries.")
            .addStringOption((option) =>
                option
                    .setName("case_id")
                    .setDescription("Case ID")
                    .setRequired(true),
            ),
    );

useChatCommand(builder as SlashCommandBuilder, async (interaction) => {
    const caseId = interaction.options.getString("case_id", true);
    const givenCase = await Case.findById(caseId);
    if (!givenCase) {
        return `${inlineCode(caseId)} is not a valid case ID`;
    }
    if (givenCase.guild !== interaction.guildId) {
        return `${inlineCode(caseId)} is not from this guild`;
    }
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === "delete") {
        givenCase.deleted = true;
        await givenCase.save();
        return `Deleted ${inlineCode(caseId)}`;
    } else if (subcommand === "reason") {
        const newReason = interaction.options.getString("new_reason", true);
        givenCase.reason = newReason;
        await givenCase.save();
        return `Changed ${inlineCode(caseId)}'s reason to "${newReason}"`;
    } else if (subcommand === "info") {
        const target = await interaction.client.users.fetch(givenCase.target);
        const embed = new EmbedBuilder()
            .setTitle(
                `${givenCase.type[0]}${givenCase.type.slice(1).toLowerCase()}${givenCase.deleted ? " - DELETED" : ""}`,
            )
            .setFooter({ text: givenCase._id })
            .setThumbnail(target.displayAvatarURL())
            .setColor(givenCase.deleted ? "Red" : "Fuchsia");
        if (givenCase.target) {
            embed.addFields({
                name: "Target",
                value: userMention(givenCase.target),
                inline: true,
            });
        }
        if (givenCase.executor) {
            embed.addFields({
                name: "Executor",
                value: userMention(givenCase.executor),
                inline: true,
            });
        }
        embed.addFields({
            name: "Created At",
            value: time(new Date(+givenCase.createdAtTimestamp)),
            inline: true,
        });
        if (givenCase.duration) {
            embed.addFields({
                name: "Expiry",
                value: time(
                    new Date(
                        +givenCase.createdAtTimestamp + givenCase.duration,
                    ),
                    TimestampStyles.RelativeTime,
                ),
                inline: true,
            });
        }

        embed.addFields({
            name: "Reason",
            value: givenCase.reason ?? "No reason specified.",
        });

        return { content: givenCase._id, embeds: [embed] };
    }
    return null;
});
