import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { generateKey, getIVLength } from '../utils/crypto';
import { sanitizeFilePath } from './sanitizeFilePath';
import getKey from './KeyService';
import { safeWriteLog } from './writeLog';

let UNIQUE_KEY: string | null = null;

async function initializeUniqueKey() {
    UNIQUE_KEY = await getKey();
}

export async function encryptFile(inputPath: string, method: string, outputPath?: string): Promise<string> {
    try {
        await initializeUniqueKey();

        if (!UNIQUE_KEY) {
            throw new Error('No unique key found for encryption');
        }
        console.log(method)

        const fullInputPath = sanitizeFilePath(inputPath, false);

        if (!fs.existsSync(fullInputPath)) {
            throw new Error(`Input file does not exist: ${fullInputPath}`);
        }

        const key = generateKey({ originalKey: UNIQUE_KEY, method });

        const fullOutputPath = outputPath
            ? sanitizeFilePath(outputPath, true)  
            : `${fullInputPath}.arocrypt`;

        const outputDir = path.dirname(fullOutputPath);
        fs.mkdirSync(outputDir, { recursive: true });

        const ivLength = getIVLength(method);
        const ivBuffer = crypto.randomBytes(ivLength);

        const inputStream = fs.createReadStream(fullInputPath, {
            encoding: undefined, 
            highWaterMark: 64 * 1024 
        });
        const outputStream = fs.createWriteStream(fullOutputPath, {
            encoding: undefined 
        });

        outputStream.write(ivBuffer);

        let cipher: crypto.Cipher;

        try {
            switch (method) {
                case 'aes-256-cbc':
                    cipher = crypto.createCipheriv(method, key, ivBuffer);
                    break;
                case 'aes-128-cbc':
                    cipher = crypto.createCipheriv('aes-128-cbc', key.slice(0, 16), ivBuffer);
                    break;
                case 'aes-192-cbc':
                    cipher = crypto.createCipheriv('aes-192-cbc', key.slice(0, 24), ivBuffer);
                    break;
                default:
                    throw new Error('Unsupported encryption method');
            }

            cipher.setAutoPadding(true);
        } catch (cipherError) {
            safeWriteLog(`Cipher creation error: ${cipherError}`);
            throw cipherError;
        }

        const encryptionStream = inputStream.pipe(cipher).pipe(outputStream);

        return new Promise((resolve, reject) => {
            encryptionStream.on('finish', () => {
                const outputStats = fs.statSync(fullOutputPath);
                safeWriteLog(`Encrypted file created: ${fullOutputPath}`);
                safeWriteLog(`Encrypted file size: ${outputStats.size} bytes`);
                resolve(fullOutputPath);
            });

            encryptionStream.on('error', (error) => {
                safeWriteLog(`File encryption error: ${error}`);
                reject(error);
            });
        });
    } catch (error) {
        await safeWriteLog(`File encryption error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
    }
}