import {
    bold,
    ChatInputCommandInteraction,
    PermissionFlagsBits,
    userMention,
} from "discord.js";
import {
    SlashCommandBuilder,
    SlashCommandScope,
} from "../../builders/SlashCommandBuilder";
import { Case } from "./Case.model";
import { useChatCommand } from "../../hooks/useChatCommand";
import { RAppleUser } from "../rApple/RAppleUser";

const builder = new SlashCommandBuilder()
    .setName("cases")
    .setDescription(
        "Has a squiz at all the cases in the guild, filtered by your specs.",
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setScope(SlashCommandScope.GLOBAL)
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
    const count = await Case.count(filter);
    let hasScratchpad = false;

    if (target) {
        const user = await RAppleUser.findOne({ userId: target.id });
        if (user?.scratchpad) {
            hasScratchpad = true;
        }
    }

    if (count < 1) {
        return `Sorry mate, couldn't find any cases that match your search${hasScratchpad ? ` but they've got a scratchpad entry` : ""}! 🤠`;
    }
    const results = await Case.find(filter)
        .sort({ createdAtTimestamp: "desc" })
        .limit(6);

    let resultsList = results.reduce((acc, result) => {
        let currentStr = `${bold(result._id)} - ${result.type} on ${userMention(
            result.target,
        )}`;
        if (result.executor) {
            currentStr += ` by ${userMention(result.executor)}`;
        }
        if (result.reason) {
            currentStr += ` for ${result.reason}`;
        }
        return acc + `\n- ${currentStr.replaceAll("\n", " ")}`;
    }, "");

    if (hasScratchpad) {
        resultsList += `\n\n📝 User has scratchpad entry`;
    }

    if (count > 6) {
        return `Strewth! Found ${count.toLocaleString()} cases that match what you're after. Check out the latest 6!\n${resultsList}`;
    } else {
        return `Found ${count.toLocaleString()} cases that fit the bill. Here ya go cobber!\n${resultsList}`;
    }
});
