import {SlashCommandBuilder, SlashCommandScope} from "../builders/SlashCommandBuilder";
import {ChatInputCommandInteraction, PermissionFlagsBits} from "discord.js";
import {useChatCommand} from "../hooks/useChatCommand";
import {bingoItems} from "../utils/bingoItems";
import {BingoCheck} from "../database/BingoCheck";
import {Bingo} from "../database/Bingo";

const options = Array.from(bingoItems.keys()).map((key) => ({
    name: key,
    value: key
}));

const builder = new SlashCommandBuilder()
    .setName("bingocheck")
    .setDescription("Checks/unchecks a bingo item")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption((option) =>
        option.setName("bingo_id")
            .setDescription("Bingo item ID")
            .setRequired(true)
            .setChoices(...options))
    .setScope(SlashCommandScope.MAIN_GUILD);



useChatCommand(builder as SlashCommandBuilder, async (interaction: ChatInputCommandInteraction) => {
    const id = interaction.options.getString("bingo_id", true);
    const check = await BingoCheck.findOne() ?? await BingoCheck.create({});
    let current = check.bingoEntries.get(id) ?? false;
    check.bingoEntries.set(id, !current);
    await check.save();
    return `Successfully ${current ? "un" : ""}checked \`${id}\``
});
