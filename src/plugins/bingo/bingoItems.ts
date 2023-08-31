export const bingoItems = new Map<string, boolean>();

const items = ["free_space"];


items.forEach((item) => {
    bingoItems.set(item, item === "free_space");
});
