import {SlashCommandBuilder, SlashCommandScope} from "../../builders/SlashCommandBuilder";
import {PermissionFlagsBits} from "discord.js";
import {useChatCommand} from "../../hooks/useChatCommand";
import {toggleChatEnabled} from "./chat";

const builder = new SlashCommandBuilder()
    .setName("togglechat")
    .setDescription("Toggles whether chat is enabled.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setScope(SlashCommandScope.MAIN_GUILD);

useChatCommand(builder, () => {
    const enabled = toggleChatEnabled();
    return `${enabled ? "Enabled" : "Disabled"} the chat module.`
})
