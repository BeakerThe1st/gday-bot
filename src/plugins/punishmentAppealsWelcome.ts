import {bold, channelMention, EmbedBuilder, GuildMember, inlineCode, PartialGuildMember,} from "discord.js";
import {useEvent} from "../hooks";

useEvent(
    "guildMemberUpdate",
    async (
        oldMember: GuildMember | PartialGuildMember,
        member: GuildMember | PartialGuildMember
    ) => {
        const punishmentAppealsChannel = "559144193814167574";
        const punishedRole = "468957856855621640";
        if (
            !member.roles.cache.has(punishedRole) ||
            oldMember.roles.cache.has(punishedRole)
        ) {
            return;
        }
        const channel = await member.client.channels.fetch(
            punishmentAppealsChannel
        );
        if (!channel?.isTextBased()) {
            return;
        }
        const embed = new EmbedBuilder()
            .setTitle("Welcome! 👋")
            .setDescription(
                `Hello ${member}, welcome to ${channelMention(
                    punishmentAppealsChannel
                )}.
        ${bold(
                    "Please do not ping staff or DM ModMail."
                )} You are in this channel because you were muted either by our moderation team or by a bot.
        
        While you're in this channel, be sure to check out our rules over in ${channelMention(
                    "476691390332403723"
                )}
        
        You may see how long is left on your mute by using the ${inlineCode(
                    "!timeleft"
                )}. If your mute is permanent, please wait patiently and a staff member will review it shortly.`
            )
            .setColor("Blue");
        channel.send({
            content: `${member}`,
            allowedMentions: {users: [member.id]},
            embeds: [embed],
        });
    }
);
