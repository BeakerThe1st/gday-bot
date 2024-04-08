import {SlashCommandBuilder, SlashCommandScope} from "../../../builders/SlashCommandBuilder";
import {useChatCommand} from "../../../hooks/useChatCommand";

const builder = new SlashCommandBuilder().setName("hi").setDescription("Quick way to say g'day, keep it simple.").setScope(SlashCommandScope.MAIN_GUILD);

useChatCommand(builder, (interaction) => ("hi!"));