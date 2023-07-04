import {
    ChannelType,
    ChatInputCommandInteraction,
    PermissionFlagsBits,
    TextChannel,
    NewsChannel,
    ThreadChannel,
    userMention,
    channelMention,
    Collection, Message, Snowflake, Channel
} from "discord.js";
import {SlashCommandBuilder, SlashCommandScope,} from "../../builders/SlashCommandBuilder";
import {useChatCommand} from "../../hooks/useChatCommand";

type GuildTextBasedChannel = TextChannel | NewsChannel | ThreadChannel

const builder = new SlashCommandBuilder()
    .setName("clean")
    .setDescription("Bulk deletes messages from a given user/channel.")
    .addIntegerOption((option) => 
        option.setName("amount")
        .setDescription("Amount of messages to delete (default 10)")
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(99)
    )
    .addUserOption((option) =>
        option.setName("user").setDescription("User whose messages you want to purge.").setRequired(false)
    )
    .addChannelOption((option) => 
        option.setName("channel").setDescription("Channel").setRequired(false).addChannelTypes(ChannelType.GuildText)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setScope(SlashCommandScope.GLOBAL);

    useChatCommand(builder, async (interaction: ChatInputCommandInteraction) => {
        if (!interaction.guild || !interaction.channel || interaction.channel?.type === ChannelType.DM) throw new Error("This command can only be run in a guild.");

        const user = interaction.options.getUser("user", false);
        const channel = interaction.options.getChannel("channel", false, [ChannelType.GuildText]) ?? interaction.channel;
        const amount = interaction.options.getInteger("amount", false) ?? 10;
        const startDate = searchStartDate();

        let messages = await channel.messages.fetch({ limit: 100, after: startDate});
        let lastFetchedID = messages.last()?.id;

        if (user) {
            let userMessages = messages.filter(msg => msg.author.id === user.id);
            // Edge case: the amount of messages sent from the user in the first batch is higher than the amount we want to purge.
            if (userMessages.size > amount) userMessages = getFirstMessagesFromCollection(userMessages, amount)
            while (userMessages.size < amount && lastFetchedID) {
                if (lastFetchedID) {
                    messages = await channel.messages.fetch({ limit: 100, after: lastFetchedID});
                    messages = messages.filter(msg => msg.author.id === user.id);
                    if (messages.size === 0) break; // collection is empty after filtering so no more messages from that user
                    userMessages.concat(messages);
                    lastFetchedID = messages.last()?.id;
                }
            }
            await channel.bulkDelete(userMessages);
            return `Successfully cleared ${userMessages.size} messages from ${userMention(user.id)}`;
        }

        // For some reason bulkDelete deletes the output of the return statement too, so we have to delete one more message than amount.
        messages = getFirstMessagesFromCollection(messages, amount+1);
        await channel.bulkDelete(messages);
        return `Successfully cleared ${amount} messages in ${channelMention(channel.id)}.`;
    });
    
    const searchStartDate = () : string => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 14);
        // See https://discord.com/developers/docs/reference#snowflake-ids-in-pagination-generating-a-snowflake-id-from-a-timestamp-example for conversion from timestamp to Snowflake.
        const dateSnowflake = (BigInt(startDate.getTime()) - 1420070400000n) << 22n;
        return dateSnowflake.toString();
    }

    const getFirstMessagesFromCollection = (collection: Collection<Snowflake, Message<true>>, amount: number) : Collection<Snowflake, Message<true>> => {
        const keys = collection.firstKey(amount);
        const values = collection.first(amount);
        const messages = new Collection<Snowflake, Message<true>>();
        for (let i = 0; i < keys.length; i++) {
            messages.set(keys[i], values[i]);
          }
        return messages;
    }