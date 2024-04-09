import { model, Schema } from "mongoose";

export interface ITag {
    name: string;
    content: string;
    author: string;
    guild: string;
    usesCount: number;
}

const tagSchema = new Schema<ITag>({
    name: String,
    content: String,
    author: String,
    guild: String,
    usesCount: { type: Number, default: 0 }
});

// Guild + Tag Name combinations should be unique
tagSchema.index({ name: 1, guild: 1 }, { unique: true });
export const Tag = model<ITag>("tag", tagSchema);
