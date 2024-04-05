import {SlashCommandBuilder, SlashCommandScope} from "../../builders/SlashCommandBuilder";
import {useChatCommand} from "../../hooks/useChatCommand";
import {ModmailUser} from "./ModmailUser";

const builder = new SlashCommandBuilder()
    .setName("blocklist")
    .setDescription("Manages the modmail blocklist")
    .setScope(SlashCommandScope.STAFF_SERVER)
    .addSubcommand((subcommand) =>
        subcommand
            .setName("add")
            .setDescription("Adds a user to the modmail blocklist")
            .addUserOption((option) =>
                option.setName("user").setDescription("User to add to the blocklist").setRequired(true)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("remove")
            .setDescription("Removes a user from the modmail blocklist")
            .addUserOption((option) =>
                option.setName("user").setDescription("User to remove from the blocklist").setRequired(true)
            )
    )

useChatCommand(builder as SlashCommandBuilder, async (interaction) => {
    const action = interaction.options.getSubcommand();
    const target = interaction.options.getUser("user", true);
    let modmailUser = await ModmailUser.findOne({userId: target.id})
    if (!modmailUser) {
        modmailUser = new ModmailUser({
            userId: target.id,
            blocklisted: false,
            threadCount: 0
        })
    }
    let message;
    if (action == "add") {
        if (modmailUser.blocklisted == true) {
            return `${target} is already blocklisted.`
        }
        modmailUser.blocklisted = true;
        message = `Added ${target} to the blocklist.`
    } else {
        if (modmailUser.blocklisted == false) {
            return `${target} is not blocklisted.`
        }
        modmailUser.blocklisted = false;
        message = `Removed ${target} from the blocklist.`
    }
    await modmailUser.save();
    return message;
})