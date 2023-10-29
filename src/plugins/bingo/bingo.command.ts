import {SlashCommandBuilder, SlashCommandScope} from "../../builders/SlashCommandBuilder";
import {AttachmentBuilder, ChatInputCommandInteraction, PermissionFlagsBits} from "discord.js";
import {useChatCommand} from "../../hooks/useChatCommand";
import {bingoItems} from "./bingoItems";
import {Bingo} from "./Bingo.model";
import {createCanvas, loadImage} from "canvas";
import path from "path";
import {BingoCheck} from "./BingoCheck.model";
import {NEXT_EVENT} from "../../globals";

const builder = new SlashCommandBuilder()
    .setName("bingo")
    .setDescription("Views your bingo card")
    .setScope(SlashCommandScope.MAIN_GUILD);

const generateBoard = () => {
    const board: string[][] = [];
    let availableOptions = Array.from(bingoItems.keys());
    availableOptions.splice(availableOptions.indexOf("free_space"), 1);
    for (let rowIndex = 0; rowIndex < 5; rowIndex++) {
        let row: string[] = [];
        for (let colIndex = 0; colIndex < 5; colIndex++) {
            if (rowIndex === 2 && colIndex === 2) {
                row[colIndex] = "free_space";
            } else {
                let chosenOptionIndex = Math.floor(Math.random() * availableOptions.length);
                row[colIndex] = availableOptions[chosenOptionIndex];
                availableOptions.splice(chosenOptionIndex, 1);
            }
        }
        board.push(row);
    }
    return board;
};

const prettyBoard = async (board: string[][]) => {
    const canvas = createCanvas(600, 655);
    const ctx = canvas.getContext("2d");

    const imageDir = path.join(process.cwd(), "/src/plugins/bingo/bingo_images/");

    const bg = await loadImage(`${imageDir}bg.png`);
    ctx.drawImage(bg, 0, 0, 600, 655);
    ctx.fillStyle = "white";

    const SQUARE_WIDTH = 110;

    const check = await BingoCheck.findOne();

    board.forEach((row, rowIndex) => {
        row.forEach(async (col, colIndex) => {
            const x = SQUARE_WIDTH * rowIndex + 25;
            const y = SQUARE_WIDTH * colIndex + 80;

            try {
                const isChecked = check?.bingoEntries.get(col) ?? false;
                const image = await loadImage(`${imageDir}${col}.png`);
                if (isChecked === true) {
                    const checkedImage = await loadImage(`${imageDir}checked.png`);
                    ctx.drawImage(checkedImage, x + 1, y + 1, SQUARE_WIDTH - 1, SQUARE_WIDTH - 1);
                }
                ctx.drawImage(image, x + 1, y + 1, SQUARE_WIDTH - 1, SQUARE_WIDTH - 1);
            } catch {
                ctx.fillText(col, x + 5, y + 20);
            }
        });
    });

    return new AttachmentBuilder(await canvas.createPNGStream(), {name: "bingo.png"});
};

useChatCommand(builder as SlashCommandBuilder, async (interaction: ChatInputCommandInteraction) => {
    const PERSIST = false;
    const userId = interaction.user.id;
    let board;
    if (PERSIST) {
        board = await Bingo.findOne({user: userId});
        if (!board) {
            board = await Bingo.create({user: userId, board: generateBoard()});
        }
    } else {
        board = {board: generateBoard()};
    }


    return {
        content: `Here's your ${NEXT_EVENT?.name || "apple event"} bingo board!${PERSIST ? "" : " **PERSISTENCE IS DISABLED**"}`,
        files: [await prettyBoard(board.board)],
    };
});