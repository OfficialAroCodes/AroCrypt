import path from "path";
import fs from 'fs';

const logDir = path.join(process.cwd(), 'logs');
fs.mkdirSync(logDir, { recursive: true });

export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
const isProduction =
    process.env.NODE_ENV === "production" || !VITE_DEV_SERVER_URL;

export function safeWriteLog(message: any) {
    if (isProduction) return;

    const timestamp = new Date().toISOString();
    const logFilePath = path.join(logDir, 'app-log.txt');

    try {
        fs.appendFileSync(logFilePath, `${timestamp} - ${message}\n`);
        console.log(message);
    } catch (error) {
        console.error('Logging failed:', error);
    }
}