import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PassThrough } from 'stream';
import { AesKeySlice, generateKey, getIVLength } from '../utils/crypto';
import { sanitizeFilePath } from './sanitizeFilePath';
import { safeWriteLog } from './writeLog';
import { loadKemKeys } from './KeyService';
import { MlKem768 } from 'mlkem';

const kem = new MlKem768();

export async function encryptFile(
    inputPath: string,
    method: string,
    outputPath?: string,
    isShareable: boolean = false): Promise<string> {
    try {

        const fullInputPath = sanitizeFilePath(inputPath, false);

        if (!fs.existsSync(fullInputPath)) {
            throw new Error(`Input file does not exist: ${fullInputPath}`);
        }

        const { PUBLIC_KEY, RECIPIENT_KEY } = await loadKemKeys();
        const ivLength = getIVLength(method);
        const iv = crypto.randomBytes(ivLength);
        const salt = crypto.randomBytes(16);

        let aesKey: Buffer;
        let kemCiphertext: Buffer | null = null;

        if (isShareable) {
            const recipientKeyUint8 = Uint8Array.from(Buffer.from(RECIPIENT_KEY, "base64"));
            const [ciphertext, sharedSecret] = await kem.encap(recipientKeyUint8);

            kemCiphertext = Buffer.from(ciphertext);

            aesKey = generateKey({
                originalKey: Buffer.from(sharedSecret).toString(),
                method,
                salt,
            });
        } else {
            const publicKeyUint8 = Uint8Array.from(Buffer.from(PUBLIC_KEY, "base64"));
            const [ciphertext, sharedSecret] = await kem.encap(publicKeyUint8);
            kemCiphertext = Buffer.from(ciphertext);
            aesKey = generateKey({
                originalKey: Buffer.from(sharedSecret).toString(),
                method,
                salt,
            });
        }

        const fullOutputPath = outputPath
            ? sanitizeFilePath(outputPath, true)
            : `${fullInputPath}.arocrypt`;

        safeWriteLog(`[ENCRYPT] Output path: ${fullOutputPath}`);

        const outputDir = path.dirname(fullOutputPath);
        fs.mkdirSync(outputDir, { recursive: true });

        const inputStream = fs.createReadStream(fullInputPath, {
            encoding: undefined,
            highWaterMark: 64 * 1024
        });

        // Create a buffer to store the encrypted data
        const chunks: Buffer[] = [];
        const passThrough = new PassThrough();

        passThrough.on('data', (chunk: Buffer) => {
            chunks.push(chunk);
        });

        let cipher: crypto.Cipher;
        let key;

        try {
            key = AesKeySlice(method, aesKey);
            cipher = crypto.createCipheriv(method, key, iv);
        } catch (cipherError) {
            safeWriteLog(`[ENCRYPT] Cipher creation error: ${cipherError}`);
            throw cipherError;
        }

        return new Promise((resolve, reject) => {
            const encryptionStream = inputStream.pipe(cipher).pipe(passThrough);

            encryptionStream.on('finish', async () => {
                try {
                    let authData: Buffer | undefined;

                    if (/gcm|chacha/i.test(method)) {
                        // GCM / ChaCha modes: get auth tag
                        authData = (cipher as crypto.CipherGCM).getAuthTag();
                    } else {
                        // Other modes: compute HMAC
                        const hmacKey = crypto.createHash('sha256').update(key).digest();
                        const hmac = crypto.createHmac('sha256', hmacKey);
                        hmac.update(iv);
                        hmac.update(salt);

                        for (const chunk of chunks) {
                            hmac.update(chunk);
                        }

                        authData = Buffer.from(hmac.digest('hex'), 'hex');
                    }

                    // Write everything to the output file
                    const outputStream = fs.createWriteStream(fullOutputPath);
                    outputStream.write(iv);
                    outputStream.write(salt);

                    if (kemCiphertext && kemCiphertext.length > 0) {
                        const lenBuf = Buffer.alloc(4);
                        lenBuf.writeUInt32BE(kemCiphertext.length, 0);
                        outputStream.write(lenBuf);
                        outputStream.write(kemCiphertext);
                    } else {
                        // write zero length
                        const lenBuf = Buffer.alloc(4);
                        lenBuf.writeUInt32BE(0, 0);
                        outputStream.write(lenBuf);
                    }

                    for (const chunk of chunks) {
                        outputStream.write(chunk);
                    }

                    if (authData) outputStream.write(authData);
                    outputStream.end();

                    outputStream.on('finish', () => {
                        const outputStats = fs.statSync(fullOutputPath);
                        safeWriteLog(`[ENCRYPT] Encrypted file created: ${fullOutputPath}`);
                        safeWriteLog(`[ENCRYPT] Encrypted file size: ${outputStats.size} bytes`);
                        safeWriteLog(
                            `${/gcm|chacha/i.test(method) ? 'AuthTag' : 'HMAC'}: ${authData?.toString('hex')}`
                        );
                        resolve(fullOutputPath);
                    });
                } catch (error: unknown) {
                    reject(error);
                }
            });

            encryptionStream.on('error', (error: Error) => {
                safeWriteLog(`[ENCRYPT] File encryption error: ${error}`);
                reject(error);
            });
        });
    } catch (error) {
        await safeWriteLog(`File encryption error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
    }
}