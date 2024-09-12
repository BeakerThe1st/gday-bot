import { model, Schema } from "mongoose";

export interface IBingoCheck {
    bingoEntries: Map<string, boolean>;
}

const bingoCheckSchema = new Schema<IBingoCheck>({
    bingoEntries: {
        type: Map,
        of: Boolean,
        default: {},
    },
});

export const BingoCheck = model<IBingoCheck>("bingocheck", bingoCheckSchema);
