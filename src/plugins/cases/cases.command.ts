import {
    bold,
    ButtonStyle,
    PermissionFlagsBits,
    userMention,
} from "discord.js";
import { GdayChatCommandBuilder } from "../../structs/GdayChatCommandBuilder";
import { Case, ICase } from "./Case.model";
import { useChatCommand, usePagination, useUserCommand } from "../../hooks";
import { CommandScope } from "../../structs/GdayCommandBuilder";
import { GdayUserCommandBuilder } from "../../structs/GdayUserCommandBuilder";

const chatCommandBuilder = new GdayChatCommandBuilder()
    .setName("cases")
    .setDescription(
        "Has a squiz at all the cases in the guild, filtered by your specs.",
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setScope(CommandScope.MAIN_GUILD)
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

const userCommandBuilder = new GdayUserCommandBuilder()
    .setName("Show cases")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setScope(CommandScope.MAIN_GUILD);

const getCasePagination = (filter: any, owner: string) => {
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
        owner,
    });
};

useChatCommand(
    chatCommandBuilder as GdayChatCommandBuilder,
    async (interaction) => {
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
        return getCasePagination(filter, interaction.user.id);
    },
);

useUserCommand(userCommandBuilder, async (interaction) => {
    return getCasePagination(
        {
            guild: interaction.guildId,
            deleted: false,
            target: interaction.targetUser.id,
        },
        interaction.user.id,
    );
});
