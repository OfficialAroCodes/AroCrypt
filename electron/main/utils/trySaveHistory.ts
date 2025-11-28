import { saveHistory } from "./db/DBService";
import { safeWriteLog } from "./writeLog";

export async function trySaveHistory(
  operation: "dtext" | "dfile" | "etext" | "efile" | "steg-in" | "steg-out",
  status: "success" | "fail" | "canceled",
  inputPath: string,
  outputPath: string,
  algorithm: string,
  startTime: number
) {
  try {
    await saveHistory(operation, inputPath, outputPath, algorithm, {
      duration: Date.now() - startTime,
      status,
    });
  } catch (err) {
    console.error(`Failed to save history [${status}]:`, err);
  }
}
