import {SlashCommandBuilder, SlashCommandScope} from "../../builders/SlashCommandBuilder";
import {useChatCommand} from "../../hooks/useChatCommand";
import {ChatInputCommandInteraction, GuildMember, userMention} from "discord.js";

const builder = new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Unmutes a user")
    .addUserOption((option) =>
        option.setName("user").setDescription("User to unmute.").setRequired(true)
    )
    .setScope(SlashCommandScope.MAIN_GUILD)

useChatCommand(builder, async (interaction: ChatInputCommandInteraction) => {
    const member = interaction.options.getMember("user");
    if (!(member instanceof GuildMember) ) {
        return `${member} is not a GuildMember.`;
    }
    if (!member.isCommunicationDisabled()) {
        return `${userMention(member.id)} is not muted.`;
    }
    await member.disableCommunicationUntil(null, `Unmute command by ${interaction.user.username}`);
    return `${userMention(member.id)} has been unmuted.`;
})