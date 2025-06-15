export function generateCryptographicKey(length: number = 32): string {
    if (typeof window === 'undefined' || !window.crypto) {
        throw new Error('Web Crypto API is not available');
    }
    
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);

    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function validateCryptographicKey(key: string, expectedLength: number = 32): boolean {
    if (!key || typeof key !== 'string') {
        return false;
    }

    try {
        // Check if the string is valid hex
        if (!/^[0-9a-f]+$/i.test(key)) {
            return false;
        }

        // Check if the length matches expected length
        const keyBuffer = Buffer.from(key, 'hex');
        return keyBuffer.length === expectedLength;
    } catch {
        return false;
    }
}