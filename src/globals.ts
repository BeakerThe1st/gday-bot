interface NextEvent {
    name: string;
    timestamp: number;
    image: string;
    color: string;
}


//Timestamp is in ms
export const NEXT_EVENT: null | NextEvent = null; /*{
    name: "WWDC23",
    timestamp: 1685984400000,
    image: "https://media3.giphy.com/media/apZ1rCWXf427CwPjAU/giphy.gif",
    color: "#b5dcca",
};*/


//THESE GUILD IDS ARE MIRRORED SlashCommandBuilder, CHANGE THEM THERE TOO
export const GUILDS = {
    MAIN: "332309672486895637",
    STAFF: "337792272693461002"
}

export const CHANNELS = {
    MAIN: {
        case_log: "1033960979224088596",
        log: "1120432710830280784",
    }
}
export const ROLES = {
    MAIN: {
        established: "881503056091557978",
        event_reserved: "1111076493834072165",
        mod_squad: "334889410006876161",
        plus: "338950814108483586"
    }
}
