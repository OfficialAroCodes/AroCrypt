import { generateKey, getIVLength } from "./crypto";
import crypto from "crypto";
import getKey from "./KeyService";

let PRIVATE_KEY: string | null = null;

async function initializeUniqueKey() {
    PRIVATE_KEY = await getKey();
}

export async function encrypt(text: string, method: string) {
    console.log("[ENCRYPT] Starting encryption");

    await initializeUniqueKey();
    if (!PRIVATE_KEY) {
        console.error("[ENCRYPT] PRIVATE_KEY is null");
        throw new Error("No unique key found for encryption");
    }
    console.log("[ENCRYPT] PRIVATE_KEY loaded");

    const ivLength = getIVLength(method);
    const ivBuffer = crypto.randomBytes(ivLength);
    const salt = crypto.randomBytes(16);

    const keyBuffer = generateKey({
        originalKey: PRIVATE_KEY,
        method,
        salt,
    });

    console.log("[ENCRYPT] IV:", ivBuffer.toString("hex"));
    console.log("[ENCRYPT] Salt:", salt.toString("hex"));
    console.log("[ENCRYPT] Key buffer (hex):", keyBuffer.toString("hex"));

    let cipher;
    switch (method) {
        case "aes-256-cbc":
            cipher = crypto.createCipheriv(method, keyBuffer, ivBuffer);
            break;
        case "aes-192-cbc":
            cipher = crypto.createCipheriv(method, keyBuffer.slice(0, 24), ivBuffer);
            break;
        case "aes-128-cbc":
            cipher = crypto.createCipheriv(method, keyBuffer.slice(0, 16), ivBuffer);
            break;
        default:
            throw new Error("Unsupported encryption method");
    }

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const encryptedBuffer = Buffer.from(encrypted, "hex");

    // HMAC key derived by hashing the encryption key for separation
    const hmacKey = crypto.createHash("sha256").update(keyBuffer).digest();
    const hmac = crypto.createHmac("sha256", hmacKey);
    // HMAC over IV + salt + encrypted data
    hmac.update(ivBuffer);
    hmac.update(salt);
    hmac.update(encryptedBuffer);
    const hmacDigest = hmac.digest("hex");

    console.log("[ENCRYPT] Encrypted content (hex):", encrypted);
    console.log("[ENCRYPT] HMAC:", hmacDigest);

    // Pack everything as JSON and base64 encode
    const payload = {
        content: encrypted,
        iv: ivBuffer.toString("hex"),
        salt: salt.toString("hex"),
        hmac: hmacDigest,
        note: "This data only contains public encryption metadata (Encrypted Content, IV, salt, HMAC). It's safe to share. Decryption requires your private key.",
    };

    const packed = Buffer.from(JSON.stringify(payload)).toString("base64");
    console.log("[ENCRYPT] Packed output:", packed);
    console.log("-----------------------------------------------");

    return packed;
}