import fs from "fs";
import { generateKey, getIVLength } from "./crypto";
import { safeWriteLog } from "./writeLog";
import crypto from 'crypto'

export async function validateFileDecryption(inputPath: string, method: string, key: string): Promise<string> {
    if (!inputPath || !method || !key) {
        throw new Error('Invalid input parameters for file decryption validation');
    }

    try {
        const fileBuffer = await fs.promises.readFile(inputPath);
        const fileStats = await fs.promises.stat(inputPath);
        const hmacStart = fileStats.size - 32; // SHA-256 HMAC is 32 bytes

        const fileHandle = await fs.promises.open(inputPath, 'r');
        const ivLength = getIVLength(method);
        const ivBuffer = Buffer.alloc(ivLength);
        const saltBuffer = Buffer.alloc(16);
        const hmacBuffer = Buffer.alloc(32);
        
        // Read IV, salt, and HMAC from the file
        await fileHandle.read(ivBuffer, 0, ivLength, 0);
        await fileHandle.read(saltBuffer, 0, 16, ivLength);
        await fileHandle.read(hmacBuffer, 0, 32, hmacStart);
        await fileHandle.close();

        safeWriteLog(`[VALIDATE] IV (hex): ${ivBuffer.toString('hex')}`);
        safeWriteLog(`[VALIDATE] Salt (hex): ${saltBuffer.toString('hex')}`);
        safeWriteLog(`[VALIDATE] HMAC (hex): ${hmacBuffer.toString('hex')}`);

        const keyBuffer = generateKey({ originalKey: key, method, salt: saltBuffer });
        safeWriteLog(`[VALIDATE] Generated key length: ${keyBuffer.length} bytes`);

        // Verify HMAC before proceeding with decryption
        const hmacKey = crypto.createHash('sha256').update(keyBuffer).digest();
        const hmac = crypto.createHmac('sha256', hmacKey);
        
        // Calculate HMAC over IV + salt + encrypted content
        hmac.update(ivBuffer);
        hmac.update(saltBuffer);
        hmac.update(fileBuffer.slice(ivLength + 16, hmacStart));
        
        const calculatedHmac = hmac.digest('hex');
        const storedHmac = hmacBuffer.toString('hex');

        if (calculatedHmac !== storedHmac) {
            safeWriteLog(`[VALIDATE] HMAC verification failed`);
            safeWriteLog(`[VALIDATE] Calculated HMAC: ${calculatedHmac}`);
            safeWriteLog(`[VALIDATE] Stored HMAC: ${storedHmac}`);
            throw new Error('HMAC verification failed: File may be corrupted or tampered with');
        }

        safeWriteLog(`[VALIDATE] HMAC verification successful`);

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

            const encryptedContent = fileBuffer.slice(ivLength + 16, hmacStart);
            const decryptedBuffer = decipher.update(encryptedContent);
            const finalBuffer = decipher.final();

            safeWriteLog(`[VALIDATE] Decryption validation successful`);
            return 'Valid key';
        } catch (decipherError: any) {
            if (decipherError.message && decipherError.message.includes('BAD_DECRYPT')) {
                safeWriteLog(`[VALIDATE] BAD_DECRYPT error: ${decipherError.message}`);
                throw new Error('Invalid key: Decryption failed');
            }
            throw decipherError;
        }
    } catch (error) {
        await safeWriteLog(`[VALIDATE] Decryption validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw new Error('Invalid key or decryption method');
    }
}