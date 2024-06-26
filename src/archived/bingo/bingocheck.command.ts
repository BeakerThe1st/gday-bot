import { GdayChatCommandBuilder } from "../../structs/GdayChatCommandBuilder";
import { bold, Colors, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { useChatCommand } from "../../hooks/";
import { BingoCheck } from "./BingoCheck.model";
import { useClient } from "../../hooks";
import { bingoTiles } from "./bingoTiles";
import { CommandScope } from "../../structs/GdayCommandBuilder";
import { Bingo } from "./Bingo.model";
import { GUILDS } from "../../globals";

const builder = new GdayChatCommandBuilder()
    .setName("bingocheck")
    .setDescription("Checks/unchecks a bingo item")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setEphemeral(true)
    .setScope(CommandScope.MAIN_GUILD)
    .addStringOption((option) =>
        option
            .setName("bingo_id")
            .setDescription("Bingo item ID")
            .setRequired(true),
    );
useChatCommand(builder as GdayChatCommandBuilder, async (interaction) => {
    /*const id = interaction.options.getString("bingo_id", true);
    if (!Array.from(bingoTiles.keys()).includes(id)) {
        return "Not a bingo key!";
    }
    const check = (await BingoCheck.findOne()) ?? (await BingoCheck.create({}));
    let current = check.bingoEntries.get(id) ?? false;
    check.bingoEntries.set(id, !current);
    await check.save();
    const logChannel = await useClient().channels.fetch("1236508820201541713");
    if (logChannel?.isTextBased() && !current) {
        logChannel.send({
            embeds: [
                new EmbedBuilder()
                    .setDescription(
                        `${bold(bingoTiles.get(id) ?? "A tile")} has been checked!\n\nView your personalised bingo board with </bingo:1236301356315181077>`,
                    )
                    .setColor(Colors.Green)
                    .setThumbnail(`https://rapple.xyz/bingo_images/${id}.png`),
            ],
        });
    }
    return `${current ? "Unchecked" : "Checked"} \`${id}\``;*/
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
