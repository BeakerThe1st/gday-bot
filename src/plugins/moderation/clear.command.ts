import {
    ChannelType,
    ChatInputCommandInteraction,
    PermissionFlagsBits,
    TextChannel,
    NewsChannel,
    ThreadChannel,
    userMention,
    channelMention,
    Collection,
    Message,
    Snowflake,
    User,
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

        if (user) {
            if (!interaction.options.getChannel("channel", false)) {
                const guildChannels = interaction.guild.channels.cache.filter(ch => ch.isTextBased()) as Collection<String, GuildTextBasedChannel>
                await guildChannels.forEach(async (channel)  => {
                    const userMessages = await fetchChannelMessagesForUser(channel as GuildTextBasedChannel, user, amount);
                    await channel.bulkDelete(userMessages, true);
                })
                await interaction.channel.send({
                    content: `Successfully deleted ${amount} messages from ${userMention(user.id)} in all channels.`,
                    allowedMentions: {
                        parse: [],
                    },
                });
                return null;
            } else {
                const userMessages = await fetchChannelMessagesForUser(channel as GuildTextBasedChannel, user, amount);
                await channel.bulkDelete(userMessages, true);
                await interaction.channel.send({
                    content: `Successfully deleted ${amount} messages from ${userMention(user.id)} in ${channelMention(channel.id)}.`,
                    allowedMentions: {
                        parse: [],
                    },
                });
                return null;
            }
        }
        let messages = await channel.messages.fetch({limit: amount});
        await channel.bulkDelete(messages, true);
        return `Successfully deleted ${amount} messages in ${channelMention(channel.id)}.`;
    });

    const fetchChannelMessagesForUser = async (channel: GuildTextBasedChannel, user: User, amount: number) : Promise<Collection<Snowflake, Message<true>>> => {
        let messages = await channel.messages.fetch({limit: amount});
        let lastFetchedID = messages.last()?.id;
        let userMessages = messages.filter(msg => msg.author.id === user.id);
        while (userMessages.size <= amount && lastFetchedID) {
            if (lastFetchedID) {
                messages = await channel.messages.fetch({ limit: 100, after: lastFetchedID});
                lastFetchedID = messages.last()?.id;
                messages = messages.filter(msg => msg.author.id === user.id);
                if (messages.size === 0) break; // collection is empty after filtering so no more messages from that user
                userMessages.concat(messages);
            }
        }
        return userMessages;
    }