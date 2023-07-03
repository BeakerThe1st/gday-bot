import { Tag } from "./Tag.model";
import {inlineCode} from "discord.js";
export const fetchTags = async (guildId: string) => {
    const tags = await Tag.find({guild: guildId});
    if (tags.length > 0) return tags;
    return null;
}

export const createTag = async (guild: string, author: string, name: string, content: string) => {
    try {
        return await Tag.create({name, content, author, guild});
    } catch (e) {
        /* TODO: We can add some feedback to the user for whenever a duplicate raises an error.
            This could be done through checking if error.name is MongoError and error.code is 11000 (MongoDB's error code for dupes)
         */
        throw new Error(`Tag ${inlineCode(name)} could not be created.`)
    }
}

export const editTagName = async (guild: string, author: string, name: string, newName: string) => {
    const tag = await Tag.findOne({name, guild});
    if (!tag) throw new Error(`Tag ${inlineCode(name)} was not found.`);
    tag.name = newName;
    tag.author = author;
    return await tag.save();
}
export const editTagContent = async (guild: string, author: string, name: string, newContent: string) => {
    const tag = await Tag.findOne({name, guild});
    if (!tag) throw new Error(`Tag ${inlineCode(name)} was not found.`);
    tag.content = newContent;
    tag.author = author;
    return await tag.save();
}

export const deleteTag = async (guild: string, name: string) => {
    const tag = await Tag.findOne({guild, name});
    if (!tag) throw new Error(`Tag ${inlineCode(name)} not found.`);
    try {
        await tag.delete();
    } catch (e) {
        throw new Error(`Tag ${inlineCode(name)} could not be deleted.`)
    }
}