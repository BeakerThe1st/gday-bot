export const MAIN_GUILD_ID = "332309672486895637";

interface NextEvent {
    name: string;
    timestamp: number;
    image: string;
    color: string;
}


//Timestamp is in ms
export const NEXT_EVENT: null | NextEvent = {
    name: "WWDC23",
    timestamp: 1685984400000,
    image: "https://media3.giphy.com/media/apZ1rCWXf427CwPjAU/giphy.gif",
    color: "#b5dcca",
};

export const ROLES = {
    established: "881503056091557978",
    event_reserved: "1111076493834072165",
    modsquad: "334889410006876161",
    plus: "338950814108483586"
}
