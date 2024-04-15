import fs from "fs";
import path from "path";
import { updateSlashCommands } from "./hooks";

export const loadFilesFromFolder = (folder: string) => {
    const folderUrl = new URL(folder, import.meta.url);
    const files = fs.readdirSync(folderUrl);
    for (const file of files) {
        const filePath = path.join(folderUrl.href, file);
        if (!filePath.includes(".")) {
            loadFilesFromFolder(filePath);
        } else if (file.endsWith(".ts") || file.endsWith(".js")) {
            if (file.includes(".model.")) {
                continue;
            }
            import(filePath)
                .then(() => console.log(`Loaded ${file}`))
                .catch(() => console.error(`Error loading ${file}`));
        } else {
            console.warn(`${file} was present in ${folder} but ignored.`);
        }
    }
};
