import fs from "fs";
import crypto from "crypto";
import { generateKey, getIVLength } from "./crypto";
import { safeWriteLog } from "./writeLog";
import { loadKemKeys } from "./KeyService";

export async function validateFileDecryption(
    inputPath: string,
    method: string
): Promise<string> {
    if (!inputPath || !method) {
        throw new Error('Invalid input parameters for file decryption validation');
    }

    try {
        const { PRIVATE_KEY } = await loadKemKeys();
        if (!PRIVATE_KEY) throw new Error('No PRIVATE_KEY found');

        const fileBuffer = await fs.promises.readFile(inputPath);
        const fileStats = await fs.promises.stat(inputPath);

        const ivLength = getIVLength(method);
        const ivBuffer = fileBuffer.slice(0, ivLength);
        const saltBuffer = fileBuffer.slice(ivLength, ivLength + 16);

        safeWriteLog(`[VALIDATE] IV (hex): ${ivBuffer.toString('hex')}`);
        safeWriteLog(`[VALIDATE] Salt (hex): ${saltBuffer.toString('hex')}`);

        const keyBuffer = generateKey({ originalKey: PRIVATE_KEY, method, salt: saltBuffer });
        safeWriteLog(`[VALIDATE] Generated key length: ${keyBuffer.length} bytes`);

        if (!/gcm|chacha/i.test(method)) {
            // HMAC verification for non-GCM/ChaCha
            const hmacStart = fileStats.size - 32;
            const encryptedContent = fileBuffer.slice(ivLength + 16, hmacStart);
            const storedHmac = fileBuffer.slice(hmacStart);

            const hmacKey = crypto.createHash('sha256').update(keyBuffer).digest();
            const hmac = crypto.createHmac('sha256', hmacKey);
            hmac.update(ivBuffer);
            hmac.update(saltBuffer);
            hmac.update(encryptedContent);

            const calculatedHmac = hmac.digest();
            if (!calculatedHmac.equals(storedHmac)) {
                safeWriteLog(`[VALIDATE] HMAC verification failed`);
                return 'bad_validate';
            }

            safeWriteLog(`[VALIDATE] HMAC verification successful`);

            // Optional: try decryption to ensure key correctness
            const decipher = crypto.createDecipheriv(method, keyBuffer, ivBuffer);
            decipher.update(encryptedContent);
            decipher.final();
        } else {
            safeWriteLog(`[VALIDATE] GCM/ChaCha mode detected: skipping HMAC validation`);
            // In GCM/ChaCha you should validate separately with auth tag during actual decryption
        }

        return 'ok';
    } catch (error: any) {
        await safeWriteLog(`[VALIDATE] Decryption validation failed: ${error.message || 'Unknown error'}`);
        return 'bad_validate';
    }
}
