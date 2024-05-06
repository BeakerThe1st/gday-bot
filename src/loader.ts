import fs from "fs";
import path from "path";
import { registerCommands } from "./hooks";

export const loadFilesFromFolder = (folder: string) => {
    const files: string[] = [];
    const findFilesInFolder = (folder: string) => {
        const folderUrl = new URL(folder, import.meta.url);
        const filesInDir = fs.readdirSync(folderUrl);
        for (const file of filesInDir) {
            const filePath = path.join(folderUrl.href, file);
            if (!filePath.includes(".")) {
                //Is a directory
                findFilesInFolder(filePath);
            } else if (file.endsWith(".ts") || file.endsWith(".js")) {
                if (file.includes(".model.")) {
                    continue;
                }
                files.push(filePath);
            } else {
                console.warn(`${filePath} was ignored.`);
            }
        }
    };

    findFilesInFolder(folder);

    Promise.all(
        files.map((file) =>
            import(file).catch(() => console.error(`${file} failed to load.`)),
        ),
    ).then((resolved) => {
        console.log(`${resolved.length} files loaded`);
        registerCommands();
    });
};
