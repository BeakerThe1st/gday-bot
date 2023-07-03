export const bingoItems = new Map<string, boolean>();

const items = ["15_inch_mba", "ar", "ar_devkit", "ar_os", "camera_app", "carplay",
    "good_mornang", "icloud_storage_increase", "imac", "ios_compass", "ios_lock_screen",
    "ipad_calculator", "ipad_xcode", "iphone_os", "mac_pro", "mac_studio", "macos_malibu", "macos_sequoia", "m2_ultra",
    "memerighi", "one_more_thing", "vr_facetime", "vr_iphone_apps", "watch_widgets", "free_space"];


items.forEach((item) => {
    bingoItems.set(item, item === "free_space");
});
