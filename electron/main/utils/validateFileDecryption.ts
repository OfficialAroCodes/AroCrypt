import fs from "fs";
import { generateKey } from "./crypto";
import { safeWriteLog } from "./writeLog";
import crypto from 'crypto'

export async function validateFileDecryption(inputPath: string, method: string, key: string): Promise<string> {
    if (!inputPath || !method || !key) {
        throw new Error('Invalid input parameters for file decryption validation');
    }

    try {
        const fileBuffer = await fs.promises.readFile(inputPath);

        const fileHandle = await fs.promises.open(inputPath, 'r');
        const ivBuffer = Buffer.alloc(16);
        await fileHandle.read(ivBuffer, 0, 16, 0);
        await fileHandle.close();

        const keyBuffer = generateKey({ originalKey: key, method });

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

            const encryptedContent = fileBuffer.slice(16); // Skip IV
            const decryptedBuffer = decipher.update(encryptedContent);
            const finalBuffer = decipher.final();

        } catch (decipherError: any) {

            if (decipherError.message && decipherError.message.includes('BAD_DECRYPT')) {
                throw new Error('Invalid key: Decryption failed');
            }

            throw decipherError;
        }

        return 'Valid key';
    } catch (error) {
        await safeWriteLog(`Decryption validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw new Error('Invalid key or decryption method');
    }
}