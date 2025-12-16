import "dotenv/config";
import {
  app,
  dialog,
  BrowserWindow,
  ipcMain,
  Menu,
  globalShortcut,
  shell,
} from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import * as os from "os";
import path from "path";
import { safeWriteLog } from "./utils/writeLog";
import { decrypt } from "./utils/decryptText";
import { encrypt } from "./utils/encryptText";
import { encryptFile } from "./utils/encryptFile";
import { validateFileDecryption } from "./utils/validateFileDecryption";
import { decryptFile } from "./utils/decryptFile";
const { autoUpdater } = pkg;
import pkg from "electron-updater";
import hideDataInImage from "./utils/hideDataInImage";
import extractHiddenData from "./utils/extractHiddenData";
import moveExtractedFiles from "./utils/moveExtractedFiles";
import {
  createMlKemKeys,
  saveKEMKey,
} from "./utils/KeyService";
import fs from "node:fs";
import {
  deleteAllLogs,
  deleteLogById,
  getKeys,
  getLogs,
} from "./utils/db/DBService";
import { trySaveHistory } from "./utils/trySaveHistory";

process.on("uncaughtException", (error) => {
  safeWriteLog(`UNCAUGHT EXCEPTION: ${error.message}`);
  safeWriteLog(`STACK TRACE: ${error.stack}`);

  if (error.message.includes("SQLITE_NOTADB") ||
    error.message.includes("database is encrypted") ||
    error.message.includes("Failed to get database key") ||
    error.message.includes("Database initialization failed")) {
    dialog.showErrorBox(
      "Database Access Issue",
      "We couldn't access your database due to an invalid key or corruption. The app will attempt to recover by resetting the database.\n\nIf this problem persists, contact support: app.arocrypt@gmail.com"
    );

    // app.relaunch();
    let quitApp = app.quit();
    return quitApp;
  }

  dialog.showErrorBox("Critical Error", `${error.message}\nThe app will close.\n\nIf this problem persists, contact support: app.arocrypt@gmail.com`);
  app.quit();
});


// Defer autoUpdater configuration
function configureAutoUpdater() {
  try {
    safeWriteLog("Configuring AutoUpdater");

    autoUpdater.forceDevUpdateConfig = true;

    autoUpdater.setFeedURL({
      provider: "github",
      owner: "AroCrypt",
      repo: "app",
    });

    autoUpdater.logger = {
      info: (msg) => safeWriteLog(msg),
      warn: (msg) => safeWriteLog(msg),
      error: (msg) => safeWriteLog(msg),
    };

    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = false;

    //UPDATE HANDLERS
    autoUpdater.on("update-available", (info) => {
      safeWriteLog(`Update available: ${info.version}`);
      win?.webContents.send("update-available", {
        version: info.version,
        releaseNotes: info.releaseNotes || "",
        isUpdateAvailable: true,
      });
    });

    autoUpdater.on("update-not-available", (info) => {
      safeWriteLog("No update available");
      ipcMain.emit("update-not-available", info);
    });

    autoUpdater.on("error", (err) => {
      safeWriteLog(`Update error: ${err.message}`);
      ipcMain.emit("update-error", err);
    });

    autoUpdater.on("download-progress", (progressObj) => {
      safeWriteLog(`Update download progress: ${progressObj.percent}%`);
      win?.webContents.send("update-download-progress", progressObj);
    });

    // IPC handler for checking updates
    // ipcMain.handle("check-for-updates", async () => {
    //   try {
    //     const updateCheckResult = await autoUpdater.checkForUpdates();
    //     if (updateCheckResult) {
    //       return {
    //         version: updateCheckResult.versionInfo.version,
    //         releaseNotes: updateCheckResult.versionInfo.releaseNotes || "",
    //         isUpdateAvailable: true,
    //       };
    //     }
    //   } catch (error) {
    //     safeWriteLog(`Update check error: ${error}`);
    //     return {
    //       version: null,
    //       releaseNotes: "",
    //       isUpdateAvailable: false,
    //     };
    //   }
    // });

    ipcMain.handle("download-update", async () => {
      try {
        await autoUpdater.downloadUpdate();
        autoUpdater.quitAndInstall();
      } catch (error) {
        safeWriteLog(`Update download failed: ${error}`);
        throw error;
      }
    });
  } catch (error) {
    safeWriteLog(`AutoUpdater configuration error: ${error}`);
  }
}

// Call configuration after app is ready
app.whenReady().then(async () => {
  configureAutoUpdater();
});

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "../..");

export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let win: BrowserWindow | null = null;
const preload = path.join(__dirname, "../preload/index.mjs");
const indexHtml = path.join(RENDERER_DIST, "index.html");

const isProduction =
  process.env.NODE_ENV === "production" || !VITE_DEV_SERVER_URL;

function createWindow() {
  win = new BrowserWindow({
    title: "AroCrypt",
    width: 1200,
    minWidth: 1100,
    height: 700,
    minHeight: 670,
    frame: false,
    fullscreen: false,
    resizable: true,
    icon: path.join("./assets/images/app-icons/png/64x64.png"),
    webPreferences: {
      preload,
      contextIsolation: true,
      nodeIntegration: false,
      devTools: !isProduction,
    },
  });

  win.setFullScreen(false);
  win.setFullScreenable(false);

  if (isProduction) {
    globalShortcut.register("CommandOrControl+R", () => {
      return false;
    });

    globalShortcut.register("CommandOrControl+Shift+R", () => {
      return false;
    });

    globalShortcut.register("CommandOrControl+Shift+C", () => {
      return false;
    });

    globalShortcut.register("Tab", () => {
      return false;
    });
  }

  if (!isProduction) {
    globalShortcut.register("CommandOrControl+Shift+D", () => {
      win?.webContents.toggleDevTools();
    });
  }

  /* Context Menu */

  function buildContextMenu(event: any, params: any) {
    if (params.isEditable) {
      const menu = Menu.buildFromTemplate([
        { label: "Copy", role: "copy" },
        { label: "Paste", role: "paste" },
        { label: "Delete", role: "delete" },
      ]);

      if (win) {
        menu.popup({ window: win });
        event.preventDefault();
      }
    }
  }

  win.webContents.on("context-menu", buildContextMenu);

  win.on("maximize", () => {
    win!.webContents.send("window-maximize", true);
  });

  win.on("unmaximize", () => {
    win!.webContents.send("window-maximize", false);
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(indexHtml);
  }

  win.webContents.on("did-finish-load", () => {
    let pendingFilesToDecrypt: string[] = [];
    let pendingFilesToEncrypt: string[] = [];

    safeWriteLog("did-finish-load fired");

    const args = process.argv.slice(1);

    const filesToDecrypt = [];
    const filesToEncrypt = [];

    for (let i = 0; i < args.length; i++) {
      if (args[i] === "--decrypt" && i + 1 < args.length) {
        filesToDecrypt.push(args[i + 1]);
        i++;
      } else if (args[i] === "--encrypt" && i + 1 < args.length) {
        filesToEncrypt.push(args[i + 1]);
        i++;
      }
    }

    safeWriteLog(`process.argv: ${process.argv}`);

    if (filesToDecrypt.length > 0) {
      pendingFilesToDecrypt = filesToDecrypt;
      win?.webContents.send("files-to-decrypt", pendingFilesToDecrypt);
      safeWriteLog(
        `Sent files-to-decrypt in did-finish-load: ${pendingFilesToDecrypt}`
      );
    }

    if (filesToEncrypt.length > 0) {
      pendingFilesToEncrypt = filesToEncrypt;
      win?.webContents.send("files-to-encrypt", pendingFilesToEncrypt);
      safeWriteLog(
        `Sent files-to-encrypt in did-finish-load: ${pendingFilesToEncrypt}`
      );
    }
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", (event, argv, workingDirectory) => {
  let pendingFilesToDecrypt: string[] = [];
  let pendingFilesToEncrypt: string[] = [];

  safeWriteLog("second-instance fired");
  safeWriteLog(`argv: ${argv}`);

  const checkAlgorithm = (args: string[]): { filesToDecrypt: string[]; filesToEncrypt: string[] } => {
    const filesToDecrypt: string[] = [];
    const filesToEncrypt: string[] = [];

    let currentMode: 'decrypt' | 'encrypt' | null = null;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      // Skip executable paths
      if (arg.includes('AroCrypt.exe') || arg.includes('electron.exe')) {
        continue;
      }

      if (arg === "--decrypt") {
        currentMode = 'decrypt';
      } else if (arg === "--encrypt") {
        currentMode = 'encrypt';
      } else if (!arg.startsWith('--') && arg.length > 0) {
        // This is a file path
        if (currentMode === 'decrypt') {
          filesToDecrypt.push(arg);
        } else if (currentMode === 'encrypt') {
          filesToEncrypt.push(arg);
        } else {
          // If no flag is specified, treat as encrypt by default (backward compatibility)
          filesToEncrypt.push(arg);
        }
        // Reset mode after processing a file
        currentMode = null;
      }
    }

    return { filesToDecrypt, filesToEncrypt };
  };

  const { filesToDecrypt, filesToEncrypt } = checkAlgorithm(argv);

  if (filesToDecrypt.length > 0 && win) {
    safeWriteLog(
      `Queueing files-to-decrypt (second-instance): ${filesToDecrypt}`
    );

    pendingFilesToDecrypt = filesToDecrypt;

    if (win.webContents.isLoading()) {
      win.webContents.once("did-finish-load", () => {
        win?.webContents.send("files-to-decrypt", pendingFilesToDecrypt);
      });
    } else {
      win.webContents.send("files-to-decrypt", pendingFilesToDecrypt);
    }

    if (win.isMinimized()) win.restore();
    win.focus();
  }

  if (filesToEncrypt.length > 0 && win) {
    safeWriteLog(
      `Queueing files-to-encrypt (second-instance): ${filesToEncrypt}`
    );

    pendingFilesToEncrypt = filesToEncrypt;

    if (win.webContents.isLoading()) {
      win.webContents.once("did-finish-load", () => {
        win?.webContents.send("files-to-encrypt", pendingFilesToEncrypt);
      });
    } else {
      win.webContents.send("files-to-encrypt", pendingFilesToEncrypt);
    }

    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

/* AroCrypt */

ipcMain.handle("decrypt", async (event, { packedKeys, method, isSaveHistory }) => {
  try {
    const startTime = Date.now();

    const decrypted = await decrypt(packedKeys, method);

    if (decrypted !== "invalid") {
      if (isSaveHistory) {
        await trySaveHistory(
          "dtext_logs",
          "success",
          "",
          "",
          method,
          startTime
        );
      }
    } else {
      if (isSaveHistory) {
        await trySaveHistory(
          "dtext_logs",
          "fail",
          "",
          "",
          method,
          startTime
        );
      }
    }



    return decrypted;
  } catch (error) {
    safeWriteLog(`Decryption error: ${error}`);
    return "invalid";
  }
});

ipcMain.handle("encrypt", async (event, { text, method, isSaveHistory, isShareable }) => {
  try {
    const startTime = Date.now();

    const result = await encrypt(text, method, isShareable);

    if (isSaveHistory) {
      await trySaveHistory(
        "etext_logs",
        "success",
        "",
        "",
        method,
        startTime
      );
    }
    return result;
  } catch (error) {
    safeWriteLog(`Encryption error: ${error}`);
    throw error;
  }
});

// IPC Handlers for File Logic Functions

ipcMain.handle(
  "encrypt-file",
  async (
    _event,
    filesPath: string[],
    method: string,
    isDeleteSource: boolean,
    isSaveHistory: boolean,
    isSingleOutput: boolean,
    isShareable: boolean
  ) => {
    const startTime = Date.now();
    const results: Array<{ inputPath: string; output: string }> = [];

    if (!win) throw new Error("Main window not available");

    let outputFolder: string | null = null;
    if (isSingleOutput) {
      const { canceled, filePaths } = await dialog.showOpenDialog(win, {
        title: "Select Folder to Save Encrypted Files",
        properties: ["openDirectory"],
      });
      if (canceled || !filePaths.length) {
        if (isSaveHistory)
          await trySaveHistory("efile_logs", "canceled", "", "", method, startTime);
        return [];
      }
      outputFolder = filePaths[0];
    }

    for (const filePath of filesPath) {
      let finalOutputPath: string;
      if (isSingleOutput && outputFolder) {
        finalOutputPath = path.join(
          outputFolder,
          `${path.basename(filePath)}.arocrypt`
        );
      } else {
        const encryptedFilename = `${path.basename(filePath)}.arocrypt`;
        const { canceled, filePath: savePath } = await dialog.showSaveDialog(
          win,
          {
            title: "Save Encrypted File",
            defaultPath: encryptedFilename,
            filters: [{ name: "Encrypted File", extensions: ["arocrypt"] }],
          }
        );
        if (canceled || !savePath) {
          if (isSaveHistory)
            await trySaveHistory(
              "efile_logs",
              "canceled",
              filePath,
              "",
              method,
              startTime
            );
          results.push({ inputPath: filePath, output: "canceled" });
          continue;
        }
        finalOutputPath = savePath;
      }

      try {
        const encryptedPath = await encryptFile(
          filePath,
          method,
          finalOutputPath,
          isShareable
        );
        if (isSaveHistory)
          await trySaveHistory(
            "efile_logs",
            "success",
            filePath,
            encryptedPath,
            method,
            startTime
          );
        if (isDeleteSource) {
          try {
            await fs.promises.unlink(filePath);
          } catch (err) {
            console.error(`Failed to delete source file: ${filePath}`, err);
          }
        }
        results.push({ inputPath: filePath, output: encryptedPath });
      } catch (err) {
        console.error("Encryption failed:", err);
        if (isSaveHistory)
          await trySaveHistory(
            "efile_logs",
            "canceled",
            filePath,
            finalOutputPath,
            method,
            startTime
          );
        results.push({ inputPath: filePath, output: "unknown_fail" });
      }
    }

    return results;
  }
);

ipcMain.handle(
  "decrypt-file",
  async (
    _event,
    filesPath: string[],
    method: string,
    isDeleteSource: boolean,
    isSaveHistory: boolean,
    isSingleOutput: boolean
  ) => {
    const startTime = Date.now();
    const results: Array<{ inputPath: string; output: string }> = [];

    if (!win) throw new Error("Main window not available");

    let outputFolder: string | null = null;

    if (isSingleOutput) {
      const { canceled, filePaths } = await dialog.showOpenDialog(win, {
        title: "Select Folder to Save Decrypted Files",
        properties: ["openDirectory"],
      });

      if (canceled || filePaths.length === 0) {
        if (isSaveHistory) {
          await trySaveHistory("dfile_logs", "canceled", "N/A", "N/A", method, startTime);
        }
        return [];
      }

      outputFolder = filePaths[0];
    }

    for (const filePath of filesPath) {
      if (!filePath.endsWith(".arocrypt")) {
        results.push({ inputPath: filePath, output: "invalid_file_type" });
        continue;
      }

      try {
        const validate = await validateFileDecryption(
          filePath,
          method
        );

        if (validate === "bad_validate") {
          if (isSaveHistory) {
            await trySaveHistory(
              "dfile_logs",
              "fail",
              filePath,
              filePath,
              method,
              startTime
            );
          }
          results.push({ inputPath: filePath, output: "bad_decrypt" });
          continue;
        }
      } catch {
        if (isSaveHistory) {
          await trySaveHistory(
            "dfile_logs",
            "fail",
            filePath,
            filePath,
            method,
            startTime
          );
        }
        results.push({ inputPath: filePath, output: "bad_decrypt" });
        continue;
      }

      let finalOutputPath: string;

      if (isSingleOutput && outputFolder) {
        const baseName = path.basename(filePath, ".arocrypt");
        finalOutputPath = path.join(outputFolder, baseName);
      } else {
        const { canceled, filePath: savePath } = await dialog.showSaveDialog(
          win,
          {
            title: "Save Decrypted File",
            defaultPath: path.basename(filePath, ".arocrypt"),
            filters: [{ name: "All Files", extensions: ["*"] }],
          }
        );

        if (canceled || !savePath) {
          if (isSaveHistory) {
            await trySaveHistory(
              "dfile_logs",
              "canceled",
              filePath,
              filePath,
              method,
              startTime
            );
          }
          results.push({ inputPath: filePath, output: "decryption_canceled" });
          continue;
        }

        finalOutputPath = savePath;
      }

      try {
        const decryptedPath = await decryptFile(
          filePath,
          method,
          finalOutputPath
        );

        if (decryptedPath === "bad_decrypt") {
          if (isSaveHistory) {
            await trySaveHistory(
              "dfile_logs",
              "fail",
              filePath,
              "",
              method,
              startTime
            );
          }
        } else {
          if (isSaveHistory) {
            await trySaveHistory(
              "dfile_logs",
              "success",
              filePath,
              decryptedPath,
              method,
              startTime
            );
          }
        }

        if (isDeleteSource && decryptedPath !== "bad_decrypt") {
          try {
            await fs.promises.unlink(filePath);
          } catch (err) {
            console.error(`Failed to delete source file: ${filePath}`, err);
          }
        }

        results.push({ inputPath: filePath, output: decryptedPath });
      } catch (err) {
        console.error("Decryption failed:", err);
        if (isSaveHistory) {
          await trySaveHistory(
            "dfile_logs",
            "canceled",
            filePath,
            finalOutputPath,
            method,
            startTime
          );
        }
        results.push({ inputPath: filePath, output: "decryption_failed" });
      }
    }

    return results;
  }
);

ipcMain.handle(
  "hide-data",
  async (
    _event,
    filesPath: string[],
    secretFilesPaths: string[],
    method: string,
    isDeleteSource: boolean,
    isSaveHistory: boolean,
    isShareable: boolean
  ): Promise<Array<{ inputPath: string; output: string }>> => {
    const startTime = Date.now();
    const results: Array<{ inputPath: string; output: string }> = [];

    if (!win) throw new Error("Main window not available");
    if (!Array.isArray(secretFilesPaths) || secretFilesPaths.length === 0) {
      throw new Error("No secret files provided.");
    }

    for (const imagePath of filesPath) {
      try {
        const result = await hideDataInImage(
          win,
          imagePath,
          secretFilesPaths,
          method,
          isShareable
        );

        if (result.response === "canceled") {
          results.push({ inputPath: imagePath, output: "canceled" });
          if (isSaveHistory)
            await trySaveHistory(
              "steg-in_logs",
              "canceled",
              imagePath,
              "N/A",
              method,
              startTime
            );
          continue;
        }

        if (
          result.response === "payload_too_large" ||
          result.response !== "OK"
        ) {
          results.push({ inputPath: imagePath, output: result.response });
          if (isSaveHistory)
            await trySaveHistory(
              "steg-in_logs",
              "fail",
              imagePath,
              result.response,
              method,
              startTime
            );
          continue;
        }

        results.push({ inputPath: imagePath, output: result.outputPath });
        if (isSaveHistory)
          await trySaveHistory(
            "steg-in_logs",
            "success",
            imagePath,
            result.outputPath,
            method,
            startTime
          );

        if (isDeleteSource) {
          try {
            await fs.promises.unlink(imagePath);
            for (const secretPath of secretFilesPaths) {
              await fs.promises.unlink(secretPath);
            }
          } catch (err) {
            console.error("Failed to delete source file(s):", err);
          }
        }
      } catch (error) {
        console.error("Data hiding error:", error);
        results.push({ inputPath: imagePath, output: "fail" });
        if (isSaveHistory)
          await trySaveHistory("steg-in_logs", "fail", imagePath, "N/A", method, startTime);
      }
    }

    return results;
  }
);

ipcMain.handle(
  "extract-data",
  async (
    _event,
    filesPath: string[],
    method: string,
    isDeleteSource: boolean,
    isSaveHistory: boolean,
    isSingleOutput: boolean
  ) => {
    const startTime = Date.now();
    const results: Array<{ inputPath: string; output: string }> = [];

    if (!win) throw new Error("Main window not available");

    let outputFolder: string | null = null;

    if (isSingleOutput) {
      const { canceled, filePaths } = await dialog.showOpenDialog(win, {
        title: "Select Folder to Save Extracted Files",
        properties: ["openDirectory"],
      });

      if (canceled || filePaths.length === 0) {
        if (isSaveHistory) {
          await trySaveHistory("steg-out_logs", "canceled", "N/A", "N/A", method, startTime);
        }
        return [];
      }

      outputFolder = filePaths[0];
    }

    for (const filePath of filesPath) {
      try {
        const extractionResult = await extractHiddenData(filePath, method);

        if (!extractionResult || extractionResult.response !== "OK") {
          results.push({ inputPath: filePath, output: "BAD_EXTRACT" });
          if (isSaveHistory) {
            await trySaveHistory(
              "steg-out_logs",
              "fail",
              filePath,
              "N/A",
              method,
              startTime
            );
          }
          continue;
        }

        let movedPaths: string[] = [];

        if (isSingleOutput && outputFolder) {
          movedPaths = await moveExtractedFiles(
            extractionResult.files,
            outputFolder
          );
        } else {
          for (const extractedFile of extractionResult.files) {
            const { canceled, filePath: savePath } =
              await dialog.showSaveDialog(win, {
                title: "Save Extracted File",
                defaultPath: path.basename(extractedFile),
                filters: [{ name: "All Files", extensions: ["*"] }],
              });

            if (canceled || !savePath) {
              results.push({ inputPath: filePath, output: "canceled" });
              if (isSaveHistory) {
                await trySaveHistory(
                  "steg-out_logs",
                  "canceled",
                  filePath,
                  "N/A",
                  method,
                  startTime
                );
              }
              continue;
            }

            const saved = await moveExtractedFiles(
              [extractedFile],
              path.dirname(savePath)
            );

            if (path.basename(saved[0]) !== path.basename(savePath)) {
              await fs.promises.rename(saved[0], savePath);
              movedPaths.push(savePath);
            } else {
              movedPaths.push(saved[0]);
            }
          }
        }

        if (isSaveHistory) {
          await trySaveHistory(
            "steg-out_logs",
            "success",
            filePath,
            movedPaths.join(","),
            method,
            startTime
          );
        }

        if (isDeleteSource) {
          try {
            await fs.promises.unlink(filePath);
          } catch (err) {
            console.error(`Failed to delete source file: ${filePath}`, err);
          }
        }

        results.push({ inputPath: filePath, output: movedPaths.join(",") });
      } catch (err) {
        console.error("Extraction failed:", err);
        results.push({ inputPath: filePath, output: "fail" });
        if (isSaveHistory) {
          await trySaveHistory("steg-out_logs", "fail", filePath, "N/A", method, startTime);
        }
      }
    }

    return results;
  }
);

ipcMain.handle("open-file-dialog", async () => {
  if (!win) return;
  const result = await dialog.showOpenDialog(win, {
    properties: ["openFile", "multiSelections"],
  });

  return result.filePaths;
});

ipcMain.handle("open-file-dialog-d", async () => {
  if (!win) return;
  const result = await dialog.showOpenDialog(win, {
    properties: ["openFile", "multiSelections"],
    filters: [{ name: "AroCrypt Files", extensions: ["arocrypt"] }],
  });

  return result.filePaths;
});

ipcMain.handle("select-image-datahider", async () => {
  if (!win) return;
  const result = await dialog.showOpenDialog(win, {
    properties: ["openFile"],
    filters: [{ name: "Image Files", extensions: ["png"] }],
  });

  return result.filePaths;
});

ipcMain.handle("select-data-extractor-image", async () => {
  if (!win) return;
  const result = await dialog.showOpenDialog(win, {
    properties: ["openFile", "multiSelections"],
    filters: [{ name: "Image Files", extensions: ["png"] }],
  });

  return result.filePaths;
});

ipcMain.handle("select-secret-files", async () => {
  if (!win) return;
  const result = await dialog.showOpenDialog(win, {
    properties: ["openFile", "multiSelections"],
  });

  return result.filePaths;
});

// ? History handlers

ipcMain.handle("get-logs", async (_event, table) => {
  return await getLogs(table);
});

ipcMain.handle("delete-log", async (_event, { table, id }) => {
  if (id === "all") {
    return await deleteAllLogs(table);
  } else {
    return await deleteLogById(table, id);
  }
});

// Important Handlers (WINDOW UI)

ipcMain.handle("get-app-version", () => {
  const version = app.getVersion();
  return version;
});

ipcMain.handle("maximize-window", () => {
  if (!win) return;

  if (win.isMaximized()) {
    win.unmaximize();
  } else {
    win.maximize();
  }
});

ipcMain.handle("minimize-window", () => {
  win?.minimize();
});

ipcMain.handle("close-window", () => {
  win?.close();
});

ipcMain.on("open-external-link", (event, url) => {
  shell.openExternal(url);
});

ipcMain.handle("get-platform", () => {
  return process.platform;
});

// # User Keys

ipcMain.handle("save-keys", async (event, secret_key, public_key, recipient_key) => {
  return await saveKEMKey(secret_key, public_key, recipient_key);
});

ipcMain.handle("get-keys", async () => {
  const keys = await getKeys();
  return keys;
});

ipcMain.handle("create-kyber-keys", async () => {
  const keys = await createMlKemKeys();
  console.log("KEM Keys Generated Successfully!");
  return keys;
});

// # User Keys {end}

ipcMain.handle("open-about-window", () => {
  if (!win) return;

  let aboutWin: BrowserWindow | null = null;
  aboutWin = new BrowserWindow({
    title: "AroCrypt",
    width: 624,
    maxWidth: 624,
    minWidth: 624,
    height: 240,
    minHeight: 240,
    maxHeight: 240,
    frame: false,
    fullscreen: false,
    resizable: false,
    maximizable: false,
    minimizable: false,
    parent: win,
    modal: true,
    icon: path.join("./assets/images/app-icons/png/64x64.png"),
    webPreferences: {
      preload,
      contextIsolation: true,
      nodeIntegration: false,
      devTools: !isProduction,
    },
  });

  if (isProduction) {
    aboutWin.loadFile(indexHtml, { hash: "about" });
  } else {
    aboutWin.loadURL(`${VITE_DEV_SERVER_URL}#about`);
  }

  aboutWin.on("closed", () => {
    aboutWin = null;
  });
});
