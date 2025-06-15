import { generateKey } from "./crypto";
import getKey from "./KeyService";
import crypto from "crypto";

let PRIVATE_KEY: string | null = null;

async function initializeUniqueKey() {
    PRIVATE_KEY = await getKey();
}

export async function decrypt(params: {
    packedKeys: string;
    method: string;
}) {
    console.log("[DECRYPT] Starting decryption with packed keys");
    console.log("[DECRYPT] packedKeys:" + params.packedKeys);
    console.log("[DECRYPT] method: " + params.method);

    await initializeUniqueKey();

    if (!PRIVATE_KEY) {
        console.error("[DECRYPT] PRIVATE_KEY is null");
        return "invalid";
    }

    try {
        // Decode base64 and parse JSON
        const jsonStr = Buffer.from(params.packedKeys, "base64").toString("utf8");
        const payload = JSON.parse(jsonStr);

        const { content, iv, salt, hmac } = payload;

        console.log("[DECRYPT] Parsed payload:", payload);

        const saltBuffer = Buffer.from(salt, "hex");
        const ivBuffer = Buffer.from(iv, "hex");
        const encryptedBuffer = Buffer.from(content, "hex");

        const keyBuffer = generateKey({
            originalKey: PRIVATE_KEY,
            method: params.method,
            salt: saltBuffer,
        });

        console.log("[DECRYPT] Key buffer (hex):", keyBuffer.toString("hex"));

        // HMAC Verification
        const hmacKey = crypto.createHash("sha256").update(keyBuffer).digest();
        const hmacCheck = crypto.createHmac("sha256", hmacKey);
        hmacCheck.update(ivBuffer);
        hmacCheck.update(saltBuffer);
        hmacCheck.update(encryptedBuffer);
        const recalculatedHmac = hmacCheck.digest("hex");

        console.log("[DECRYPT] Recalculated HMAC:", recalculatedHmac);

        if (recalculatedHmac !== hmac) {
            console.error("[DECRYPT] HMAC mismatch! 🔥");
            console.log("-----------------------------------------------");
            return "invalid";
        }

        let decipher;
        switch (params.method) {
            case "aes-256-cbc":
                decipher = crypto.createDecipheriv(params.method, keyBuffer, ivBuffer);
                break;
            case "aes-192-cbc":
                decipher = crypto.createDecipheriv(params.method, keyBuffer.slice(0, 24), ivBuffer);
                break;
            case "aes-128-cbc":
                decipher = crypto.createDecipheriv(params.method, keyBuffer.slice(0, 16), ivBuffer);
                break;
            default:
                console.error("[DECRYPT] Unsupported method");
                return "invalid";
        }

        let decrypted = decipher.update(content, "hex", "utf8");
        decrypted += decipher.final("utf8");

        console.log("[DECRYPT] Final decrypted text:", decrypted);

        return decrypted;
    } catch (error) {
        console.error("[DECRYPT] Exception occurred:", error);
        return "invalid";
    }
}