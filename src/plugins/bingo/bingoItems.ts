export const bingoItems = new Map<string, boolean>();

const items =
    ["free_space", "titanium", "sapphire_crystal", "thicker_phone", "usbc", "thinner_bezel",
        "mute_switch", "brighter_display", "navy_blue", "3nm_a17", "periscope_lens", "2tb_max",
        "256gb_base", "wifi_6e", "u2_chip", "esim_expanded", "price_increase"
    ];


items.forEach((item) => {
    bingoItems.set(item, item === "free_space");
});
