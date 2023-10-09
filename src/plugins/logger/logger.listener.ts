import {useEvent} from "../../hooks";
import {
    Collection,
    Colors,
    EmbedBuilder,
    Events,
    GuildMember,
    GuildTextBasedChannel,
    inlineCode,
    Message,
    PartialGuildMember,
    PartialMessage,
    time,
    TimestampStyles,
} from "discord.js";
import {log, LOG_THREADS} from "./logs";
import {GUILDS} from "../../globals";

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
        embed.addFields({ name: "Content", value: cleanContent});
    }
    if (attachments && attachments.size > 0) {
        embed.addFields({name: "Attachments", value: `- ${attachments.map((attachment) => attachment.url).join("\n- ")}`});
    }
    if (embeds && embeds.length > 0) {
        embed.addFields({name: "Embeds", value: `${embeds.map((embed) => `- ${embed.title ?? "No Title"}: ${embed.description ?? "No Description"}`).join("\n- ")}`})
    }
    log(LOG_THREADS.DELETION, embed);
});

//Bulk delete Logs
useEvent(Events.MessageBulkDelete, (messages: Collection<string, Message | PartialMessage>, channel: GuildTextBasedChannel) => {
    if (channel.guildId !== GUILDS.MAIN) return;
    const embed = new EmbedBuilder()
        .setDescription(`:wastebasket: ${messages.size} messages deleted in ${channel}`)
        .setColor(Colors.DarkRed)
        .setTimestamp(Date.now());
    let fileContent = "";
    for (const [, message] of messages) {
        const { author } = message;
        if (fileContent !== "") {
            fileContent += "\n";
        }
        fileContent += `[${message.createdTimestamp}] ${author?.username ?? "No Username"} (${author?.id ?? "No ID"}): ${message.cleanContent?.replaceAll("\n", "\n\t\t\t")}`;
    }
    log(LOG_THREADS.DELETION, {embeds: [embed], files: [{attachment: Buffer.from(fileContent), name:`${channel.guild.name.replace(/[\\W_]+/g, '')}-bulk-delete-${Date.now()}.txt`}]});
})

//Role Logs
useEvent(Events.GuildMemberUpdate, (oldMember: GuildMember | PartialGuildMember, newMember: GuildMember | PartialGuildMember) => {
    if (newMember.guild.id !== GUILDS.MAIN) return;
    const [newRoles, oldRoles] = [newMember, oldMember].map(({roles}) => roles.cache);
    //addedRoles is all roles we didn't previously have, removedRules is all roles we did previously have
    const addedRoles = newRoles.filter((role, roleId) => !oldRoles.has(roleId));
    const removedRoles = oldRoles.filter((role, roleId) => !newRoles.has(roleId));
    const roleWasAdded = addedRoles.size > 0;
    const roleOfInterest = roleWasAdded ? addedRoles.first() : removedRoles.first();
    if (!roleOfInterest) {
        //No added role nor removed role, therefore this is not a role update
        return;
    }
    const embed = new EmbedBuilder()
        .setDescription(`:key: ${newMember} (${newMember.user.username}) was ${roleWasAdded ? "added to" : "removed from"} ${roleOfInterest}`)
        .setFooter({text: `Member ID: ${newMember.id}`})
        .setColor(roleWasAdded ? Colors.Green : Colors.DarkRed)
        .setTimestamp(Date.now());
    log(LOG_THREADS.ROLE, embed);
});

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
    const { user } = member;
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
    const { user } = member;
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
    const {author } = newMessage;
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