import {SlashCommandBuilder} from "../../../builders/SlashCommandBuilder";
import {useChatCommand} from "../../../hooks/useChatCommand";

const builder = new SlashCommandBuilder().setName("hi").setDescription("Quick way to say g'day, keep it simple.");

useChatCommand(builder, () => ("hi"));