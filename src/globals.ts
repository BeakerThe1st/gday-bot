interface NextEvent {
    name: string;
    timestamp: number;
    image: string;
    color: string;
}

//Timestamp is in ms
export const NEXT_EVENT: null | NextEvent = {
    name: "Wonderlust",
    timestamp: 1694538000000,
    image: "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExcGV4dXgwOTI3OWxvbDUxc3R0cTB1ZTJ3ZzdqamVycjdqbWtkbGQwNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/rFojqMvKmk3ZCliupx/giphy.gif",
    color: "#7cb1d6",
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
};
export const ROLES = {
    MAIN: {
        established: "881503056091557978",
        event_reserved: "1111076493834072165",
        mod_squad: "334889410006876161",
        plus: "338950814108483586",
    },
};
