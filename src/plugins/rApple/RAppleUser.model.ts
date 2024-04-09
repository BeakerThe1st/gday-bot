import { model, Schema } from "mongoose";

export interface IRAppleUser {
    userId: String;
    modmailBlocklisted: boolean;
    scratchpad: string;
    modmailThreadCount: number;
}

const rAppleUserSchema = new Schema<IRAppleUser>({
    userId: String,
    modmailThreadCount: {
        type: Number,
        default: 0,
    },
    modmailBlocklisted: {
        type: Boolean,
        default: false,
    },
    scratchpad: {
        type: String,
        default: "",
    },
});

export const RAppleUser = model<IRAppleUser>("rAppleUser", rAppleUserSchema);
