import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { generateKey, getIVLength } from '../utils/crypto';
import getKey from './KeyService';
import { PNG } from 'pngjs';
import { safeWriteLog } from './writeLog';

let PRIVATE_KEY: string | null = null;

async function initializeUniqueKey() {
    safeWriteLog('[initKey] Fetching PRIVATE_KEY...');
    PRIVATE_KEY = await getKey();
    safeWriteLog('[initKey] PRIVATE_KEY retrieved: ' + PRIVATE_KEY,);
}

function packFiles(files: string[]): Buffer {
    safeWriteLog(`[packFiles] Start packing ${files.length} file(s)`);
    const buffers: Buffer[] = [];

    const fileCountBuffer = Buffer.alloc(2);
    fileCountBuffer.writeUInt16BE(files.length, 0);
    buffers.push(fileCountBuffer);

    for (const filePath of files) {
        const data = fs.readFileSync(filePath);
        const filename = path.basename(filePath);
        const nameBuffer = Buffer.from(filename, 'utf-8');

        const nameLength = Buffer.alloc(2);
        nameLength.writeUInt16BE(nameBuffer.length, 0);

        const sizeBuffer = Buffer.alloc(4);
        sizeBuffer.writeUInt32BE(data.length, 0);

        buffers.push(nameLength, nameBuffer, sizeBuffer, data);
    }

    const result = Buffer.concat(buffers);
    safeWriteLog(`[packFiles] Final packed buffer size: ${result.length}`);
    return result;
}

export async function embedDataInImage(
    imagePath: string,
    payloadBuffer: Buffer,
    outputPath: string
): Promise<void> {
    safeWriteLog('[embedDataInImage] Embedding data into image...');
    return new Promise((resolve, reject) => {
        fs.createReadStream(imagePath)
            .pipe(new PNG())
            .on('parsed', function () {
                const bitArray: number[] = [];
                for (let byte of payloadBuffer) {
                    for (let i = 7; i >= 0; i--) {
                        bitArray.push((byte >> i) & 1);
                    }
                }

                safeWriteLog(`[embedDataInImage] Image size: ${this.width, 'x', this.height}`);
                safeWriteLog(`[embedDataInImage] Payload size (bytes): ${payloadBuffer.length}`);
                safeWriteLog(`[embedDataInImage] Payload size (bits): ${bitArray.length}`);
                safeWriteLog(`[embedDataInImage] PNG raw buffer size: ${this.data.length}`);

                if (bitArray.length > this.data.length) {
                    return reject("payload_too_large");
                }

                for (let i = 0; i < bitArray.length; i++) {
                    this.data[i] = (this.data[i] & 0b11111110) | bitArray[i];
                }

                this.pack().pipe(fs.createWriteStream(outputPath)).on('finish', () => {
                    safeWriteLog('[embedDataInImage] ✅ Embedding completed successfully');
                    resolve();
                });
            })
            .on("error", err => {
                console.error('[embedDataInImage] PNG parsing error:', err);
                reject(err);
            });
    });
}

export async function hideDataInImage(
    imagePath: string,
    secretFilesPaths: string[],
    method: string,
    outputPath: string
): Promise<{ outputPath: string; response: string }> {
    try {
        safeWriteLog('[hideDataInImage] Start');
        safeWriteLog(`[hideDataInImage] Files: ${secretFilesPaths}`);
        safeWriteLog(`[hideDataInImage] Method: ${method}`);
        safeWriteLog(`[hideDataInImage] Output path: ${outputPath}`);

        await initializeUniqueKey();

        if (!PRIVATE_KEY) {
            throw new Error('[hideDataInImage] ❌ No unique key found');
        }

        const ivLength = getIVLength(method);
        const iv = crypto.randomBytes(ivLength);
        const salt = crypto.randomBytes(16);

        const key = generateKey({
            originalKey: PRIVATE_KEY,
            method,
            salt,
        });

        let usableKey: Buffer;
        switch (method) {
            case 'aes-256-cbc': usableKey = key.slice(0, 32); break;
            case 'aes-192-cbc': usableKey = key.slice(0, 24); break;
            case 'aes-128-cbc': usableKey = key.slice(0, 16); break;
            default: throw new Error('Unsupported encryption method');
        }

        const packedData = packFiles(secretFilesPaths);
        const cipher = crypto.createCipheriv(method, usableKey, iv);
        const encrypted = Buffer.concat([cipher.update(packedData), cipher.final()]);

        const encryptedLength = Buffer.alloc(4);
        encryptedLength.writeUInt32BE(encrypted.length, 0);

        const finalPayload = Buffer.concat([
            encryptedLength, // prefix with size for extraction
            iv,
            salt,
            encrypted
        ]);

        safeWriteLog(`[hideDataInImage] Final payload size: ${finalPayload.length}`);

        await embedDataInImage(imagePath, finalPayload, outputPath);

        safeWriteLog('[hideDataInImage] ✅ All done!');
        return {
            outputPath: outputPath,
            response: "OK"
        };
    } catch (error) {
        console.error('[hideDataInImage] ❌ Error:', error);
        throw error;
    }
}

export default hideDataInImage;
