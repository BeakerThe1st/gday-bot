import {SlashCommandBuilder} from "../builders/SlashCommandBuilder";
import {useChatCommand} from "../hooks/useChatCommand";

const builder = new SlashCommandBuilder().setName("hi").setDescription("hi");

useChatCommand(builder, () => {
    return "hi";
});
