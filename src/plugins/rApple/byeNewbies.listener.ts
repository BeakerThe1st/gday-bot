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
    const logChannel = await member.guild.channels.fetch("1169993577741434942");
    if (logChannel && "send" in logChannel) {
        await logChannel.send(
            `Kicked ${member} for being too new, created ${time(member.user.createdTimestamp / 1000)}`,
        );
    }
});
