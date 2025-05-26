import { generateKey, getIVLength } from "./crypto";
import crypto from "crypto";
import getKey from "./KeyService";

let UNIQUE_KEY: string | null = null;

async function initializeUniqueKey() {
    UNIQUE_KEY = await getKey();
}

export async function encrypt(text: string, method: string) {
    await initializeUniqueKey();

    if (!UNIQUE_KEY) {
        throw new Error('No unique key found for encryption');
    }

    const ivLength = getIVLength(method);
    const ivBuffer = crypto.randomBytes(ivLength);
    const keyBuffer = generateKey({ originalKey: UNIQUE_KEY, method });

    let cipher, encrypted;

    switch (method) {
        case 'aes-256-cbc':
            cipher = crypto.createCipheriv(method, keyBuffer, ivBuffer);
            encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            break;
        case 'aes-128-cbc':
            cipher = crypto.createCipheriv('aes-128-cbc', keyBuffer.slice(0, 16), ivBuffer);
            encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            break;
        case 'aes-192-cbc':
            cipher = crypto.createCipheriv('aes-192-cbc', keyBuffer.slice(0, 24), ivBuffer);
            encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            break;
        default:
            throw new Error('Unsupported encryption method');
    }

    return { iv: ivBuffer.toString('hex'), content: encrypted, method };
}