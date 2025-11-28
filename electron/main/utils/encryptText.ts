import { AesKeySlice, generateKey, getIVLength } from "./crypto";
import crypto from "crypto";
import { MlKem768 } from "mlkem";
import { loadKemKeys } from "./KeyService";
import { safeWriteLog } from "./writeLog";

const kem = new MlKem768();

interface EncryptedPayload {
    content: string;
    iv: string;
    salt: string;
    kemCiphertext: string | null;
    hmac?: string;
    authTag?: string;
}

export async function encrypt(
    text: string,
    method: string,
    isShareable: boolean
): Promise<string> {
    safeWriteLog(`[ENCRYPT] Starting Text Encryption, isShareable: ${isShareable}`);

    const { PUBLIC_KEY, RECIPIENT_KEY } = await loadKemKeys();
    const ivLength = getIVLength(method);
    const iv = crypto.randomBytes(ivLength);
    const salt = crypto.randomBytes(16);

    let aesKey: Buffer;
    let kemCiphertext: string | null = null;

    if (!ivLength) throw new Error("Invalid IV length for selected algorithm.");
    if ((isShareable && !RECIPIENT_KEY) || (!isShareable && !PUBLIC_KEY)) throw new Error("PROBLEM WITH KEYS!.");

    if (isShareable) {
        const recipientKeyUint8 = Uint8Array.from(Buffer.from(RECIPIENT_KEY, "base64"));
        const [ciphertext, sharedSecret] = await kem.encap(recipientKeyUint8);
        kemCiphertext = Buffer.from(ciphertext).toString("base64");

        aesKey = generateKey({
            originalKey: Buffer.from(sharedSecret).toString(),
            method,
            salt,
        });
    } else {
        const publicKeyUint8 = Uint8Array.from(Buffer.from(PUBLIC_KEY, "base64"));
        const [ciphertext, sharedSecret] = await kem.encap(publicKeyUint8);
        kemCiphertext = Buffer.from(ciphertext).toString("base64");

        aesKey = generateKey({
            originalKey: Buffer.from(sharedSecret).toString(),
            method,
            salt,
        });
    }

    const key = AesKeySlice(method, aesKey);
    const cipher = crypto.createCipheriv(method, key, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const payload: EncryptedPayload = {
        content: encrypted,
        iv: iv.toString("hex"),
        salt: salt.toString("hex"),
        kemCiphertext,
    };

    // AEAD (GCM, ChaCha, etc.) → capture auth tag
    if (/gcm|chacha/i.test(method)) {
        const tag = (cipher as crypto.CipherGCM).getAuthTag();
        payload.authTag = tag.toString("hex");
    } else {
        const hmacKey = crypto.createHash("sha256").update(key).digest();
        const hmac = crypto.createHmac("sha256", hmacKey);
        hmac.update(iv);
        hmac.update(salt);
        hmac.update(Buffer.from(encrypted, "hex"));
        if (kemCiphertext) hmac.update(kemCiphertext);
        payload.hmac = hmac.digest("hex");
    }

    const packed = Buffer.from(JSON.stringify(payload)).toString("base64");
    safeWriteLog(`[ENCRYPT] Packed payload Base64: ${packed}`);

    return packed;
}