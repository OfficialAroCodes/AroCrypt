import path from "path";
import fs from 'fs';
import { safeWriteLog } from "./writeLog";

export function sanitizeFilePath(inputPath: string, allowFileCreation: boolean = false): string {
    try {
        const normalizedPath = path.normalize(inputPath);

        const absolutePath = path.resolve(normalizedPath);

        if (!allowFileCreation && !fs.existsSync(absolutePath)) {
            throw new Error(`File does not exist: ${absolutePath}`);
        }

        if (allowFileCreation) {
            const directory = path.dirname(absolutePath);
            fs.mkdirSync(directory, { recursive: true });
        }

        return absolutePath.replace(/(["\s'$`\\])/g, '\\$1');
    } catch (error) {
        safeWriteLog(`Path sanitization error: ${error}`);
        throw new Error(`Invalid file path: ${inputPath}`);
    }
}