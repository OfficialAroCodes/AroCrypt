import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PNG } from 'pngjs';
import { generateKey, getIVLength } from '../utils/crypto';
import getKey from './KeyService';
import { app } from 'electron';
import { safeWriteLog } from './writeLog';

let PRIVATE_KEY: string | null = null;

async function initializeUniqueKey() {
    safeWriteLog('[initKey] Fetching PRIVATE_KEY...');
    PRIVATE_KEY = await getKey();
    safeWriteLog('[initKey] PRIVATE_KEY retrieved: ' + PRIVATE_KEY,);
}

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

export async function extractHiddenData(
    imagePath: string,
    method: string
): Promise<{ response: string; files: string[] }> {
    safeWriteLog(`[extractHiddenData] Start`);
    safeWriteLog(`[extractHiddenData] Image path: ${imagePath}`);
    safeWriteLog(`[extractHiddenData] Method: ${method}`);

    await initializeUniqueKey();
    if (!PRIVATE_KEY) throw new Error('[extractHiddenData] ❌ No PRIVATE_KEY available');

    // Create temporary directory
    const tempDir = path.join(app.getPath('temp'), 'arocrypt-extraction');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
        const imageStream = fs.createReadStream(imagePath);
        const png = new PNG();

        png.on('parsed', function () {
            try {
                safeWriteLog(`[extractHiddenData] PNG parsed`);
                const bitData: number[] = [];

                for (let i = 0; i < this.data.length; i++) {
                    bitData.push(this.data[i] & 1);
                }

                const byteData = [];
                for (let i = 0; i < bitData.length; i += 8) {
                    const byte = bitData.slice(i, i + 8).reduce((acc, bit, j) => acc | (bit << (7 - j)), 0);
                    byteData.push(byte);
                }

                const fullBuffer = Buffer.from(byteData);

                const encryptedLength = fullBuffer.readUInt32BE(0);
                const ivLength = getIVLength(method);
                const iv = fullBuffer.slice(4, 4 + ivLength);
                const salt = fullBuffer.slice(4 + ivLength, 4 + ivLength + 16);
                const encryptedData = fullBuffer.slice(4 + ivLength + 16, 4 + ivLength + 16 + encryptedLength);

                const derivedKey = generateKey({
                    originalKey: PRIVATE_KEY!,
                    method,
                    salt,
                });

                let usableKey: Buffer;
                switch (method) {
                    case 'aes-256-cbc': usableKey = derivedKey.slice(0, 32); break;
                    case 'aes-192-cbc': usableKey = derivedKey.slice(0, 24); break;
                    case 'aes-128-cbc': usableKey = derivedKey.slice(0, 16); break;
                    default: throw new Error('Unsupported encryption method');
                }

                const decipher = crypto.createDecipheriv(method, usableKey, iv);
                const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);

                const files = unpackFiles(decrypted, tempDir);

                safeWriteLog(`[extractHiddenData] ✅ Extraction complete. Files: ${files}`);
                resolve({
                    response: "OK",
                    files: files
                });
            } catch (err) {
                console.error(`[extractHiddenData] ❌ Error during PNG parse or decryption:`, err);
                reject({
                    response: "BAD",
                    error: err
                });
            }
        });

        png.on('error', err => {
            console.error(`[extractHiddenData] PNG error:`, err);
            reject({
                response: "BAD",
                error: err
            });
        });

        imageStream.pipe(png);
    });
}

export default extractHiddenData;
