import {
    SlashCommandBuilder,
    SlashCommandScope,
} from "../../builders/SlashCommandBuilder";
import { useChatCommand } from "../../hooks/useChatCommand";
import {
    ActionRowBuilder,
    Events,
    Interaction,
    ModalBuilder,
    SelectMenuBuilder,
    SelectMenuOptionBuilder,
    TextInputBuilder,
    TextInputStyle,
} from "discord.js";
import { MailThread } from "./MailThread";
import { useClient, useEvent } from "../../hooks";

const builder = new SlashCommandBuilder()
    .setName("lreply")
    .setDescription("Construct a long reply to a modmail thread.")
    .setDeferrable(false)
    .setScope(SlashCommandScope.STAFF_SERVER);

useChatCommand(builder, async (interaction) => {
    const thread = await MailThread.findOne({ channel: interaction.channelId });
    if (!thread) {
        return "You can only reply within modmail threads.";
    }
    const recipient = await useClient().client.users.fetch(thread.author);
    const messageInput = new TextInputBuilder()
        .setCustomId("message")
        .setLabel("Message")
        .setPlaceholder("Message")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    const anonInput = new SelectMenuBuilder()
        .setCustomId("anon")
        .setOptions([
            new SelectMenuOptionBuilder()
                .setLabel("yes")
                .setDescription("hello"),
        ])
        .setMinValues(1)
        .setMaxValues(1);

    const modal = new ModalBuilder()
        .setCustomId(`lreply-${thread._id}-anon`)
        .setTitle(`Long reply to ${recipient.username}`)
        .addComponents([
            new ActionRowBuilder<TextInputBuilder>().addComponents(
                messageInput,
            ),
        ]);
    return modal;
    /*const input = interaction.options.getString("message", true);
      const user = await useClient().client.users.fetch(thread.author);
      const message = new ModmailMessage({
          from: interaction.user.username,
          to: user.username,
          body: input,
          anon: true
      });
      await user.send({embeds: [message]});
      message.addStaffFields();
      return {embeds: [message]};*/
});

useEvent(Events.InteractionCreate, async (interaction: Interaction) => {
    if (!interaction.isModalSubmit()) {
        return;
    }
    //lmao here's to hoping thread ids don't have -'s in them
    const [validator, threadId] = interaction.customId.split("-");
    if (validator !== "lreply") {
        return;
    }
    const thread = await MailThread.findOne({ _id: threadId });
});
