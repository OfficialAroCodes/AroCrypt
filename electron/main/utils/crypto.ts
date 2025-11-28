import * as crypto from 'crypto';

type KeyParams = { originalKey: string; method: string; salt: Buffer };

export function generateKey({ originalKey, method, salt }: KeyParams) {
    if (!originalKey) throw new Error("No encryption key provided");

    const iterations = 100000;
    let keyLength: number;

    switch (method.toUpperCase()) {
        case "AES-256-CBC":
        case "AES-256-GCM":
        case "AES-256-CTR":
            keyLength = 32;
            break;
        case "AES-192-CBC":
        case "AES-192-GCM":
        case "AES-192-CTR":
            keyLength = 24;
            break;
        case "AES-128-CBC":
        case "AES-128-GCM":
        case "AES-128-CTR":
            keyLength = 16;
            break;

        default:
            throw new Error(`Algorithm "${method}" not found!`);
    }

    return crypto.pbkdf2Sync(originalKey, salt, iterations, keyLength, "sha256");
}

export function getIVLength(method: string): number {
    switch (method.toUpperCase()) {
        case "AES-128-CBC":
        case "AES-192-CBC":
        case "AES-256-CBC":
        case "AES-128-CTR":
        case "AES-192-CTR":
        case "AES-256-CTR":
            return 16;

        case "AES-128-GCM":
        case "AES-192-GCM":
        case "AES-256-GCM":
            return 12;

        default:
            throw new Error(`IV length for algorithm "${method}" not found!`);
    }
}

export function AesKeySlice(algorithm: string, aesKey: Buffer): Buffer {
    let requiredLength: number;

    switch (algorithm.toUpperCase()) {
        case "AES-128-CBC":
        case "AES-128-CTR":
        case "AES-128-GCM":
            requiredLength = 16;
            break;
        case "AES-192-CBC":
        case "AES-192-CTR":
        case "AES-192-GCM":
            requiredLength = 24;
            break;
        case "AES-256-CBC":
        case "AES-256-CTR":
        case "AES-256-GCM":
            requiredLength = 32;
            break;
        default:
            throw new Error(`Unsupported algorithm: ${algorithm}`);
    }

    if (aesKey.length < requiredLength) {
        const padded = Buffer.alloc(requiredLength);
        aesKey.copy(padded);
        return padded;
    }

    if (aesKey.length > requiredLength) {
        return aesKey.slice(0, requiredLength);
    }

    return aesKey;
}