import { ColorResolvable } from "discord.js";

interface NextEvent {
    name: string;
    timestamp: number;
    image: string;
    color: ColorResolvable;
}

//Timestamp is in ms
export const NEXT_EVENT: null | NextEvent = null; /*{
    name: "WWDC24",
    timestamp: 1718038800000,
    image: "https://i.imgur.com/aatoAqL.png",
    color: "#0ca8ff",
};*/

//THESE GUILD IDS ARE MIRRORED GdayChatCommandBuilder, CHANGE THEM THERE TOO
export const GUILDS = {
    MAIN: "332309672486895637",
    STAFF: "337792272693461002",
};

export const CHANNELS = {
    MAIN: {
        case_log: "1126077157895053312",
        log: "1120432710830280784",
        santa_applications: "1045659665771540511",
        staff_notices: "476924704528138271",
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
        event_reserved: "",
        event_blocklisted: "1236653436557328435",
        mod_squad: "334889410006876161",
        plus: "338950814108483586",
        santa_squad: "",
    },
};
