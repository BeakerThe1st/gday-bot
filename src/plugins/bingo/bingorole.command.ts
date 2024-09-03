import { useChatCommand, useClient } from "../../hooks";
import { Bingo } from "./Bingo.model";
import { BingoCheck } from "./BingoCheck.model";
import { GUILDS } from "../../globals";
import { GdayChatCommandBuilder } from "../../structs/GdayChatCommandBuilder";
import { PermissionFlagsBits } from "discord.js";
import { CommandScope } from "../../structs/GdayCommandBuilder";

const builder = new GdayChatCommandBuilder()
    .setName("bingorole")
    .setDescription("Applies bingo role to current winners")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setScope(CommandScope.MAIN_GUILD);

useChatCommand(builder as GdayChatCommandBuilder, async () => {
    const bingos = await Bingo.find();
    const check = (await BingoCheck.findOne()) ?? (await BingoCheck.create({}));
    const filteredBingos = bingos.filter((bingo) => {
        const { board } = bingo;
        //board is a 2D array of columns
        const topLeftDiag = [];
        const topRightDiag = [];
        for (let n = 0; n < 5; n++) {
            //Check the nth column
            if (board[n].every((card) => check.bingoEntries.get(card)))
                return true;
            //Check the nth row (access n from each column)
            const nthRow = [];
            for (const col of board) {
                nthRow.push(col[n]);
            }
            if (nthRow.every((card) => check.bingoEntries.get(card)))
                return true;

            //Add to diagonals (top left = board[0][0], board[1][1], ...) (top right = board[5][0], board[4][1], ...)
            topLeftDiag.push(board[n][n]);
            topRightDiag.push(board[4 - n][n]);
        }

        //Check diagonals
        if (topLeftDiag.every((card) => check.bingoEntries.get(card)))
            return true;
        if (topRightDiag.every((card) => check.bingoEntries.get(card)))
            return true;
    });
    const rApple = await useClient().guilds.fetch(GUILDS.MAIN);
    for (const bingo of filteredBingos) {
        try {
            const member = await rApple.members.fetch(bingo.user);
            await member.roles.add("1237433543429460029");
        } catch {
            //ignored
        }
    }
    return `Applied role to ${filteredBingos.length} entries`;
});
