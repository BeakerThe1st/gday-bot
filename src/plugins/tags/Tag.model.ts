import {model, Schema} from 'mongoose';

export interface ITag {
    name: string;
    content: string;
    author: string;
    guild: string;
}

const tagSchema = new Schema<ITag>({
    name: String,
    content: String,
    author: String,
    guild: String
})

export const Tag = model<ITag>("tag", tagSchema)