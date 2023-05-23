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
    image: "https://i.imgur.com/iHZsp0Z.png",
    color: "#b5dcca",
};
