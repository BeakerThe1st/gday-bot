import { GdayChatCommandBuilder } from "../../structs/GdayChatCommandBuilder";
import { useChatCommand } from "../../hooks/";
import { RAppleUser } from "../rApple/RAppleUser.model";
import { CommandScope } from "../../structs/GdayCommandBuilder";

const builder = new GdayChatCommandBuilder()
    .setName("blocklist")
    .setDescription("Manages the modmail blocklist")
    .setScope(CommandScope.STAFF_SERVER)
    .addSubcommand((subcommand) =>
        subcommand
            .setName("add")
            .setDescription("Adds a user to the modmail blocklist")
            .addUserOption((option) =>
                option
                    .setName("user")
                    .setDescription("User to add to the blocklist")
                    .setRequired(true),
            ),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("remove")
            .setDescription("Removes a user from the modmail blocklist")
            .addUserOption((option) =>
                option
                    .setName("user")
                    .setDescription("User to remove from the blocklist")
                    .setRequired(true),
            ),
    );

useChatCommand(builder as GdayChatCommandBuilder, async (interaction) => {
    const action = interaction.options.getSubcommand();
    const target = interaction.options.getUser("user", true);
    let rAppleUser = await RAppleUser.findOne({ userId: target.id });
    if (!rAppleUser) {
        rAppleUser = new RAppleUser({
            userId: target.id,
        });
    }
    let message;
    if (action == "add") {
        if (rAppleUser.modmailBlocklisted == true) {
            return `${target} is already blocklisted.`;
        }
        rAppleUser.modmailBlocklisted = true;
        message = `Added ${target} to the blocklist.`;
    } else {
        if (rAppleUser.modmailBlocklisted == false) {
            return `${target} is not blocklisted.`;
        }
        rAppleUser.modmailBlocklisted = false;
        message = `Removed ${target} from the blocklist.`;
    }
    await rAppleUser.save();
    return message;
});
