interface NextEvent {
    name: string;
    timestamp: number;
    image: string;
    color: string;
}

//Timestamp is in ms
export const NEXT_EVENT: null | NextEvent = {
    name: "Scary Fast",
    timestamp: 1698710400000,
    image: "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExNWVibTN5Y2ZiMGxuMzk4bmwzb2lyZmJjODNsN3dpMWhjcXA2b2FseiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/DbEimmh5VeAM4Fu0Xc/giphy.gif",
    color: "#8D8C9A",
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
    },
    STAFF: {
        modmail_parent: "582568757575024640"
    }
};
export const ROLES = {
    MAIN: {
        established: "881503056091557978",
        event_reserved: "1166975824524738560",
        mod_squad: "334889410006876161",
        plus: "338950814108483586",
    },
};
