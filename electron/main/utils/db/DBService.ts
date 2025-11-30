// DBManager.ts
import path from "path";
import fs from "fs-extra";
import { app, dialog } from "electron";
import { v4 as uuidv4 } from "uuid";
import keytar from "keytar";
import crypto from "crypto";
import pkg from "@journeyapps/sqlcipher";
import { safeWriteLog } from "../writeLog";
const { Database } = pkg;

export const dbPath = path.join(app.getPath("userData"), "database.db");
const KEY_SERVICE = "AroCrypt";
const KEY_ACCOUNT = "local";

let db: any = null;
let initPromise: Promise<void> | null = null;

// ---------- Public API ----------

export function ensureDBReady() {
  if (!initPromise) initPromise = initDB();
  return initPromise;
}

export async function resetDatabaseManually() {
  const res = await dialog.showMessageBox({
    type: "warning",
    title: "Reset Database",
    message:
      "This will delete your encrypted database and remove the encryption key. A backup of the old database will be created first. Continue?",
    buttons: ["Reset Database", "Cancel"],
    defaultId: 0,
    cancelId: 1,
  });

  if (res.response !== 0) {
    safeWriteLog("[DB] Manual reset cancelled by user.");
    return;
  }

  safeWriteLog("[DB] Manual reset confirmed by user.");
  await performResetAndReinit();
}

// Minimal helpers exposed
export async function saveKEMKeyToDB(secret: string, pub: string, recipient: string) {
  await ensureDBReady();
  await run(`INSERT OR REPLACE INTO kem_keys (id, secret, public, recipient) VALUES (0, ?, ?, ?)`, secret, pub, recipient);
}
export async function getKeys() {
  await ensureDBReady();
  return all(`SELECT * FROM kem_keys`);
}
export async function saveHistory(table: string, columns: string[], values: any[]) {
  await ensureDBReady();
  const id = uuidv4();
  const timestamp = Date.now();
  const cols = ["id", "timestamp", ...columns];
  const vals = [id, timestamp, ...values];
  const placeholders = cols.map(() => "?").join(",");
  return run(`INSERT INTO ${table} (${cols.join(",")}) VALUES (${placeholders})`, ...vals);
}
export async function getLogs(table: string) {
  await ensureDBReady();
  return all(`SELECT * FROM ${table} ORDER BY timestamp DESC`);
}
export async function deleteLogById(table: string, id: string) {
  await ensureDBReady();
  return run(`DELETE FROM ${table} WHERE id = ?`, id);
}
export async function deleteAllLogs(table: string) {
  await ensureDBReady();
  return run(`DELETE FROM ${table}`);
}
export async function nukeAllTables() {
  await ensureDBReady();
  const names: string[] = [];
  await new Promise<void>((resolve, reject) => {
    db.each(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != 'kem_keys'",
      (err: any, row: { name: string }) => {
        if (err) reject(err);
        else names.push(row.name);
      },
      (err: any) => (err ? reject(err) : resolve())
    );
  });
  for (const name of names) await run(`DELETE FROM ${name}`);
}

// ---------- Internal implementation ----------

async function initDB() {
  try {
    fs.mkdirpSync(path.dirname(dbPath));
  } catch (err: any) {
    safeWriteLog(`[DB INIT] mkdir error: ${err}`);
    throw err;
  }

  // get key (does not auto-reset on invalid key; only when key missing)
  let key = await keytar.getPassword(KEY_SERVICE, KEY_ACCOUNT);

  if (!key) {
    // Key missing -> backup existing DB and create new key
    if (fs.existsSync(dbPath)) {
      const backup = `${dbPath}.backup-${Date.now()}`;
      try {
        fs.moveSync(dbPath, backup);
        safeWriteLog(`[DB RESET] Key missing. Backed up DB to: ${backup}`);
      } catch (err: any) {
        safeWriteLog(`[DB BACKUP ERROR] ${err}`);
      }
    }
    key = crypto.randomBytes(32).toString("hex");
    await keytar.setPassword(KEY_SERVICE, KEY_ACCOUNT, key);
    safeWriteLog("[DB] Generated new SQLCipher key because it was missing.");
  }

  // attempt to open and validate
  try {
    db = await openDatabaseAndPrepare(key);
    safeWriteLog("[DB] Opened and validated database successfully.");
  } catch (err: any) {
    safeWriteLog(`[DB] Validation error: ${err}`);

    // Show dialog to user offering Reset Database or Cancel
    const answer = await dialog.showMessageBox({
      type: "error",
      title: "Database Access Issue",
      message:
        "We couldn't open your encrypted database with the current key. This can happen if the encryption key was removed or the file is corrupted.\n\nClick Reset Database to back up and recreate the database, or Cancel to keep files unchanged.",
      buttons: ["Reset Database", "Cancel"],
      defaultId: 0,
      cancelId: 1,
    });

    if (answer.response === 0) {
      safeWriteLog("[DB] User chose to reset the database after validation failure.");
      await performResetAndReinit();
    } else {
      safeWriteLog("[DB] User cancelled reset after validation failure. Throwing.");
      throw new Error("Database validation failed and user cancelled reset.");
    }
  }

  // (db is open and configured). Ensure schema exists.
  try {
    await createSchema();
    safeWriteLog("[DB] Schema ensured.");
  } catch (err: any) {
    safeWriteLog(`[DB] createSchema error: ${err}`);
    throw err;
  }
}

async function openDatabaseAndPrepare(key: string) {
  // if file doesnt exist, It will created auto
  const instance = new Database(dbPath);

  // Apply key first
  instance.run(`PRAGMA key = '${key}';`);

  try {
    // Use prepare().get() to run pragma synchronously and get return value
    instance.prepare("PRAGMA journal_mode=WAL;").get();
    safeWriteLog("[DB] journal_mode set to WAL.");
  } catch (err: any) {
    safeWriteLog(`[DB] Failed to set WAL: ${err}`);
  }

  // Hard validation...
  try {
    instance.prepare("SELECT count(*) FROM sqlite_master;").get();
  } catch (err: any) {
    // close instance if possible and rethrow
    try { instance.close && instance.close(); } catch {}
    throw err;
  }

  // Additional safe pragmas
  try {
    instance.run("PRAGMA cipher_memory_security = ON;");
  } catch (err: any) {
    safeWriteLog(`[DB] cipher_memory_security pragma failed: ${err}`);
  }

  return instance;
}

async function performResetAndReinit() {
  try {
    if (fs.existsSync(dbPath)) {
      const backup = `${dbPath}.backup-${Date.now()}`;
      fs.moveSync(dbPath, backup);
      safeWriteLog(`[DB RESET] Backed up DB to: ${backup}`);
    }
  } catch (err: any) {
    safeWriteLog(`[DB RESET] Backup error: ${err}`);
  }

  try {
    await keytar.deletePassword(KEY_SERVICE, KEY_ACCOUNT);
  } catch (err: any) {
    safeWriteLog(`[DB RESET] keytar delete error: ${err}`);
  }

  try {
    try { fs.unlinkSync(dbPath); } catch {}
  } catch (err: any) {
    safeWriteLog(`[DB RESET] unlink error: ${err}`);
  }

  // Reset in-memory state so ensureDBReady will recreate
  db = null;
  initPromise = null;

  // Reinitialize (generates a new key inside init)
  await ensureDBReady();
}

// ---------- Schema ----------

async function createSchema() {
  // schema statements should be executed after WAL is set
  // they run inside a transaction but WAL must already be configured
  await exec(`
    CREATE TABLE IF NOT EXISTS etext_logs (
      id TEXT PRIMARY KEY, timestamp INTEGER, algorithm TEXT, status TEXT, duration INTEGER
    );

    CREATE TABLE IF NOT EXISTS dtext_logs (
      id TEXT PRIMARY KEY, timestamp INTEGER, algorithm TEXT, status TEXT, duration INTEGER
    );

    CREATE TABLE IF NOT EXISTS efile_logs (
      id TEXT PRIMARY KEY, timestamp INTEGER, input_path TEXT, output_path TEXT,
      input_size INTEGER, output_size INTEGER, algorithm TEXT, status TEXT, duration INTEGER
    );

    CREATE TABLE IF NOT EXISTS dfile_logs (
      id TEXT PRIMARY KEY, timestamp INTEGER, input_path TEXT, output_path TEXT,
      input_size INTEGER, output_size INTEGER, algorithm TEXT, status TEXT, duration INTEGER
    );

    CREATE TABLE IF NOT EXISTS steg_in_logs (
      id TEXT PRIMARY KEY, timestamp INTEGER, input_path TEXT, output_path TEXT,
      input_size INTEGER, output_size INTEGER, algorithm TEXT, status TEXT, duration INTEGER
    );

    CREATE TABLE IF NOT EXISTS steg_out_logs (
      id TEXT PRIMARY KEY, timestamp INTEGER, input_path TEXT, output_path TEXT,
      input_size INTEGER, output_size INTEGER, algorithm TEXT, status TEXT, duration INTEGER
    );

    CREATE TABLE IF NOT EXISTS kem_keys (
      id INTEGER PRIMARY KEY, secret TEXT, public TEXT, recipient TEXT
    );
  `);
}

// ---------- small helpers to promisify database operations ----------

function run(sql: string, ...params: any[]) {
  return new Promise<void>((resolve, reject) => {
    try {
      db.run(sql, params, function (err: any) {
        if (err) return reject(err);
        resolve();
      });
    } catch (err) {
      reject(err);
    }
  });
}

function all(sql: string, ...params: any[]) {
  return new Promise<any[]>((resolve, reject) => {
    try {
      db.all(sql, params, (err: any, rows: any[]) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    } catch (err) {
      reject(err);
    }
  });
}

function exec(sql: string) {
  return new Promise<void>((resolve, reject) => {
    try {
      db.exec(sql, (err: any) => {
        if (err) return reject(err);
        resolve();
      });
    } catch (err) {
      reject(err);
    }
  });
}

export default {
  ensureDBReady,
  resetDatabaseManually,
  saveKEMKeyToDB,
  getKeys,
  saveHistory,
  getLogs,
  deleteLogById,
  nukeAllTables,
  dbPath,
};