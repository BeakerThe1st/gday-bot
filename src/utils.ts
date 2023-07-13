export const listify = (items: string[]) => {
    return `- ${items.join(`\n- `)}`;
}