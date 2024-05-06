import { GdayChatCommandBuilder } from "../../structs/GdayChatCommandBuilder";
import { GuildMember, PermissionFlagsBits } from "discord.js";
import { useChatCommand } from "../../hooks/";
import { ROLES } from "../../globals";
import { CommandScope } from "../../structs/GdayCommandBuilder";

const builder: GdayChatCommandBuilder = new GdayChatCommandBuilder()
    .setName("establish")
    .setDescription("Hooks a user up with the image role, good on ya mate!")
    .addUserOption((option) =>
        option
            .setName("user")
            .setDescription("User to establish")
            .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setScope(CommandScope.MAIN_GUILD);

useChatCommand(builder, async (interaction) => {
    const member = interaction.options.getMember("user");
    if (!(member instanceof GuildMember)) {
        throw new Error("User is not a member of the guild");
    }
    const established = ROLES.MAIN.established;
    if (member.roles.cache.has(established)) {
        return `${member} is already established!`;
    }
    await member.roles.add(established);
    return `Established ${member}.`;
});
