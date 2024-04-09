import { model, Schema } from "mongoose";

export interface IRAppleUser {
    userId: String;
    modmailBlocklisted: boolean;
    scratchpad: string;
}

const rAppleUserSchema = new Schema<IRAppleUser>({
    userId: String,
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
