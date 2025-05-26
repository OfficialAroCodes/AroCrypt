import * as crypto from 'crypto';

export function generateKey(params: { originalKey: string | Buffer; method: string }) {
    const { originalKey, method } = params;

    if (!originalKey) {
        throw new Error('No encryption key provided');
    }

    const keyString = (() => {
        if (typeof originalKey === 'string') {
            return originalKey.replace(/[^\x20-\x7E]/g, '').trim();
        }
        if (originalKey instanceof Buffer) {
            return originalKey.toString('utf8').replace(/[^\x20-\x7E]/g, '').trim();
        }
        return String(originalKey).replace(/[^\x20-\x7E]/g, '').trim();
    })();

    const normalizedKey = keyString.length > 64 
        ? keyString.substring(0, 64) 
        : keyString.padEnd(16, 'X');

    const salt = crypto.createHash('sha256')
        .update('AroCrypt_Salt_' + normalizedKey) 
        .digest()
        .slice(0, 16);

    const iterations = 100000;
    const keyLength = method === 'aes-256-cbc' ? 32
        : method === 'aes-192-cbc' ? 24
            : method === 'aes-128-cbc' ? 16
                : 32;

    return crypto.pbkdf2Sync(
        normalizedKey,
        salt,
        iterations,
        keyLength,
        'sha256'
    );
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