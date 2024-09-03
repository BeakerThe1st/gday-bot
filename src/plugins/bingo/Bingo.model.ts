import { model, Schema } from "mongoose";

export interface IBingo {
    user: string;
    board: string[][];
}

const bingoSchema = new Schema<IBingo>({
    user: String,
    board: [[String]],
});

export const Bingo = model<IBingo>("bingo", bingoSchema);
