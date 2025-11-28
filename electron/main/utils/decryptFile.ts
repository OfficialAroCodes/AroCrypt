import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { AesKeySlice, generateKey, getIVLength } from '../utils/crypto';
import { sanitizeFilePath } from './sanitizeFilePath';
import { safeWriteLog } from './writeLog';
import { loadKemKeys } from './KeyService';
import { MlKem768 } from 'mlkem';

const kem = new MlKem768();

function normalizeMethod(m: string) {
    return m.trim().toLowerCase();
}

export async function decryptFile(
    inputPath: string,
    method: string,
    outputPath?: string
): Promise<string> {
    try {
        safeWriteLog(`[DECRYPT] Starting decryption: ${inputPath}`);
        safeWriteLog(`[DECRYPT] Method: ${method}`);

        const fullInputPath = sanitizeFilePath(inputPath, false);
        if (!fs.existsSync(fullInputPath) || !fullInputPath.endsWith('.arocrypt')) {
            throw new Error(`Invalid encrypted file: ${fullInputPath}`);
        }

        const { PRIVATE_KEY } = await loadKemKeys();
        if (!PRIVATE_KEY) throw new Error('No PRIVATE_KEY found');

        const fileBuffer = await fs.promises.readFile(fullInputPath);
        const normMethod = normalizeMethod(method);
        const ivLength = getIVLength(normMethod);

        const ivBuffer = fileBuffer.slice(0, ivLength);
        const saltBuffer = fileBuffer.slice(ivLength, ivLength + 16);
        let restBuffer = fileBuffer.slice(ivLength + 16);

        // If present and sane, parse [ 4-byte length | kemCiphertext | ciphertext+auth ]
        let kemCiphertextBuf: Buffer | null = null;
        if (restBuffer.length >= 4) {
            const possibleLen = restBuffer.readUInt32BE(0);
            if (possibleLen > 0 && possibleLen < restBuffer.length - 4) {
                // sanity filter: reasonable upper bound (1 MiB here, adjust if you expect bigger)
                if (possibleLen < 1024 * 1024) {
                    kemCiphertextBuf = restBuffer.slice(4, 4 + possibleLen);
                    restBuffer = restBuffer.slice(4 + possibleLen);
                    safeWriteLog(`[DECRYPT] Detected kemCiphertext in file, length: ${possibleLen}`);
                }
            }
        }

        // Extract auth tag for AEAD modes
        let authTag: Buffer | null = null;
        let encryptedData: Buffer;
        if (/gcm|chacha/i.test(normMethod)) {
            if (restBuffer.length < 16) throw new Error('File too small to contain authTag');
            authTag = restBuffer.slice(restBuffer.length - 16);
            encryptedData = restBuffer.slice(0, restBuffer.length - 16);
        } else {
            encryptedData = restBuffer;
        }

        // Derive AES key:
        // - If we found kemCiphertextBuf, decapsulate to get the shared secret (then KDF)
        // - Else fallback to using PRIVATE_KEY directly as originalKey for generateKey (your current small-file test seems to use this)
        let originalKeyForKdf: string;
        if (kemCiphertextBuf) {
            try {
                const sharedSecret = await kem.decap(
                    Uint8Array.from(kemCiphertextBuf),
                    Uint8Array.from(Buffer.from(PRIVATE_KEY, 'base64'))
                );
                originalKeyForKdf = Buffer.from(sharedSecret).toString();
                safeWriteLog(`[DECRYPT] Decapsulated KEM shared secret length: ${sharedSecret.length}`);
            } catch (e) {
                safeWriteLog(`[DECRYPT] KEM decapsulation failed: ${(e as Error).message}`);
                throw e;
            }
        } else {
            // fallback - this is probably what encrypted your small test file
            originalKeyForKdf = PRIVATE_KEY;
            safeWriteLog(`[DECRYPT] No kemCiphertext found - deriving key directly from PRIVATE_KEY (debug fallback)`);
        }

        const aesKey = generateKey({
            originalKey: originalKeyForKdf,
            method: normMethod,
            salt: saltBuffer
        });

        // Setup decipher
        const decipher = crypto.createDecipheriv(
            normMethod,
            AesKeySlice(normMethod, aesKey),
            ivBuffer
        );
        if (authTag) {
            (decipher as crypto.DecipherGCM).setAuthTag(authTag);
        }

        try {
            const decryptedChunks: Buffer[] = [];
            decryptedChunks.push(decipher.update(encryptedData));
            decryptedChunks.push(decipher.final());

            const decryptedBuffer = Buffer.concat(decryptedChunks);

            const outputFilePath = outputPath
                ? sanitizeFilePath(outputPath, true)
                : path.join(
                    path.dirname(fullInputPath),
                    path.basename(fullInputPath, ".arocrypt")
                );

            fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });
            await fs.promises.writeFile(outputFilePath, decryptedBuffer);

            safeWriteLog(`[DECRYPT] Decryption finished: ${outputFilePath}`);
            return outputFilePath;
        } catch (err: any) {
            if (
                err.message &&
                err.message.includes("Unsupported state or unable to authenticate data")
            ) {
                safeWriteLog(`[DECRYPT] BAD_DECRYPT: authentication failed`);
                return "bad_decrypt";
            }
            safeWriteLog(`[DECRYPT] Unexpected decryption error: ${err.message}`);
            return "bad_decrypt";
        }
    } catch (error) {
        await safeWriteLog(
            `[DECRYPT] Error: ${error instanceof Error ? error.message : "Unknown error"}`
        );
        return "bad_decrypt";
    }
}
