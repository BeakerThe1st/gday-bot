import {ChannelType, ChatInputCommandInteraction, PermissionFlagsBits, TextChannel, NewsChannel, ThreadChannel, userMention, channelMention} from "discord.js";
import {SlashCommandBuilder, SlashCommandScope,} from "../../builders/SlashCommandBuilder";
import {useChatCommand} from "../../hooks/useChatCommand";

type GuildTextBasedChannel = TextChannel | NewsChannel | ThreadChannel

const builder = new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Bulk deletes messages from a given user/channel.")
    .addIntegerOption((option) => 
        option.setName("amount").setDescription("Amount of messages to delete (default 100)").setRequired(false)
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
        const user = interaction.options.getUser("user", false);
        const channel = interaction.options.getChannel("channel", false) as TextChannel;
        const amount = interaction.options.getInteger("amount", false) || 100;
        const startDate = searchStartDate();

        if (amount < 1 || amount > 1000) throw new Error("Amount can only be a number in the range from 1 to 1000.")
        if (!interaction.guild) throw new Error("This command can only be run in a guild.");
        
        // If user is not specified we delete all messages from the target channel. Fetching is necessary because of Discord API's 14 days limit.
        if (!user && channel) {
            let messages = await (channel as GuildTextBasedChannel).messages.fetch({ limit: amount, after: startDate});
            await channel.bulkDelete(messages);
            return `Successfully cleared ${amount} messages in ${channelMention(channel.id)}.`;
        }

        if (user && channel) {
            let messages = await (channel as GuildTextBasedChannel).messages.fetch({ limit: amount, after: startDate});
            messages = messages.filter(msg => msg.author.id === user.id);
            await (channel as GuildTextBasedChannel).bulkDelete(messages);
            return `Successfully cleared ${amount} messages sent by ${userMention(user.id)} in ${channelMention(channel.id)}.`;
        }

        // If channel is not specified we delete from all channels
        if (user && !channel) {
            const channels = interaction.guild?.channels.cache.filter(channel => channel.type === ChannelType.GuildText);
            channels?.forEach(async channel => {
                let messages = await (channel as GuildTextBasedChannel).messages.fetch({ limit: amount, after: startDate });
                messages = messages.filter(msg => msg.author.id === user.id) // We filter for author if user is specified
                await (channel as GuildTextBasedChannel).bulkDelete(messages);
            })
            return `Successfully cleared ${amount} messages sent by ${userMention(user.id)} in all channels.`;
        }
        return null;
    });
    
    const searchStartDate = () : string => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 14);
        // See https://discord.com/developers/docs/reference#snowflake-ids-in-pagination-generating-a-snowflake-id-from-a-timestamp-example for conversion from timestamp to Snowflake.
        const dateSnowflake = (BigInt(startDate.getTime()) - 1420070400000n) << 22n;
        return dateSnowflake.toString();
    }