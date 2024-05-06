import { GdayChatCommandBuilder } from "../../structs/GdayChatCommandBuilder";
import { useChatCommand } from "../../hooks/";
import { EmbedBuilder } from "discord.js";
import { CommandScope } from "../../structs/GdayCommandBuilder";

const builder = new GdayChatCommandBuilder()
    .setName("avatar")
    .setDescription(
        "Chuck in a username and get back a snap of their profile pic.",
    )
    .addUserOption((option) =>
        option
            .setName("user")
            .setDescription(
                "Bloke or sheila whose mug you wanna snag a squiz at.",
            )
            .setRequired(false),
    )
    .setScope(CommandScope.MAIN_GUILD);

useChatCommand(builder, async (interaction) => {
    const user = interaction.options.getUser("user", false) ?? interaction.user;
    const embed = new EmbedBuilder()
        .setColor(0x333333)
        .setTitle(`Lookin' at the mug of ${user.username}`)
        .setImage(
            user.displayAvatarURL({
                extension: "png",
                size: 2048,
                forceStatic: false,
            }),
        );
    return { embeds: [embed] };
});
