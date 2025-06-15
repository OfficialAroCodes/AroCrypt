import keytar from 'keytar';
import { safeWriteLog } from './writeLog';

const SERVICE_NAME = 'AroCrypt';
const ACCOUNT_NAME = 'private_key';

// Min. key length in bytes (32 bytes = 256 bits)
const MIN_KEY_LENGTH = 32;

function validateKey(key: string): boolean {
    if (!key || typeof key !== 'string') {
        return false;
    }
    
    // Convert hex string to buffer
    try {
        const keyBuffer = Buffer.from(key, 'hex');
        return keyBuffer.length >= MIN_KEY_LENGTH;
    } catch {
        return false;
    }
}

export default async function getKey(): Promise<string | null> {
    try {
        const storedKey = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);
        
        if (!storedKey) {
            safeWriteLog('[KeyService] No key found in credential storage');
            return null;
        }

        if (!validateKey(storedKey)) {
            safeWriteLog('[KeyService] Retrieved key failed validation');
            return null;
        }

        return storedKey;
    } catch (error) {
        safeWriteLog(`[KeyService] Error retrieving key: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return null;
    }
}

export async function savePrivateKey(key: string): Promise<boolean> {
    try {
        if (!validateKey(key)) {
            safeWriteLog('[KeyService] Invalid key format or length');
            return false;
        }

        await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, key);
        safeWriteLog('[KeyService] Key successfully saved to credential storage');
        return true;
    } catch (error) {
        safeWriteLog(`[KeyService] Error saving key: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return false;
    }
}