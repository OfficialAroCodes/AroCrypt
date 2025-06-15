import fs from 'fs';
import path from 'path';
import * as crypto from 'crypto';
import { generateKey, getIVLength } from './crypto';
import { safeWriteLog } from './writeLog';
import { sanitizeFilePath } from './sanitizeFilePath';
import getKey from './KeyService';

let PRIVATE_KEY: string | null = null;

async function initializeUniqueKey() {
    PRIVATE_KEY = await getKey();
}

export async function decryptFile(
    inputPath: string,
    method: string,
    key: string | null = PRIVATE_KEY,
    outputPath?: string
): Promise<string> {
    try {
        await initializeUniqueKey();
        if (!key) {
            throw new Error('No decryption key found');
        }

        safeWriteLog(`[DECRYPT] Starting decryption of file: ${inputPath}`);
        safeWriteLog(`[DECRYPT] Using method: ${method}`);

        const fullInputPath = sanitizeFilePath(inputPath, false);

        if (!fs.existsSync(fullInputPath) || !fullInputPath.endsWith('.arocrypt')) {
            throw new Error(`Invalid encrypted file: ${fullInputPath}`);
        }

        const ivLength = getIVLength(method);
        const fileHandle = await fs.promises.open(fullInputPath, 'r');
        
        // Read IV, salt, and HMAC from the file
        const ivBuffer = Buffer.alloc(ivLength);
        const saltBuffer = Buffer.alloc(16);
        const hmacBuffer = Buffer.alloc(32); // SHA-256 HMAC is 32 bytes
        
        await fileHandle.read(ivBuffer, 0, ivLength, 0);
        await fileHandle.read(saltBuffer, 0, 16, ivLength);
        await fileHandle.close();

        // Get file size and read HMAC from the end
        const fileStats = await fs.promises.stat(fullInputPath);
        const hmacStart = fileStats.size - 32;
        const hmacReadHandle = await fs.promises.open(fullInputPath, 'r');
        await hmacReadHandle.read(hmacBuffer, 0, 32, hmacStart);
        await hmacReadHandle.close();

        safeWriteLog(`[DECRYPT] IV (hex): ${ivBuffer.toString('hex')}`);
        safeWriteLog(`[DECRYPT] Salt (hex): ${saltBuffer.toString('hex')}`);
        safeWriteLog(`[DECRYPT] HMAC (hex): ${hmacBuffer.toString('hex')}`);

        const keyBuffer = generateKey({ originalKey: key, method, salt: saltBuffer });
        safeWriteLog(`[DECRYPT] Generated key length: ${keyBuffer.length} bytes`);

        // Verify HMAC before proceeding with decryption
        const hmacKey = crypto.createHash('sha256').update(keyBuffer).digest();
        const hmac = crypto.createHmac('sha256', hmacKey);
        
        // Read the file content up to the HMAC
        const fileContent = await fs.promises.readFile(fullInputPath);
        hmac.update(ivBuffer);
        hmac.update(saltBuffer);
        hmac.update(fileContent.slice(ivLength + 16, hmacStart));
        
        const calculatedHmac = hmac.digest('hex');
        const storedHmac = hmacBuffer.toString('hex');

        if (calculatedHmac !== storedHmac) {
            safeWriteLog(`[DECRYPT] HMAC verification failed`);
            safeWriteLog(`[DECRYPT] Calculated HMAC: ${calculatedHmac}`);
            safeWriteLog(`[DECRYPT] Stored HMAC: ${storedHmac}`);
            throw new Error('HMAC verification failed: File may be corrupted or tampered with');
        }

        safeWriteLog(`[DECRYPT] HMAC verification successful`);

        // Determine output path
        const originalFilename = path.basename(fullInputPath, '.arocrypt');
        const defaultOutputPath = path.join(path.dirname(fullInputPath), originalFilename);
        const fullOutputPath = outputPath
            ? sanitizeFilePath(outputPath, true)
            : defaultOutputPath;

        safeWriteLog(`[DECRYPT] Output path: ${fullOutputPath}`);

        const inputStream = fs.createReadStream(fullInputPath, {
            start: ivLength + 16, // Skip IV and salt
            end: hmacStart - 1, // Stop before HMAC
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

            decipher.setAutoPadding(true);
            safeWriteLog(`[DECRYPT] Decipher created successfully`);
        } catch (cipherError) {
            safeWriteLog(`[DECRYPT] Decipher creation error: ${cipherError}`);
            throw cipherError;
        }

        const decryptionStream = inputStream.pipe(decipher).pipe(outputStream);

        return new Promise((resolve, reject) => {
            decryptionStream.on('finish', () => {
                safeWriteLog(`[DECRYPT] Decryption successful. Output file: ${fullOutputPath}`);
                resolve(fullOutputPath);
            });

            decryptionStream.on('error', (error: any) => {
                if (error.message && error.message.includes('BAD_DECRYPT')) {
                    const specificError = new Error('Decryption failed: Incorrect key or corrupted file');
                    safeWriteLog(`[DECRYPT] BAD_DECRYPT error: ${error.message}`);
                    safeWriteLog(`[DECRYPT] Error details: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
                    
                    try {
                        if (fs.existsSync(fullOutputPath)) {
                            fs.unlinkSync(fullOutputPath);
                        }
                    } catch (cleanupError) {
                        safeWriteLog(`[DECRYPT] Error during cleanup: ${cleanupError}`);
                    }
                    
                    reject(specificError);
                } else {
                    safeWriteLog(`[DECRYPT] File decryption stream error: ${error}`);
                    safeWriteLog(`[DECRYPT] Detailed error: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
                    
                    reject(error);
                }
            });
        });
    } catch (error) {
        await safeWriteLog(`[DECRYPT] File decryption error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        await safeWriteLog(`[DECRYPT] Detailed error: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
        throw error;
    }
}
