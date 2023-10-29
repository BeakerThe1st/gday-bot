import {SlashCommandBuilder, SlashCommandScope} from "../../builders/SlashCommandBuilder";
import {bold, ChatInputCommandInteraction, Colors, EmbedBuilder, PermissionFlagsBits} from "discord.js";
import {useChatCommand} from "../../hooks/useChatCommand";
import {bingoItems} from "./bingoItems";
import {BingoCheck} from "./BingoCheck.model";
import {useClient} from "../../hooks";
const builder = new SlashCommandBuilder()
    .setName("bingocheck")
    .setDescription("Checks/unchecks a bingo item")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption((option) =>
        option.setName("bingo_id")
            .setDescription("Bingo item ID")
            .setRequired(true)
    )
    .setEphemeral(true)
    .setScope(SlashCommandScope.MAIN_GUILD);
useChatCommand(builder as SlashCommandBuilder, async (interaction: ChatInputCommandInteraction) => {
    const id = interaction.options.getString("bingo_id", true);
    if (!Array.from(bingoItems.keys()).includes(id)) {
        return "Not a bingo key!"
    }
    const check = await BingoCheck.findOne() ?? await BingoCheck.create({});
    let current = check.bingoEntries.get(id) ?? false;
    check.bingoEntries.set(id, !current);
    await check.save();
    const logChannel = await useClient().client.channels.fetch("1150597671921401876")
    if (logChannel?.isTextBased() && !current) {
        logChannel.send({
            embeds: [new EmbedBuilder()
                .setDescription(`${bold(bingoItems.get(id) ?? "A tile")} has been checked!\n\nView your personalised bingo board with </bingo:1146636308765212746>`)
                .setColor(Colors.Green)
                .setThumbnail(`https://rapple.xyz/bingo_images/${id}.png`)
            ]
        })
    }
    return `${current ? "Unchecked" : "Checked"} \`${id}\``;
    /*const bingos = await Bingo.find();
    const check = await BingoCheck.findOne() ?? await BingoCheck.create({});
    const filteredBingos = bingos.filter((bingo) => {
        const {board} = bingo;
        //board is a 2D array of columns
        const topLeftDiag = [];
        const topRightDiag = [];
        for (let n = 0; n < 5; n++) {
            //Check the nth column
            if (board[n].every(card => check.bingoEntries.get(card))) return true;
            //Check the nth row (access n from each column)
            const nthRow = [];
            for (const col of board) {
                nthRow.push(col[n])
            }
            if (nthRow.every(card => check.bingoEntries.get(card))) return true;

            //Add to diagonals (top left = board[0][0], board[1][1], ...) (top right = board[5][0], board[4][1], ...)
            topLeftDiag.push(board[n][n])
            topRightDiag.push(board[4 - n][n])
        }

        //Check diagonals
        if (topLeftDiag.every(card => check.bingoEntries.get(card))) return true;
        if (topRightDiag.every(card => check.bingoEntries.get(card))) return true;
    })
    const rApple = await useClient().client.guilds.fetch("332309672486895637");
    for (const bingo of filteredBingos) {
        try {
            const member = await rApple.members.fetch(bingo.user);
            await member.roles.add("1151232815111872552")
        } catch {
            //ignored
        }
    }
    return `Applied role to ${filteredBingos.length} entries`;*/
});
