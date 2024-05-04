import { ColorResolvable } from "discord.js";

interface NextEvent {
    name: string;
    timestamp: number;
    image: string;
    color: ColorResolvable;
}

//Timestamp is in ms
export const NEXT_EVENT: null | NextEvent = {
    name: "Let Loose",
    timestamp: 1715090400000,
    image: "https://cdn.discordapp.com/attachments/332310178277883916/1232926541399199754/Let-Loose.png",
    color: "#E9703D",
};

//THESE GUILD IDS ARE MIRRORED SlashCommandBuilder, CHANGE THEM THERE TOO
export const GUILDS = {
    MAIN: "332309672486895637",
    STAFF: "337792272693461002",
};

export const CHANNELS = {
    MAIN: {
        case_log: "1126077157895053312",
        log: "1120432710830280784",
        santa_applications: "1045659665771540511",
    },
    STAFF: {
        modmail_parent: "582568757575024640",
        modmail_logs: "582572653710409748",
    },
    APPEALS: {
        unban_announcements: "934958626257375244",
    },
};
export const ROLES = {
    MAIN: {
        established: "881503056091557978",
        event_reserved: "1166975824524738560",
        mod_squad: "334889410006876161",
        plus: "338950814108483586",
        santa_squad: "",
    },
};
