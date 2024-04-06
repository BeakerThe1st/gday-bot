import {SlashCommandBuilder, SlashCommandScope} from "../../builders/SlashCommandBuilder";
import {useChatCommand} from "../../hooks/useChatCommand";
import {ChatInputCommandInteraction, inlineCode} from "discord.js";
import {MailThread} from "./MailThread";
import {useClient} from "../../hooks";
import {ModmailMessage} from "./ModmailMessage";
import {Tag} from "../tags/Tag.model";

const builder = new SlashCommandBuilder()
    .setName("treply")
    .setDescription("Replies with a tag in a modmail thread.")
    .addStringOption((option) =>
        option
            .setName("tag")
            .setDescription("Tag name.")
            .setRequired(true)
            .setAutocomplete(true)
    )
    .addBooleanOption((option) =>
        option
            .setName("anonymous")
            .setDescription("Whether to reply anonymously.")
    )
    .setScope(SlashCommandScope.STAFF_SERVER);

useChatCommand(builder, async (interaction: ChatInputCommandInteraction) => {
    const thread = await MailThread.findOne({channel: interaction.channelId});
    if (!(thread && interaction.guildId)) {
        return "You can only reply within modmail threads.";
    }
    const tagName = interaction.options.getString("tag", true);
    // 🍝 yum yum
    const tag = await Tag.findOneAndUpdate(
        {name: tagName, guild: interaction.guildId},
        {$inc: {usesCount: 1}},
        {new: true});
    if (!tag) {
        return `${inlineCode(tagName)} is not a valid tag.`;
    }
    const anon = interaction.options.getBoolean("anonymous");
    const user = await useClient().client.users.fetch(thread.author);
    const message = new ModmailMessage({
        from: interaction.user.username,
        to: user.username,
        body: tag.content,
        anon: anon ?? false,
    });
    await user.send({embeds: [message]});
    message.addStaffFields();
    return {embeds: [message]};
});
