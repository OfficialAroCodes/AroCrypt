import path from "path";
import { app } from "electron";
import { v4 as uuidv4 } from "uuid";
import fs from "fs-extra";
import pkg from '@journeyapps/sqlcipher';
const { Database } = pkg;
import keytar from 'keytar';
import crypto from 'crypto';
import { safeWriteLog } from "../writeLog";

let db: any | null = null;

async function getDbKey(): Promise<string> {
  let key = await keytar.getPassword("AroCrypt", "local");
  if (!key) {
    key = crypto.randomBytes(32).toString("hex");
    await keytar.setPassword("AroCrypt", "local", key);
  }
  return key;
}

export const dbPath = path.join(app.getPath("userData"), "database.db");

export async function initHistoryDB() {
  let key: string;

  try {
    key = await getDbKey();
  } catch (err: any) {
    return safeWriteLog(`[DB ERROR]: ${err}`);
  }

  try {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    
    db = new Database(dbPath);
    db.run(`PRAGMA key = '${key}';`);
    db.run("PRAGMA cipher_memory_security = ON;");
    db.run("PRAGMA journal_mode = WAL;");

    await db.exec(`
      CREATE TABLE IF NOT EXISTS etext_logs (
        id TEXT PRIMARY KEY,
        timestamp INTEGER,
        algorithm STRING,
        status TEXT,
        duration INTEGER
      );
      
      CREATE TABLE IF NOT EXISTS dtext_logs (
        id TEXT PRIMARY KEY,
        timestamp INTEGER,
        algorithm TEXT,
        status TEXT,
        duration INTEGER
      );

      CREATE TABLE IF NOT EXISTS efile_logs (
        id TEXT PRIMARY KEY,
        timestamp INTEGER,
        input_path TEXT,
        output_path TEXT,
        input_size INTEGER,
        output_size INTEGER,
        algorithm TEXT,
        status TEXT,
        duration INTEGER
      );

      CREATE TABLE IF NOT EXISTS dfile_logs (
        id TEXT PRIMARY KEY,
        timestamp INTEGER,
        input_path TEXT,
        output_path TEXT,
        input_size INTEGER,
        output_size INTEGER,
        algorithm TEXT,
        status TEXT,
        duration INTEGER
      );
  
      CREATE TABLE IF NOT EXISTS steg_in_logs (
        id TEXT PRIMARY KEY,
        timestamp INTEGER,
        input_path TEXT,
        output_path TEXT,
        input_size INTEGER,
        output_size INTEGER,
        algorithm TEXT,
        status TEXT,
        duration INTEGER
      );

    CREATE TABLE IF NOT EXISTS steg_out_logs (
        id TEXT PRIMARY KEY,
        timestamp INTEGER,
        input_path TEXT,
        output_path TEXT,
        input_size INTEGER,
        output_size INTEGER,
        algorithm TEXT,
        status TEXT,
        duration INTEGER
      );

    CREATE TABLE IF NOT EXISTS kem_keys (
        id TEXT PRIMARY KEY,
        secret TEXT,
        public TEXT,
        recipient TEXT
      );
    `);
  } catch (err: any) {
    safeWriteLog(`[SQLITE ERROR]: ${err}`);
    db = null;
  }
}

function runAsync(db: any, sql: string, ...params: any[]) {
  return new Promise<void>((resolve, reject) => {
    db.run(sql, params, function (err: any) {
      if (err) return reject(err);
      resolve();
    });
  });
}

export async function saveKEMKeyToDB(
  secret_key: string,
  public_key: string,
  recipient_key: string
) {
  if (!db) await initHistoryDB();
  await nukeAllTables();

  await runAsync(
    db,
    `INSERT OR REPLACE INTO kem_keys (id, secret, public, recipient) VALUES (?, ?, ?, ?)`,
    0, secret_key, public_key, recipient_key
  );
}

type HistoryMeta = {
  duration?: number;
  status?: string;
  payloadPath?: string;
  stegType?: string;
};

export async function saveHistory(
  operation: "dtext" | "dfile" | "etext" | "efile" | "steg-in" | "steg-out",
  inputPath: string,
  outputPath: string,
  algorithm: string,
  meta: HistoryMeta = {}
) {
  if (!db) await initHistoryDB();

  const timestamp = Date.now();
  const id = uuidv4();
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

  const duration = meta.duration ?? 0;
  const status = meta.status ?? "success";

  if (operation === "etext") {
    await db.run(
      `INSERT INTO etext_logs (id, timestamp, algorithm, status, duration)
            VALUES (?, ?, ?, ?, ?)`,
      id,
      timestamp,
      algorithm,
      status,
      duration
    );
  } else if (operation === "dtext") {
    await db.run(
      `INSERT INTO dtext_logs (id, timestamp, algorithm, status, duration)
            VALUES (?, ?, ?, ?, ?)`,
      id,
      timestamp,
      algorithm,
      status,
      duration
    );
  } else if (operation === "efile") {
    await db.run(
      `INSERT INTO efile_logs (id, timestamp, input_path, output_path, input_size, output_size, algorithm, status, duration)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      timestamp,
      inputPath,
      outputPath,
      inputStats.size,
      outputStats.size,
      algorithm,
      status,
      duration
    );
  } else if (operation === "dfile") {
    await db.run(
      `INSERT INTO dfile_logs (id, timestamp, input_path, output_path, input_size, output_size, algorithm, status, duration)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      timestamp,
      inputPath,
      outputPath,
      inputStats.size,
      outputStats.size,
      algorithm,
      status,
      duration
    );
  } else if (operation === "steg-in") {
    await db.run(
      `INSERT INTO steg_in_logs (id, timestamp, input_path, output_path, input_size, output_size, algorithm, status, duration)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      timestamp,
      inputPath,
      outputPath,
      inputStats.size,
      outputStats.size,
      algorithm,
      status,
      duration
    );
  } else if (operation === "steg-out") {
    await db.run(
      `INSERT INTO steg_out_logs (id, timestamp, input_path, output_path, input_size, output_size, algorithm, status, duration)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      timestamp,
      inputPath,
      outputPath,
      inputStats.size,
      outputStats.size,
      algorithm,
      status,
      duration
    );
  } else {
    throw new Error(`Unknown operation type: ${operation}`);
  }
}

export async function getLogs(table: string) {
  if (!db) await initHistoryDB();

  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM ${table} ORDER BY timestamp DESC`, (err: any, rows: any[]) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

type KEMKey = {
  id: string;
  public: string;
  secret: string;
  recipient: string;
};

export async function getKeys(): Promise<KEMKey[]> {
  if (!db) await initHistoryDB();

  const rows: KEMKey[] = await new Promise((resolve, reject) => {
    db.all(`SELECT * FROM kem_keys`, (err: any, result: KEMKey[]) => {
      if (err) return reject(err);
      resolve(result || []);
    });
  });
  return rows;
}

export async function deleteLogById(table: string, id: string) {
  if (!db) await initHistoryDB();
  return await runAsync(
    db,
    `DELETE FROM ${table} WHERE id = ?`,
    id
  );
}

export async function deleteAllLogs(table: string) {
  if (!db) await initHistoryDB();
  return await db.run(`DELETE FROM ${table}`);
}

export async function nukeAllTables() {
  if (!db) await initHistoryDB();

  const tables: string[] = [];

  await new Promise<void>((resolve, reject) => {
    db.each(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != 'kem_keys'",
      (err: Error | null, row: { name: string }) => {
        if (err) {
          reject(err);
        } else {
          tables.push(row.name);
        }
      },
      (err: Error | null) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });

  for (const tableName of tables) {
    await db.run(`DELETE FROM ${tableName}`);
  }
}