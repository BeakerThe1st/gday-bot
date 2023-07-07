import {useEvent} from "../../hooks";
import {Events} from "discord.js";
import {Tag} from "./Tag.model";
import Fuse from "fuse.js";

useEvent(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isAutocomplete()) return;
    if (!["tag", "tags"].includes(interaction.commandName)) return;

    //Weakened tags array with just name and content
    const tags = (await Tag.find({guild: interaction.guildId}))
        .map((document) => ({name: document.name, content: document.content}));
    //fuuuuuseeeeeee
    const fuse = new Fuse(tags, {includeScore: true, keys: ['name', 'content']});

    const result = fuse.search(interaction.options.getFocused());

    //Turn it into discord friendly options
    const options = result
        .map(({item}) => ({
            name: item.name,
            value: item.name
        }));
    await interaction.respond(options);
})