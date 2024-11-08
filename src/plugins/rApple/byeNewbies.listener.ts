import { GUILDS, ROLES } from "../../globals";
import { GuildMember, time, Typing } from "discord.js";
import { useEvent } from "../../hooks";

useEvent("guildMemberAdd", async (member: GuildMember) => {
    if (member.guild.id !== GUILDS.MAIN) {
        return;
    }
    //Created before today - 36hrs
    if (member.user.createdTimestamp < Date.now() - 3 * 24 * 60 * 60 * 1000) {
        return;
    }

    await member.kick();
    const logChannel = await member.guild.channels.fetch("1302197173139673098");
    if (logChannel && "send" in logChannel) {
        await logChannel.send(
            `Kicked ${member} [${member.id}] for being too new, created ${time(Math.floor(member.user.createdTimestamp / 1000))}`,
        );
    }
});
