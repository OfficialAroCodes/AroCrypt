import path from "path";
import fs from 'fs';

const logDir = path.join(process.cwd(), 'logs');
fs.mkdirSync(logDir, { recursive: true });

export function safeWriteLog(message: any) {
    const timestamp = new Date().toISOString();
    const logFilePath = path.join(logDir, 'app-log.txt');

    try {
        fs.appendFileSync(logFilePath, `${timestamp} - ${message}\n`);
        console.log(message);
    } catch (error) {
        console.error('Logging failed:', error);
    }
}