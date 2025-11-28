import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PNG } from 'pngjs';
import { AesKeySlice, generateKey, getIVLength } from '../utils/crypto';
import { app } from 'electron';
import { safeWriteLog } from './writeLog';
import { loadKemKeys } from './KeyService';
import { MlKem768 } from 'mlkem';

const kem = new MlKem768();

export function unpackFiles(buffer: Buffer, outputPath: string): string[] {
    safeWriteLog(`[unpackFiles] Buffer size: ${buffer.length}`);
    const extractedFiles: string[] = [];

    try {
        let offset = 0;
        const totalFiles = buffer.readUInt16BE(offset);
        offset += 2;

        safeWriteLog(`[unpackFiles] Total files embedded: ${totalFiles}`);

        for (let i = 0; i < totalFiles; i++) {
            safeWriteLog(`[unpackFiles] Extracting file ${i + 1}/${totalFiles}`);

            const filenameLength = buffer.readUInt16BE(offset);
            offset += 2;

            const filename = buffer.slice(offset, offset + filenameLength).toString('utf-8');
            offset += filenameLength;

            const fileSize = buffer.readUInt32BE(offset);
            offset += 4;

            const fileData = buffer.slice(offset, offset + fileSize);
            offset += fileSize;

            const finalPath = path.join(outputPath, filename);
            const dir = path.dirname(finalPath);
            fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(finalPath, fileData);
            safeWriteLog(`[unpackFiles] File extracted to: ${finalPath}`);

            extractedFiles.push(finalPath);
        }

        return extractedFiles;
    } catch (err) {
        console.error(`[unpackFiles] Error:`, err);
        throw err;
    }
}

export default async function extractHiddenData(
    imagePath: string,
    method: string
): Promise<{ response: string; files: string[] }> {
    safeWriteLog(`[EXTRACT] Image path: ${imagePath}`);
    safeWriteLog(`[EXTRACT] Method: ${method}`);

    const { PRIVATE_KEY } = await loadKemKeys();

    // Create temporary directory
    const tempDir = path.join(app.getPath('temp'), 'arocrypt-extraction');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
        const imageStream = fs.createReadStream(imagePath);
        const png = new PNG();

        png.on('parsed', async function () {
            try {
                safeWriteLog(`[EXTRACT] PNG parsed`);

                const bitData: number[] = [];
                for (let i = 0; i < this.data.length; i++) {
                    bitData.push(this.data[i] & 1);
                }

                const byteData = [];
                for (let i = 0; i < bitData.length; i += 8) {
                    const byte = bitData
                        .slice(i, i + 8)
                        .reduce((acc, bit, j) => acc | (bit << (7 - j)), 0);
                    byteData.push(byte);
                }

                const fullBuffer = Buffer.from(byteData);
                const payloadBase64 = fullBuffer.toString('utf8').trim();
                const payload: {
                    content: string;
                    iv: string;
                    salt: string;
                    kemCiphertext?: string | null;
                    authTag?: string;
                    hmac?: string;
                } = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'));

                const ivBuffer = Buffer.from(payload.iv, 'hex');
                const saltBuffer = Buffer.from(payload.salt, 'hex');
                const encryptedData = Buffer.from(payload.content, 'hex');
                const kemCiphertextBuf = payload.kemCiphertext
                    ? Uint8Array.from(Buffer.from(payload.kemCiphertext, 'base64'))
                    : null;
                const authTag = payload.authTag ? Buffer.from(payload.authTag, 'hex') : null;

                // Derive AES key
                let originalKeyForKdf: string;
                if (kemCiphertextBuf) {
                    try {
                        const sharedSecret = await kem.decap(
                            kemCiphertextBuf,
                            Uint8Array.from(Buffer.from(PRIVATE_KEY!, 'base64'))
                        );
                        originalKeyForKdf = Buffer.from(sharedSecret).toString();
                    } catch (e) {
                        safeWriteLog(`[EXTRACT] KEM decapsulation failed: ${(e as Error).message}`);
                        throw e;
                    }
                } else {
                    originalKeyForKdf = PRIVATE_KEY!;
                }

                const aesKey = generateKey({
                    originalKey: originalKeyForKdf,
                    method,
                    salt: saltBuffer,
                });

                // Verify HMAC if non-AEAD
                if (!/gcm|chacha/i.test(method) && payload.hmac) {
                    const hmacKey = crypto.createHash('sha256').update(AesKeySlice(method, aesKey)).digest();
                    const hmac = crypto.createHmac('sha256', hmacKey);
                    hmac.update(ivBuffer);
                    hmac.update(saltBuffer);
                    hmac.update(encryptedData);
                    if (payload.kemCiphertext) hmac.update(Buffer.from(payload.kemCiphertext, 'base64'));
                    const digest = hmac.digest('hex');
                    if (digest !== payload.hmac) throw new Error('HMAC validation failed');
                }

                const decipher = crypto.createDecipheriv(method, AesKeySlice(method, aesKey), ivBuffer);
                if (authTag) (decipher as crypto.DecipherGCM).setAuthTag(authTag);

                const decryptedBuffer = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
                const files = unpackFiles(decryptedBuffer, tempDir);

                safeWriteLog(`[EXTRACT] Extraction complete. Files: ${files}`);
                resolve({ response: 'OK', files });
            } catch (err) {
                console.error(`[EXTRACT] Error during extraction/decryption:`, err);
                reject({ response: 'BAD', error: err });
            }
        });

        png.on('error', err => {
            console.error(`[EXTRACT] PNG error:`, err);
            reject({ response: 'BAD', error: err });
        });

        imageStream.pipe(png);
    });
}
