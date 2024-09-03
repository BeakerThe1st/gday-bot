import { GdayChatCommandBuilder } from "../../structs/GdayChatCommandBuilder";
import { bold, Colors, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { useChatCommand } from "../../hooks";
import { BingoCheck } from "./BingoCheck.model";
import { useClient } from "../../hooks";
import { bingoTiles } from "./bingoTiles";
import { CommandScope } from "../../structs/GdayCommandBuilder";
import { Bingo } from "./Bingo.model";
import { CHANNELS, GUILDS } from "../../globals";

const builder = new GdayChatCommandBuilder()
    .setName("bingocheck")
    .setDescription("Checks/unchecks a bingo item")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setEphemeral(true)
    .setScope(CommandScope.MAIN_GUILD)
    .addStringOption((option) =>
        option
            .setName("bingo_id")
            .setDescription("Bingo item ID")
            .setRequired(true),
    );
useChatCommand(builder as GdayChatCommandBuilder, async (interaction) => {
    const id = interaction.options.getString("bingo_id", true);
    if (!Array.from(bingoTiles.keys()).includes(id)) {
        return "Not a bingo key!";
    }
    const check = (await BingoCheck.findOne()) ?? (await BingoCheck.create({}));
    let current = check.bingoEntries.get(id) ?? false;
    check.bingoEntries.set(id, !current);
    await check.save();
    const logChannel = await useClient().channels.fetch(
        CHANNELS.MAIN.bingo_check,
    );
    if (logChannel?.isTextBased() && !current) {
        logChannel.send({
            embeds: [
                new EmbedBuilder()
                    .setDescription(
                        `${bold(bingoTiles.get(id) ?? "A tile")} has been checked!\n\nView your personalised bingo board with </bingo:1280383234705723403>`,
                    )
                    .setColor(Colors.Green)
                    .setThumbnail(`https://rapple.xyz/bingo_images/${id}.png`),
            ],
        });
    }
    return `${current ? "Unchecked" : "Checked"} \`${id}\``;
});
