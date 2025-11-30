import fs from "fs-extra";
import { saveHistory } from "./db/DBService";
import { safeWriteLog } from "./writeLog";

export async function trySaveHistory(
  operation: "dtext_logs" | "dfile_logs" | "etext_logs" | "efile_logs" | "steg-in_logs" | "steg-out_logs",
  status: "success" | "fail" | "canceled",
  inputPath: string,
  outputPath: string,
  algorithm: string,
  startTime: number
) {
  const duration = Date.now() - startTime;

  let columns: string[] = ["algorithm", "status", "duration"];
  let values: any[] = [algorithm, status, duration];
  let outputStats;
  let inputStats;

  try {
    inputStats = await fs.stat(inputPath);
  } catch (err) {
    inputStats = { input_path: "N\A", outputPath: "N\A", output_size: 0 };
  }

  try {
    outputStats = await fs.stat(outputPath);
  } catch (err) {
    outputStats = { input_path: "N\A", outputPath: "N\A", output_size: 0 };
  }

  if (["efile_logs", "dfile_logs", "steg-in_logs", "steg-out_logs"].includes(operation)) {
    columns = ["input_path", "output_path", "input_size", "output_size", "algorithm", "status", "duration"];
    values = [inputPath, outputPath, inputStats.size, outputStats.size, algorithm, status, duration];
  }

  try {
    await saveHistory(operation, columns, values);
  } catch (err) {
    safeWriteLog(`Failed to save history [${status}]: ${err}`);
  }
}
