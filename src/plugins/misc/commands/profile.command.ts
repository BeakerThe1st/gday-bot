import {SlashCommandBuilder, SlashCommandScope} from "../../../builders/SlashCommandBuilder";
import {useChatCommand} from "../../../hooks/useChatCommand";
import {
    ChatInputCommandInteraction,
    codeBlock,
    Colors,
    EmbedBuilder,
    Guild,
    GuildMember, inlineCode,
    time,
    TimestampStyles,
    User,
} from "discord.js";
import {listify} from "../../../utils";
import {Case} from "../../cases/Case.model";

const builder = new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Views a user's profile")
    .addUserOption(option => option
        .setName("user")
        .setDescription("The user to view the profile for")
        .setRequired(true)
    ).setScope(SlashCommandScope.MAIN_GUILD);

useChatCommand(builder, async (interaction: ChatInputCommandInteraction) => {
    const member = interaction.options.getMember("user");
    const user = interaction.options.getUser("user", true);
    const embed = new EmbedBuilder()
        .setAuthor({
            name: user.username,
            iconURL: user.displayAvatarURL()
        })
        .setDescription(`${user}`)
        .setThumbnail(user.displayAvatarURL())
        .setColor(Colors.Fuchsia);

    embed.addFields({
        name: "General",
        value: listify([
            `Created: ${time(user.createdAt, TimestampStyles.RelativeTime)}`,
            `ID: ${user.id}`,
            `Flags: ${user.flags?.toArray().map(name => inlineCode(name)).join(", ") || "None"}`,
        ])
    })

    if (member instanceof GuildMember) {
        embed.setColor(member.displayHexColor);
        embed.setThumbnail(member.displayAvatarURL());
        embed.addFields({
            name: "Server-Specific",
            value: listify([
                `Joined: ${time(member.joinedAt ?? new Date(), TimestampStyles.RelativeTime)}`,
                `Roles: ${member.roles.cache.map(role => role.toString()).join(", ")}`,
                `Flags: ${member.flags.toArray().map(name => inlineCode(name)).join(", ") || "None"}`
            ])
        })
    }

    embed.addFields({
        name: "Cases",
        value: listify([`Received: ${await Case.count({target: user.id})}`, `Issued: ${await Case.count({executor: user.id})}`])
    })
    return {embeds: [embed]};
});