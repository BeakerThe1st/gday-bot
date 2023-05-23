import {useChatCommand} from "../hooks/useChatCommand";
import {SlashCommandBuilder, SlashCommandScope,} from "../builders/SlashCommandBuilder";
import {
    ActionRowBuilder,
    ChatInputCommandInteraction,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} from "discord.js";

const builder = new SlashCommandBuilder()
    .setName("modmail")
    .setDescription("Contact staff via ModMail.")
    .setDeferrable(false)
    .setScope(SlashCommandScope.MAIN_GUILD);

useChatCommand(builder, async (interaction: ChatInputCommandInteraction) => {
    const modal = new ModalBuilder()
        .setCustomId("modmail")
        .setTitle("r/Apple ModMail");

    const issueInput = new TextInputBuilder()
        .setCustomId("issue")
        .setLabel("Describe your issue to staff as best you can. **THIS IS A TEST AND YOUR MESSAGE WILL NOT GO ANYWHERE**")
        .setStyle(TextInputStyle.Paragraph);

    const rowOne =
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
            issueInput
        );

    modal.addComponents(rowOne);

    await interaction.showModal(modal);
    return null;
});
