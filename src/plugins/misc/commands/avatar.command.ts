import {SlashCommandBuilder, SlashCommandScope} from "../../../builders/SlashCommandBuilder";
import {useChatCommand} from "../../../hooks/useChatCommand";
import {ChatInputCommandInteraction, EmbedBuilder} from "discord.js";

const builder = new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Returns the profile picture for the specified user.")
    .addUserOption((option) =>
        option
            .setName("user")
            .setDescription("User whose profile picture you want to fetch.")
            .setRequired(false)
    )
    .setScope(SlashCommandScope.MAIN_GUILD);

useChatCommand(builder, async (interaction: ChatInputCommandInteraction) => {
    const user = interaction.options.getUser("user", false) ?? interaction.user;
    const embed = new EmbedBuilder()
        .setColor(0x333333)
        .setTitle(`Profile picture for ${user.username}`)
        .setImage(user.displayAvatarURL({ extension: 'png', size: 2048, forceStatic: false }));
    return {embeds: [embed]};
})
