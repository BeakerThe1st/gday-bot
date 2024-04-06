import {useEvent} from "../../hooks";
import {
    AuditLogEvent, codeBlock,
    Collection,
    Colors,
    EmbedBuilder,
    Events,
    Guild,
    GuildAuditLogsEntry,
    GuildMember,
    GuildTextBasedChannel,
    inlineCode,
    Message,
    PartialGuildMember,
    PartialMessage,
    time,
    TimestampStyles, User,
} from "discord.js";
import {log, LOG_THREADS} from "./logs";
import {GUILDS} from "../../globals";
import {createBulkMessageLogFile} from "../../utils";

//Deleted Message
useEvent(Events.MessageDelete, (message: Message | PartialMessage) => {
    if (message.guildId !== GUILDS.MAIN) return;
    if (message.channelId === LOG_THREADS.DELETION) return;
    const embed = new EmbedBuilder()
        .setDescription(`:wastebasket: Message by ${message.author} (${message.author?.username ?? "No Username"}) deleted in ${message.channel}`)
        .setColor(Colors.DarkRed)
        .setFooter({text: `Message ID: ${message.id}`})
        .setTimestamp(Date.now());
    const {cleanContent, attachments, embeds} = message;
    if (cleanContent) {
        embed.addFields({name: "Content", value: cleanContent});
    }
    if (attachments && attachments.size > 0) {
        embed.addFields({
            name: "Attachments",
            value: `- ${attachments.map((attachment) => attachment.url).join("\n- ")}`
        });
    }
    if (embeds && embeds.length > 0) {
        embed.addFields({
            name: "Embeds",
            value: `${embeds.map((embed) => `- ${embed.title ?? "No Title"}: ${embed.description ?? "No Description"}`).join("\n- ")}`
        })
    }
    log(LOG_THREADS.DELETION, embed);
});

//Bulk delete Logs
useEvent(Events.MessageBulkDelete, (messages: Collection<string, Message | PartialMessage>, channel: GuildTextBasedChannel) => {
    if (channel.guildId !== GUILDS.MAIN) return;
    messages = messages.reverse();
    const authors = new Set<string>();
    for (const [, message] of messages) {
        if (message.author?.id) authors.add(message.author.id);
    }
    const embed = new EmbedBuilder()
        .setDescription(`:wastebasket: ${messages.size} messages deleted in ${channel}\n\nAuthors: [${Array.from(authors).map((id) => inlineCode(id)).join(', ')}]`)
        .setColor(Colors.DarkRed)
        .setTimestamp(Date.now());
    log(LOG_THREADS.DELETION, {
        embeds: [embed],
        files: [{
            attachment: createBulkMessageLogFile(messages),
            name: `${channel.guild.name.replace(/[\\W_]+/g, '')}-bulk-delete-${Date.now()}.txt`
        }]
    });
})

//Role Logs
useEvent(Events.GuildAuditLogEntryCreate, (entry: GuildAuditLogsEntry, guild: Guild) => {
    if (guild.id !== GUILDS.MAIN) return;
    if (entry.action !== AuditLogEvent.MemberRoleUpdate) return;
    console.dir(entry);
    const change = entry.changes[0];
    let description = `:key: ${entry.target}`;
    if (entry.target instanceof User) {
        description += ` (${entry.target.username})`
    }
    description += `'s roles updated by ${entry.executor}`;
    if (entry.executor instanceof User) {
        description += ` (${entry.executor.username})`;
    }

    const embed = new EmbedBuilder()
        .setDescription(`${description}\n${codeBlock("json", JSON.stringify(change, null, 2))}`)
        .setColor(Colors.Aqua);
    log(LOG_THREADS.ROLE, embed);
})

//Nickname Logs
useEvent(Events.GuildMemberUpdate, (oldMember: GuildMember | PartialGuildMember, newMember: GuildMember | PartialGuildMember) => {
    if (newMember.guild.id !== GUILDS.MAIN) return;
    const [oldNick, newNick] = [oldMember, newMember].map((member) => member.displayName);
    if (oldNick === newNick) return;
    const embed = new EmbedBuilder()
        .setDescription(`:name_badge: ${newMember} (${newMember.user.username})'s nickname changed from ${inlineCode(oldNick)} to ${inlineCode(newNick)}`)
        .setTimestamp(Date.now())
        .setColor(Colors.Orange);
    log(LOG_THREADS.NICKNAME, embed);
});

//Join Logs
useEvent(Events.GuildMemberAdd, (member: GuildMember) => {
    if (member.guild.id !== GUILDS.MAIN) return;
    const {user} = member;
    const embed = new EmbedBuilder()
        .setDescription(`:inbox_tray: ${member} (${member.user.username}) joined the server\nAccount created: ${time(user.createdAt, TimestampStyles.RelativeTime)}`)
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp(Date.now())
        .setColor(Colors.Green);
    log(LOG_THREADS.JOIN_LEAVE, embed);
})

//Leave Logs
useEvent(Events.GuildMemberRemove, (member: GuildMember | PartialGuildMember) => {
    if (member.guild.id !== GUILDS.MAIN) return;
    const {user} = member;
    const embed = new EmbedBuilder()
        .setDescription(`:outbox_tray: ${member} (${member.user.username}) left the server`)
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp(Date.now())
        .setColor(Colors.DarkRed)
    log(LOG_THREADS.JOIN_LEAVE, embed);
});

//Message Edit Logs

useEvent(Events.MessageUpdate, (oldMessage: Message | PartialMessage, newMessage: Message | PartialMessage) => {
    if (oldMessage.guildId !== GUILDS.MAIN) return;
    const {author} = newMessage;
    if (!author || author.bot) return;
    const embed = new EmbedBuilder()
        .setDescription(`:pencil: ${author} (${author?.username ?? "No Username"}) updated their message in ${newMessage.channel}`)
        .addFields([
            {
                name: "Old Content",
                value: `${oldMessage.cleanContent}`
            },
            {
                name: "New Content",
                value: `${newMessage.cleanContent}`
            }
        ])
        .setTimestamp(Date.now())
        .setColor(Colors.Orange)
    log(LOG_THREADS.EDIT, embed);
});