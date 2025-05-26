import fs from 'fs';
import path from 'path';
import * as crypto from 'crypto';
import { generateKey, getIVLength } from './crypto';
import { safeWriteLog } from './writeLog';
import { sanitizeFilePath } from './sanitizeFilePath';
import getKey from './KeyService';

let UNIQUE_KEY: string | null = null;

async function initializeUniqueKey() {
    UNIQUE_KEY = await getKey();
}

export async function decryptFile(
    inputPath: string,
    method: string,
    key: string | null = UNIQUE_KEY,
    outputPath?: string
): Promise<string> {
    try {
        await initializeUniqueKey();
        if (!key) {
            throw new Error('No decryption key found');
        }

        const fullInputPath = sanitizeFilePath(inputPath, false);

        if (!fs.existsSync(fullInputPath) || !fullInputPath.endsWith('.arocrypt')) {
            throw new Error(`Invalid encrypted file: ${fullInputPath}`);
        }

        const keyBuffer = generateKey({ originalKey: key, method });

        const ivLength = getIVLength(method);
        const fileHandle = await fs.promises.open(fullInputPath, 'r');
        const ivBuffer = Buffer.alloc(ivLength);
        await fileHandle.read(ivBuffer, 0, ivLength, 0);
        await fileHandle.close();

        // Determine output path
        const originalFilename = path.basename(fullInputPath, '.arocrypt');
        const defaultOutputPath = path.join(path.dirname(fullInputPath), originalFilename);
        const fullOutputPath = outputPath
            ? sanitizeFilePath(outputPath, true)
            : defaultOutputPath;

        const inputStream = fs.createReadStream(fullInputPath, {
            start: ivLength,
            encoding: undefined 
        });
        const outputStream = fs.createWriteStream(fullOutputPath, {
            encoding: undefined 
        });

        let decipher: crypto.Decipher;
        try {
            switch (method) {
                case 'aes-256-cbc':
                    decipher = crypto.createDecipheriv(method, keyBuffer, ivBuffer);
                    break;
                case 'aes-128-cbc':
                    decipher = crypto.createDecipheriv('aes-128-cbc', keyBuffer.slice(0, 16), ivBuffer);
                    break;
                case 'aes-192-cbc':
                    decipher = crypto.createDecipheriv('aes-192-cbc', keyBuffer.slice(0, 24), ivBuffer);
                    break;
                default:
                    throw new Error('Unsupported decryption method');
            }

            // Ensure proper padding
            decipher.setAutoPadding(true);
        } catch (cipherError) {
            safeWriteLog(`Decipher creation error: ${cipherError}`);
            throw cipherError;
        }

        const decryptionStream = inputStream.pipe(decipher).pipe(outputStream);

        return new Promise((resolve, reject) => {
            decryptionStream.on('finish', () => {
                safeWriteLog(`Decryption successful. Output file: ${fullOutputPath}`);
                resolve(fullOutputPath);
            });

            decryptionStream.on('error', (error: any) => {
                if (error.message && error.message.includes('BAD_DECRYPT')) {
                    const specificError = new Error('Decryption failed: Incorrect key or corrupted file');
                    
                    try {
                        if (fs.existsSync(fullOutputPath)) {
                            fs.unlinkSync(fullOutputPath);
                        }
                    } catch (cleanupError) {
                        safeWriteLog(`Error during cleanup: ${cleanupError}`);
                    }
                    
                    reject(specificError);
                } else {
                    safeWriteLog(`File decryption stream error: ${error}`);
                    safeWriteLog(`Detailed error: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
                    
                    reject(error);
                }
            });
        });
    } catch (error) {
        await safeWriteLog(`File decryption error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        await safeWriteLog(`Detailed error: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
        throw error;
    }
}
