export function generateCryptographicKey(length: number = 32): string {
    if (typeof window !== 'undefined' && window.crypto) {
        const array = new Uint8Array(length);
        window.crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    } else {
        const nodeCrypto = require('crypto');
        return nodeCrypto.randomBytes(length).toString('hex');
    }
}