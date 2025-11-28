import { generateKey } from "./crypto";
import crypto from "crypto";
import { loadKemKeys } from "./KeyService";
import { MlKem768 } from "mlkem";

const kem = new MlKem768();

interface EncryptedPayload {
    content: string;
    iv: string;
    salt: string;
    kemCiphertext: string | null;
    hmac?: string;
    authTag?: string;
}

export async function decrypt(
    packedData: string,
    method: string
): Promise<string> {
    console.log("[DECRYPT] Starting decryption");

    const { PRIVATE_KEY } = await loadKemKeys();
    if (!PRIVATE_KEY) throw new Error("[DECRYPT] Private key not found!");

    try {
        const jsonStr = Buffer.from(packedData, "base64").toString("utf8");
        const payload: EncryptedPayload = JSON.parse(jsonStr);

        console.log("[DECRYPT] Payload:", payload);

        const iv = Buffer.from(payload.iv, "hex");
        const salt = Buffer.from(payload.salt, "hex");
        const encryptedBuffer = Buffer.from(payload.content, "hex");

        if (!payload.kemCiphertext) throw new Error("Missing KEM ciphertext!");

        const kemCiphertext = Uint8Array.from(Buffer.from(payload.kemCiphertext, "base64"));
        const privateKeyUint8 = Uint8Array.from(Buffer.from(PRIVATE_KEY, "base64"));
        const sharedSecret = await kem.decap(kemCiphertext, privateKeyUint8);

        const aesKey = generateKey({
            originalKey: Buffer.from(sharedSecret).toString(),
            method,
            salt,
        });

        console.log("[DECRYPT] Derived AES key (hex):", aesKey.toString("hex"));

        const keySlice = aesKey.slice(0, aesKey.length > 32 ? 32 : aesKey.length);

        // --- Integrity check before decrypt ---
        if (/gcm|chacha/i.test(method)) {
            if (!payload.authTag) throw new Error("[DECRYPT] Missing authTag for AEAD mode!");
        } else {
            if (!payload.hmac) throw new Error("[DECRYPT] Missing HMAC for non-AEAD mode!");

            const hmacKey = crypto.createHash("sha256").update(keySlice).digest();
            const hmac = crypto.createHmac("sha256", hmacKey);
            hmac.update(iv);
            hmac.update(salt);
            hmac.update(encryptedBuffer);
            if (payload.kemCiphertext) hmac.update(payload.kemCiphertext);

            const computed = hmac.digest("hex");
            console.log("[DECRYPT] Computed HMAC:", computed);
            console.log("[DECRYPT] Provided HMAC:", payload.hmac);

            if (computed !== payload.hmac) {
                throw new Error("HMAC verification failed: data integrity compromised");
            }
        }

        // --- Proceed with decryption ---
        const decipher = crypto.createDecipheriv(method, keySlice, iv);
        if (/gcm|chacha/i.test(method)) {
            (decipher as crypto.DecipherGCM).setAuthTag(Buffer.from(payload.authTag!, "hex"));
        }

        let decrypted = decipher.update(encryptedBuffer);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        const finalText = decrypted.toString("utf8");
        return finalText;
    } catch (error) {
        console.error("[DECRYPT] Exception:", error);
        return "invalid";
    }
}