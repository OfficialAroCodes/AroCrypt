import * as crypto from 'crypto';

export function generateKey({ originalKey, method, salt }: { originalKey: string; method: string; salt: Buffer }) {
    if (!originalKey) {
        throw new Error("No encryption key provided");
    }

    const iterations = 100000;
    const keyLength = method === "aes-256-cbc" ? 32
        : method === "aes-192-cbc" ? 24
            : method === "aes-128-cbc" ? 16
                : 32;

    return crypto.pbkdf2Sync(originalKey, salt, iterations, keyLength, "sha256");
}

export function getIVLength(method: string): number {
    switch (method) {
        case 'aes-256-cbc':
        case 'aes-128-cbc':
        case 'aes-192-cbc':
            return 16;
        default:
            throw new Error('Unsupported encryption method');
    }
}