import { generateKey } from "./crypto";
import getKey from "./KeyService";
import crypto from "crypto";

let UNIQUE_KEY: string | null = null;

async function initializeUniqueKey() {
    UNIQUE_KEY = await getKey();
}

export async function decrypt(params: {
    content: string,
    iv: string,
    method?: string,
    authTag?: string | null,
}) {
    const {
        content,
        iv,
        method,
        authTag = null,
    } = params;

    await initializeUniqueKey();
    if (!UNIQUE_KEY) {
        return "invalid";
    }

    try {
        const keyBuffer = generateKey({ originalKey: UNIQUE_KEY!, method: method! });
        const ivBuffer = Buffer.from(iv, 'hex');
        let decipher, decrypted;

        switch (method) {
            case 'aes-256-cbc':
                decipher = crypto.createDecipheriv(method, keyBuffer, ivBuffer);
                decrypted = decipher.update(content, 'hex', 'utf8');
                decrypted += decipher.final('utf8');
                break;
            case 'aes-128-cbc':
                decipher = crypto.createDecipheriv('aes-128-cbc', keyBuffer.slice(0, 16), ivBuffer);
                decrypted = decipher.update(content, 'hex', 'utf8');
                decrypted += decipher.final('utf8');
                break;
            case 'aes-192-cbc':
                decipher = crypto.createDecipheriv('aes-192-cbc', keyBuffer.slice(0, 24), ivBuffer);
                decrypted = decipher.update(content, 'hex', 'utf8');
                decrypted += decipher.final('utf8');
                break;
            default:
                return "invalid";
        }

        return decrypted;
    } catch (error) {
        return "invalid";
    }
}