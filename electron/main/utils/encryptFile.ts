import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Transform, PassThrough } from 'stream';
import { generateKey, getIVLength } from '../utils/crypto';
import { sanitizeFilePath } from './sanitizeFilePath';
import getKey from './KeyService';
import { safeWriteLog } from './writeLog';

let PRIVATE_KEY: string | null = null;

async function initializeUniqueKey() {
    PRIVATE_KEY = await getKey();
}

export async function encryptFile(inputPath: string, method: string, outputPath?: string): Promise<string> {
    try {
        await initializeUniqueKey();

        if (!PRIVATE_KEY) {
            throw new Error('No unique key found for encryption');
        }

        const fullInputPath = sanitizeFilePath(inputPath, false);

        if (!fs.existsSync(fullInputPath)) {
            throw new Error(`Input file does not exist: ${fullInputPath}`);
        }

        const ivLength = getIVLength(method);
        const ivBuffer = crypto.randomBytes(ivLength);
        const salt = crypto.randomBytes(16);
        const key = generateKey({ originalKey: PRIVATE_KEY, method, salt });

        safeWriteLog(`[ENCRYPT] IV (hex): ${ivBuffer.toString('hex')}`);
        safeWriteLog(`[ENCRYPT] Salt (hex): ${salt.toString('hex')}`);
        safeWriteLog(`[ENCRYPT] Generated key length: ${key.length} bytes`);

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

        try {
            switch (method) {
                case 'aes-256-cbc':
                    cipher = crypto.createCipheriv(method, key, ivBuffer);
                    break;
                case 'aes-128-cbc':
                    cipher = crypto.createCipheriv('aes-128-cbc', key.slice(0, 16), ivBuffer);
                    break;
                case 'aes-192-cbc':
                    cipher = crypto.createCipheriv('aes-192-cbc', key.slice(0, 24), ivBuffer);
                    break;
                default:
                    throw new Error('Unsupported encryption method');
            }

            cipher.setAutoPadding(true);
            safeWriteLog(`[ENCRYPT] Cipher created successfully`);
        } catch (cipherError) {
            safeWriteLog(`[ENCRYPT] Cipher creation error: ${cipherError}`);
            throw cipherError;
        }

        return new Promise((resolve, reject) => {
            const encryptionStream = inputStream.pipe(cipher).pipe(passThrough);

            encryptionStream.on('finish', async () => {
                try {
                    // Calculate HMAC
                    const hmacKey = crypto.createHash('sha256').update(key).digest();
                    const hmac = crypto.createHmac('sha256', hmacKey);
                    
                    // Update HMAC with IV and salt
                    hmac.update(ivBuffer);
                    hmac.update(salt);
                    
                    // Update HMAC with encrypted data
                    for (const chunk of chunks) {
                        hmac.update(chunk);
                    }
                    
                    const hmacDigest = hmac.digest('hex');
                    
                    // Write everything to the output file
                    const outputStream = fs.createWriteStream(fullOutputPath);
                    outputStream.write(ivBuffer);
                    outputStream.write(salt);
                    
                    for (const chunk of chunks) {
                        outputStream.write(chunk);
                    }
                    
                    outputStream.write(Buffer.from(hmacDigest, 'hex'));
                    outputStream.end();
                    
                    outputStream.on('finish', () => {
                        const outputStats = fs.statSync(fullOutputPath);
                        safeWriteLog(`[ENCRYPT] Encrypted file created: ${fullOutputPath}`);
                        safeWriteLog(`[ENCRYPT] Encrypted file size: ${outputStats.size} bytes`);
                        safeWriteLog(`[ENCRYPT] HMAC: ${hmacDigest}`);
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