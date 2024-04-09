import {
    ChannelType,
    ChatInputCommandInteraction,
    Collection,
    PermissionFlagsBits,
} from "discord.js";
import {
    SlashCommandBuilder,
    SlashCommandScope,
} from "../../builders/SlashCommandBuilder";
import { useChatCommand } from "../../hooks/useChatCommand";

const builder = new SlashCommandBuilder()
    .setName("clear")
    .setDescription(
        "Clears out messages in a channel, clean up like a true blue Aussie.",
    )
    .addIntegerOption((option) =>
        option
            .setName("amount")
            .setDescription("Amount of messages to fetch")
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(99),
    )
    .addUserOption((option) =>
        option
            .setName("user")
            .setDescription("User whose messages you want to clear")
            .setRequired(false),
    )
    .addChannelOption((option) =>
        option
            .setName("channel")
            .setDescription("Channel to clear messages from")
            .setRequired(false)
            .addChannelTypes(ChannelType.GuildText),
    )
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setScope(SlashCommandScope.GLOBAL);

useChatCommand(builder, async (interaction: ChatInputCommandInteraction) => {
    if (
        !interaction.guild ||
        !interaction.channel ||
        interaction.channel.type === ChannelType.DM
    )
        throw new Error("This command can only be run in a guild.");

    const user = interaction.options.getUser("user");
    const specifiedChannel = interaction.options.getChannel("channel", false, [
        ChannelType.GuildText,
    ]);
    const channel = specifiedChannel ?? interaction.channel;
    const amount = interaction.options.getInteger("amount", true);

    let messages = await channel.messages.fetch({ limit: 100 });
    if (user) {
        messages = messages.filter((message) => message.author.id === user.id);
    }

    const ignoreFirst = !(
        !!user ||
        (!!specifiedChannel && specifiedChannel.id !== interaction.channelId)
    );

    messages = new Collection([
        ...Array.from(messages.entries()).splice(~~ignoreFirst, amount),
    ]);

    await channel.bulkDelete(messages, true);
    return `Deleted ${messages.size} message${messages.size !== 1 ? "s" : ""}${user ? ` by ${user} (${user.username})` : ``}${specifiedChannel ? ` in ${channel}` : ``}`;
});
//     if (user) {
//         if (!channel) {
//             const guildChannels = await interaction.guild.channels.fetch();
//             for (const channel of guildChannels.values()) {
//                 if (!channel?.isTextBased()) {
//                     continue;
//                 }
//                 const userMessages = await fetchChannelMessagesForUser(channel, user, amount);
//                 await channel.bulkDelete(userMessages, true);
//             }
//             return {content: `Deleted ${amount} messages from ${userMention(user.id)} in all channels.`, allowedMentions: { parse: [] } };
//         } else {
//             const userMessages = await fetchChannelMessagesForUser(channel, user, amount);
//             await channel.bulkDelete(userMessages, true);
//             return {content: `Successfully deleted ${amount} messages from ${userMention(user.id)} in ${channelMention(channel.id)}.`, allowedMentions: {parse: [],},};
//         }
//     }
//     let messages = await channel.messages.fetch({limit: amount});
//     await channel.bulkDelete(messages, true);
//     return `Successfully deleted ${amount} messages in ${channelMention(channel.id)}.`;
// });
// const fetchChannelMessagesForUser = async (channel: Channel, user: User, amount: number) : Promise<Collection<Snowflake, Message<true>>> => {
//     if (!("messages" in channel)) {
//         throw new Error("Tried to fetch messages of a channel with no no messages!");
//     }
//     let messages = await channel.messages.fetch({limit: amount});
//     let lastFetchedID = messages.last()?.id;
//     let userMessages = messages.filter(msg => msg.author.id === user.id);
//     while (userMessages.size <= amount && lastFetchedID) {
//         if (lastFetchedID) {
//             messages = await channel.messages.fetch({ limit: 100, after: lastFetchedID});
//             lastFetchedID = messages.last()?.id;
//             messages = messages.filter(msg => msg.author.id === user.id);
//             if (messages.size === 0) break; // collection is empty after filtering so no more messages from that user
//             userMessages.concat(messages);
//         }
//     }
//     return userMessages;
// }
