import {model, Schema} from "mongoose";

export interface IGuess {
    user: string;
    guess: string;
}

const guessSchema = new Schema<IGuess>({
    user: String,
    guess: String
})

export const Guess = model<IGuess>("guess", guessSchema);