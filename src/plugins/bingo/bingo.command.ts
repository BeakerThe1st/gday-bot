import { GdayChatCommandBuilder } from "../../structs/GdayChatCommandBuilder";
import { AttachmentBuilder } from "discord.js";
import { useChatCommand } from "../../hooks";
import { bingoTiles } from "./bingoTiles";
import { Bingo } from "./Bingo.model";
import { createCanvas, loadImage } from "canvas";
import path from "path";
import { BingoCheck } from "./BingoCheck.model";
import { NEXT_EVENT } from "../../globals";
import { CommandScope } from "../../structs/GdayCommandBuilder";

const builder = new GdayChatCommandBuilder()
    .setName("bingo")
    .setDescription("Views your bingo card")
    .setScope(CommandScope.MAIN_GUILD);

const generateBoard = () => {
    const board: string[][] = [];
    let availableOptions = Array.from(bingoTiles.keys());
    availableOptions.splice(availableOptions.indexOf("free_space"), 1);
    for (let rowIndex = 0; rowIndex < 5; rowIndex++) {
        let row: string[] = [];
        for (let colIndex = 0; colIndex < 5; colIndex++) {
            if (rowIndex === 2 && colIndex === 2) {
                row[colIndex] = "free_space";
            } else {
                let chosenOptionIndex = Math.floor(
                    Math.random() * availableOptions.length,
                );
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

    const imageDir = path.join(process.cwd(), "/src/plugins/bingo/assets/");

    try {
        const bg = await loadImage(`${imageDir}bg.png`);
        ctx.drawImage(bg, 0, 0, 600, 655);
    } catch {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, 600, 655);
    }

    const X_OFFSET = 25;
    const Y_OFFSET = 80;
    const SQUARE_WIDTH = 110;

    const check = await BingoCheck.findOne();

    board.forEach((row, rowIndex) => {
        row.forEach(async (col, colIndex) => {
            const x = SQUARE_WIDTH * rowIndex + X_OFFSET;
            const y = SQUARE_WIDTH * colIndex + Y_OFFSET;
            if (check?.bingoEntries.get(col)) {
                const checkedImage = await loadImage(`${imageDir}checked.png`);
                ctx.drawImage(
                    checkedImage,
                    x - 1,
                    y - 1,
                    SQUARE_WIDTH + 2,
                    SQUARE_WIDTH + 2,
                );
            }
            try {
                const image = await loadImage(`${imageDir}/tiles/${col}.png`);
                ctx.drawImage(image, x, y, SQUARE_WIDTH, SQUARE_WIDTH);
            } catch {
                ctx.font = "semibold 14px SF Pro Display";
                ctx.fillStyle = "white";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                const lines: string[] = [""];
                for (const word of (bingoTiles.get(col) ?? "empty").split(
                    " ",
                )) {
                    let added = false;
                    for (let i = 0; i < lines.length; i++) {
                        if (
                            ctx.measureText(`${lines[i]} ${word}`).width <
                            SQUARE_WIDTH * 0.9
                        ) {
                            lines[i] = `${lines[i]} ${word}`;
                            added = true;
                            break;
                        }
                    }
                    if (!added) {
                        lines.push(`${word}`);
                    }
                }
                for (let i = 0; i < lines.length; i++) {
                    let yOffset = y + SQUARE_WIDTH / 2 + 7;
                    if (i < lines.length / 2) {
                        yOffset -= 14 * (lines.length / 2 - i) - 1;
                    } else {
                        yOffset += 14 * (lines.length / 2 - i) + 1;
                    }
                    ctx.fillText(lines[i], x + SQUARE_WIDTH / 2, yOffset);
                }
            }
        });
    });

    return new AttachmentBuilder(canvas.createPNGStream(), {
        name: "bingo.png",
    });
};

useChatCommand(builder as GdayChatCommandBuilder, async (interaction) => {
    if (process.env.NODE_ENV !== "development") {
        return `Bingo is not quite ready yet. Stay tuned!`;
    }
    const PERSIST = process.env.NODE_ENV !== "development";
    const OVER = Date.now() > (NEXT_EVENT?.timestamp ?? Infinity);
    const userId = interaction.user.id;
    let board;
    if (PERSIST) {
        board = await Bingo.findOne({ user: userId });
        if (!board) {
            if (OVER) {
                return `Sorry you missed out on bingo this time around!`;
            }
            board = await Bingo.create({
                user: userId,
                board: generateBoard(),
            });
        }
    } else {
        board = { board: generateBoard() };
    }

    return {
        content: `Here's your ${NEXT_EVENT?.name || "apple event"} bingo board!${PERSIST ? "" : " **PERSISTENCE IS DISABLED**"}`,
        files: [await prettyBoard(board.board)],
    };
});
