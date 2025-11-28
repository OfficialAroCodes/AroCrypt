import fs from "fs";
import path from "path";
import crypto from "crypto";
import { AesKeySlice, generateKey, getIVLength } from "../utils/crypto";
import { PNG } from "pngjs";
import { safeWriteLog } from "./writeLog";
import { BrowserWindow, dialog } from "electron";
import { MlKem768 } from "mlkem";
import { loadKemKeys } from "./KeyService";

const kem = new MlKem768();

function packFiles(files: string[]): Buffer {
  safeWriteLog(`[packFiles] Start packing ${files.length} file(s)`);
  const buffers: Buffer[] = [];

  const fileCountBuffer = Buffer.alloc(2);
  fileCountBuffer.writeUInt16BE(files.length, 0);
  buffers.push(fileCountBuffer);

  for (const filePath of files) {
    const data = fs.readFileSync(filePath);
    const filename = path.basename(filePath);
    const nameBuffer = Buffer.from(filename, "utf-8");

    const nameLength = Buffer.alloc(2);
    nameLength.writeUInt16BE(nameBuffer.length, 0);

    const sizeBuffer = Buffer.alloc(4);
    sizeBuffer.writeUInt32BE(data.length, 0);

    buffers.push(nameLength, nameBuffer, sizeBuffer, data);
  }

  const result = Buffer.concat(buffers);
  safeWriteLog(`[packFiles] Final packed buffer size: ${result.length}`);
  return result;
}

export async function embedDataInImage(
  imagePath: string,
  payloadBuffer: Buffer,
  outputPath: string
): Promise<void> {
  safeWriteLog("[embedDataInImage] Embedding data into image...");
  return new Promise((resolve, reject) => {
    fs.createReadStream(imagePath)
      .pipe(new PNG())
      .on("parsed", function () {
        const bitArray: number[] = [];
        for (let byte of payloadBuffer) {
          for (let i = 7; i >= 0; i--) {
            bitArray.push((byte >> i) & 1);
          }
        }

        safeWriteLog(
          `[embedDataInImage] Image size: ${(this.width, "x", this.height)}`
        );
        safeWriteLog(
          `[embedDataInImage] Payload size (bytes): ${payloadBuffer.length}`
        );
        safeWriteLog(
          `[embedDataInImage] Payload size (bits): ${bitArray.length}`
        );
        safeWriteLog(
          `[embedDataInImage] PNG raw buffer size: ${this.data.length}`
        );

        if (bitArray.length > this.data.length) {
          return reject("payload_too_large");
        }

        for (let i = 0; i < bitArray.length; i++) {
          this.data[i] = (this.data[i] & 0b11111110) | bitArray[i];
        }

        this.pack()
          .pipe(fs.createWriteStream(outputPath))
          .on("finish", () => {
            safeWriteLog(
              "[embedDataInImage] Embedding completed successfully"
            );
            resolve();
          });
      })
      .on("error", (err) => {
        console.error("[embedDataInImage] PNG parsing error:", err);
        reject(err);
      });
  });
}

async function canEmbedDataInImage(imagePath: string, payloadBytes: number): Promise<boolean> {
  return new Promise((resolve, reject) => {
    fs.createReadStream(imagePath)
      .pipe(new PNG())
      .on("parsed", function () {
        const requiredBits = payloadBytes * 8;
        const availableBits = this.data.length;

        safeWriteLog(`[canEmbedDataInImage] Required bits: ${requiredBits}`);
        safeWriteLog(`[canEmbedDataInImage] Available bits: ${availableBits}`);

        resolve(requiredBits <= availableBits);
      })
      .on("error", (err) => {
        console.error("[canEmbedDataInImage] PNG parsing error:", err);
        reject(err);
      });
  });
}

export default async function hideDataInImage(
  win: BrowserWindow,
  imagePath: string,
  secretFilesPaths: string[],
  method: string,
  isShareable: boolean
): Promise<{ outputPath: string; response: string }> {
  try {
    safeWriteLog("[hideDataInImage] Start");
    safeWriteLog(`[hideDataInImage] Files: ${secretFilesPaths}`);
    safeWriteLog(`[hideDataInImage] Method: ${method}`);

    const { PUBLIC_KEY, RECIPIENT_KEY } = await loadKemKeys();
    const ivLength = getIVLength(method);
    if (!ivLength) throw new Error("Invalid IV length for selected algorithm.");
    const iv = crypto.randomBytes(ivLength);
    const salt = crypto.randomBytes(16);

    let aesKey: Buffer;
    let kemCiphertext: string | null = null;

    if ((isShareable && !RECIPIENT_KEY) || (!isShareable && !PUBLIC_KEY)) {
      throw new Error("PROBLEM WITH KEYS!");
    }

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

    const packedData = packFiles(secretFilesPaths);
    let encrypted = cipher.update(packedData);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    const payload: any = {
      content: encrypted.toString("hex"),
      iv: iv.toString("hex"),
      salt: salt.toString("hex"),
      kemCiphertext,
    };

    if (/gcm|chacha/i.test(method)) {
      payload.authTag = (cipher as crypto.CipherGCM).getAuthTag().toString("hex");
    } else {
      const hmacKey = crypto.createHash("sha256").update(key).digest();
      const hmac = crypto.createHmac("sha256", hmacKey);
      hmac.update(iv);
      hmac.update(salt);
      hmac.update(encrypted);
      if (kemCiphertext) hmac.update(kemCiphertext);
      payload.hmac = hmac.digest("hex");
    }

    const finalPayload = Buffer.from(JSON.stringify(payload)).toString("base64");

    const canFit = await canEmbedDataInImage(imagePath, Buffer.byteLength(finalPayload));
    if (!canFit) {
      safeWriteLog("[EMBED] Payload too large. (/skipping save dialog/)");
      return { outputPath: "", response: "payload_too_large" };
    }

    const originalFilename = path.basename(imagePath);
    const { canceled, filePath: finalOutputPath } = await dialog.showSaveDialog(win, {
      title: "Save Stego Image",
      defaultPath: originalFilename,
      filters: [{ name: "Images", extensions: ["png"] }],
    });

    if (canceled || !finalOutputPath) return { outputPath: "", response: "canceled" };

    await embedDataInImage(imagePath, Buffer.from(finalPayload), finalOutputPath);

    safeWriteLog("[EMBED] All done!");
    return { outputPath: finalOutputPath, response: "OK" };
  } catch (error) {
    console.error("[EMBED] Error:", error);
    throw error;
  }
}
