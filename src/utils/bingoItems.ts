export const bingoItems = new Map<string, boolean>()

const items = ["free_space", "ar", "ar_os", "macos_sequoia", "15_inch_mba", "m2_ultra", "mac_studio", "vr_facetime", "vr_iphone_apps", "memerighi",
"mac_pro", "ar_devkit", "one_more_thing", "carplay", "ios_lock_screen", "watch_widgets", "camera_app", "ios_compass", "good_mornang", "imac", "ipad_calculator",
"ipad_xcode", "iphone_os", "icloud_storage_increase"]

items.forEach((item) => {
    bingoItems.set(item, item === "free_space");
})
