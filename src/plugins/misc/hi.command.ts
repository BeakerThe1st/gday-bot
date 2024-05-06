import { GdayChatCommandBuilder } from "../../structs/GdayChatCommandBuilder";
import { useChatCommand } from "../../hooks/";

const builder = new GdayChatCommandBuilder()
    .setName("hi")
    .setDescription("Quick way to say g'day, keep it simple.");

useChatCommand(builder as GdayChatCommandBuilder, (interaction) => "hi!");
