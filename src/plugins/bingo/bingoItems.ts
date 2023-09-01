export const bingoItems = new Map<string, boolean>();

const items =
    ["free_space", "titanium", "sapphire_crystal", "thicker_phone", "usbc", "thinner_bezel",
        "mute_switch", "brighter_display", "navy_blue", "3nm_a17", "periscope_lens", "2tb_max",
        "256gb_base", "wifi_6e", "u2_chip", "esim_expanded", "price_increase", "braided_cables",
        "usb4", "qi2", "health_sensor", "watch_pink", "watch_battery", "s9_chip", "ultra_refresh",
        "new_mac", "apm_2", "ap_price_down", "ap_announced", "icloud_increase", "under_90min",
        "vision", "good_mornang", "hf1", "appletv_content", "saving_life", "tim_white_shoes",
        "eu_only"
    ];


items.forEach((item) => {
    bingoItems.set(item, item === "free_space");
});
