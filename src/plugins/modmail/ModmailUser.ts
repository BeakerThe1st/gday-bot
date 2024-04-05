import {model, Schema} from "mongoose";

export interface IModmailUser {
    userId: String,
    blocklisted: boolean,
    threadCount: number
}

const modmailUserSchema = new Schema<IModmailUser>({
    userId: String,
    blocklisted: Boolean,
    threadCount: Number
});

export const ModmailUser = model<IModmailUser>("modmailUser", modmailUserSchema)