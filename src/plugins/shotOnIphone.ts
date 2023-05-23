import {Message} from "discord.js";
import {useEvent} from "../hooks";

useEvent("messageCreate", async (message: Message) => {
    const shotOnIphoneChannelId = "780706842383745034";
    if (message.channelId !== shotOnIphoneChannelId) {
        return;
    }
    if (message.author.bot) {
        return;
    }

    const {attachments} = message;
    const imagesAndVideos = attachments.filter((attachment) => {
        const {contentType} = attachment;
        if (!contentType) {
            return false;
        }
        return contentType.startsWith("image") || contentType.startsWith("video");
    });

    if (
        imagesAndVideos.size < 1 ||
        imagesAndVideos.size !== message.attachments.size
    ) {
        await message.delete();
        const reply = await message.channel.send(
            `${message.author}, please only post images and videos in this channel.`
        );
        setTimeout(() => {
            reply.delete().catch(() => {
            });
        }, 5000);
    }

    await message.react("👍");
    await message.react("❤️");
    await message.react("😲");
});
