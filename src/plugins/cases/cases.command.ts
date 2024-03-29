import {bold, ChatInputCommandInteraction, PermissionFlagsBits, userMention} from "discord.js";
import {SlashCommandBuilder, SlashCommandScope} from "../../builders/SlashCommandBuilder";
import {Case} from "./Case.model";
import {useChatCommand} from "../../hooks/useChatCommand";

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
                {name: "Warn", value: "WARN"},
                {name: "Ban", value: "BAN"},
                {name: "Unban", value: "UNBAN"},
                {name: "Kick", value: "KICK"},
                {name: "Timeout", value: "TIMEOUT"},
            ),
    );

useChatCommand(
    builder as SlashCommandBuilder,
    async (interaction: ChatInputCommandInteraction) => {

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
        const count = await Case.countDocuments(filter);

        if (count < 1) {
            return `Sorry mate, couldn't find any cases that match your search! 🤠`;
        }
        const results = await Case.find(filter)
            .sort({createdAtTimestamp: "desc"})
            .limit(6);

        const resultsList = results.reduce((acc, result) => {
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

        if (count > 6) {
            return `Strewth! Found ${count.toLocaleString()} cases that match what you're after. Check out the latest 6!\n${resultsList}`;
        } else {
            return `Found ${count.toLocaleString()} cases that fit the bill. Here ya go cobber!\n${resultsList}`
        }
    },
);
