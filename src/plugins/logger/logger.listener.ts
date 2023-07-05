import {useEvent} from "../../hooks";
import {
    Colors,
    Embed,
    EmbedBuilder,
    Events,
    GuildMember,
    Message,
    PartialGuildMember,
    PartialMessage,
} from "discord.js";
import {log, LOG_THREADS} from "./logs";

//Deleted Message
useEvent(Events.MessageDelete, (message: Message | PartialMessage) => {
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

//Role Logs
useEvent(Events.GuildMemberUpdate, (oldMember: GuildMember | PartialGuildMember, newMember: GuildMember | PartialGuildMember) => {
    const [newRoles, oldRoles] = [oldMember, newMember].map(({roles}) => roles.cache);
    //addedRoles is all roles we didn't previously have, removedRules is all roles we did previously have
    let addedRoles = newRoles.filter((role, roleId) => !oldRoles.has(roleId));
    let removedRoles = oldRoles.filter((role, roleId) => !newRoles.has(roleId));
    let roleOfInterest = addedRoles.size > 0 ? addedRoles.first() : removedRoles.first();
    if (!roleOfInterest) {
        //No added role nor removed role, therefore this is not a role update
        return;
    }
    const embed = new EmbedBuilder()
        .setDescription(`:key: ${newMember} (${newMember.user.username}) was removed from ${roleOfInterest}`)
        .setFooter({text: `Member ID: ${newMember}`})
        .setTimestamp(Date.now());
    log(LOG_THREADS.ROLE, embed);
});