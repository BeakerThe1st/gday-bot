import {
    ActionRowBuilder,
    bold,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    Message,
    PermissionFlagsBits,
    userMention,
} from "discord.js";
import {
    SlashCommandBuilder,
    SlashCommandScope,
} from "../../structs/SlashCommandBuilder";
import { Case, ICase } from "./Case.model";
import { useButton, useChatCommand, usePagination } from "../../hooks";
import { GdayButtonBuilder } from "../../structs/GdayButtonBuilder";

const builder = new SlashCommandBuilder()
    .setName("cases")
    .setDescription(
        "Has a squiz at all the cases in the guild, filtered by your specs.",
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setScope(SlashCommandScope.MAIN_GUILD)
    .addUserOption((option) =>
        option.setName("executor").setDescription("Case executor."),
    )
    .addUserOption((option) =>
        option.setName("target").setDescription("Case target."),
    )
    .addStringOption((option) =>
        option
            .setName("type")
            .setDescription("Case type.")
            .setChoices(
                { name: "Warn", value: "WARN" },
                { name: "Ban", value: "BAN" },
                { name: "Unban", value: "UNBAN" },
                { name: "Kick", value: "KICK" },
                { name: "Timeout", value: "TIMEOUT" },
            ),
    );
useChatCommand(builder as SlashCommandBuilder, async (interaction) => {
    //Create a filter and push it to messagesToFilters
    const executor = interaction.options.getUser("executor");
    const target = interaction.options.getUser("target");
    const type = interaction.options.getString("type");
    let filter: any = {
        deleted: false,
    };
    if (executor) {
        filter.executor = executor.id;
    }
    if (target) {
        filter.target = target.id;
    }
    if (type) {
        filter.type = type;
    }

    const stringify = (result: ICase) => {
        let str = `${bold(result._id)} - ${result.type} on ${userMention(
            result.target,
        )}`;
        if (result.executor) {
            str += ` by ${userMention(result.executor)}`;
        }
        if (result.reason) {
            str += ` for ${result.reason}`;
        }
        return str;
    };

    return usePagination<ICase>({
        preamble: "Found %count cases that fit the bill. Here ya go cobber!",
        emptyMsg:
            "Sorry mate, couldn't find any cases that match your search! 🤠",
        query: Case.find(filter).sort({ createdAtTimestamp: "desc" }),
        stringify,
        perPage: 6,
        owner: interaction.user.id,
    });
});
