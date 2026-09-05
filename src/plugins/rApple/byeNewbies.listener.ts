import { GUILDS } from "../../globals";
import { GuildMember, time } from "discord.js";
import { useEvent } from "../../hooks";

const MIN_ACCOUNT_AGE_HOURS = 0;

// convenience consts
const MIN_ACCOUNT_AGE = MIN_ACCOUNT_AGE_HOURS * 60 * 60 * 1000;
const MIN_ACCOUNT_AGE_TEXT = `${MIN_ACCOUNT_AGE_HOURS} hour${MIN_ACCOUNT_AGE_HOURS === 1 ? "" : "s"}`;

useEvent("guildMemberAdd", async (member: GuildMember) => {
    // easy switch without having to delete the file, since there's 
    // no mechanism for disabling a plugin.
    if (MIN_ACCOUNT_AGE === 0) {
        return;
    }
    
    if (member.guild.id !== GUILDS.MAIN) {
        return;
    }
    if (member.user.bot) {
        return;
    }
    if (member.user.createdTimestamp < Date.now() - MIN_ACCOUNT_AGE) {
        return;
    }

    // Don't DM someone we can't actually remove
    if (!member.kickable) {
        return;
    }

    // Must be sent before the kick. Afterwards we share no guild.
    let userNotified = false;
    try {
        await member.send(
            `You've been removed from ${member.guild.name} because your Discord account is less than ${MIN_ACCOUNT_AGE_TEXT} old. You're welcome to join again once it's a bit older.`,
        );
        userNotified = true;
    } catch {
        userNotified = false;
    }

    await member.kick("Account too new");

    const logChannel = await member.guild.channels.fetch("1302197173139673098");
    if (logChannel && "send" in logChannel) {
        await logChannel.send(
            `Kicked ${member} [${member.id}] for being too new, created ${time(Math.floor(member.user.createdTimestamp / 1000))}${userNotified ? "" : " (DM failed)"}`,
        );
    }
});
