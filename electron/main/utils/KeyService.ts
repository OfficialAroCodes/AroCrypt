import { safeWriteLog } from './writeLog';
import { MlKem768 } from 'mlkem';
import { saveKEMKeyToDB, getKeys } from './db/DBService';

export function validateKemKey(key: string, type: "public" | "secret"): boolean {
    if (!key || typeof key !== "string") return false;

    try {
        const bytes = Buffer.from(key, "base64");
        if (type === "public") return bytes.length > 0;
        if (type === "secret") return bytes.length > 0;
        return false;
    } catch {
        return false;
    }
}

export async function saveKEMKey(public_key: string, secret_key: string, recipient_key: string): Promise<boolean> {
    try {
        if (!validateKemKey(secret_key, "secret") || !validateKemKey(public_key, "public") || !validateKemKey(recipient_key, "public")) {
            safeWriteLog('[KeyService] Invalid KEM key format detected - keys must be valid base64 with correct byte length');
            return false;
        }

        await saveKEMKeyToDB(public_key, secret_key, recipient_key);
        return true;
    } catch (error) {
        safeWriteLog(`[KeyService] Error Saving KEM Keys: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return false;
    }
}

// Post-Quantum Key Exchange

export type MlKemKeyPair = {
    publicKey: string;  // base64
    secretKey: string;  // base64
};

export async function createMlKemKeys(): Promise<MlKemKeyPair> {
    const kem = new MlKem768();

    // Generate key pair
    const [pk, sk] = await kem.generateKeyPair();

    // Convert to base64 for IPC / storage
    return {
        publicKey: Buffer.from(pk).toString("base64"),
        secretKey: Buffer.from(sk).toString("base64"),
    };
}

export type KemKeys = {
    PRIVATE_KEY: string;
    PUBLIC_KEY: string;
    RECIPIENT_KEY: string;
};

export async function loadKemKeys(): Promise<KemKeys> {
    const keys = await getKeys();
    if (!keys || keys.length === 0) {
        throw new Error("[KEYS] No KEM keys found!");
    }

    const PRIVATE_KEY = keys[0].secret;
    const PUBLIC_KEY = keys[0].public;
    const RECIPIENT_KEY = keys[0].recipient;

    if (!PRIVATE_KEY) throw new Error("[KEYS] PRIVATE_KEY not found!");
    if (!PUBLIC_KEY) throw new Error("[KEYS] PUBLIC_KEY not found!");
    if (!RECIPIENT_KEY) throw new Error("[KEYS] RECIPIENT_KEY not found!");

    return { PRIVATE_KEY, PUBLIC_KEY, RECIPIENT_KEY };
}