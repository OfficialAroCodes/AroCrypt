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
import fs from "fs";
import path from "path";
import getKey, { savePrivateKey } from "./utils/KeyService";
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
import { generateKey } from "./utils/crypto";

let PRIVATE_KEY: string | null = null;

async function initializeUniqueKey() {
  try {
    const existingKey = await getKey();

    if (existingKey) {
      PRIVATE_KEY = existingKey;
      return;
    }
  } catch (error) {
    throw error;
  }
}

process.on("uncaughtException", (error) => {
  safeWriteLog(`UNCAUGHT EXCEPTION: ${error.message}`);
  safeWriteLog(`STACK TRACE: ${error.stack}`);
  app.quit();
});

// Defer autoUpdater configuration
function configureAutoUpdater() {
  try {
    safeWriteLog("Configuring AutoUpdater");

    autoUpdater.forceDevUpdateConfig = true;

    autoUpdater.setFeedURL({
      provider: "github",
      owner: "OfficialAroCodes",
      repo: "arocrypt",
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

    // IPC handler for checking updates
    ipcMain.handle("check-for-updates", async () => {
      try {
        const updateCheckResult = await autoUpdater.checkForUpdates();
        if (updateCheckResult) {
          return {
            version: updateCheckResult.versionInfo.version,
            releaseNotes: updateCheckResult.versionInfo.releaseNotes || "",
            isUpdateAvailable: true,
          };
        }
      } catch (error) {
        safeWriteLog(`Update check error: ${error}`);
        return {
          version: null,
          releaseNotes: "",
          isUpdateAvailable: false,
        };
      }
    });

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
  await initializeUniqueKey();
  safeWriteLog("App is ready");
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
    width: 1100,
    minWidth: 1100,
    maxWidth: 1100,
    height: 670,
    minHeight: 670,
    maxHeight: 670,
    frame: false,
    fullscreen: false,
    resizable: false,
    icon: path.join("./icons/png/64x64.png"),
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

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(indexHtml);
  }

  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
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

app.on("second-instance", () => {
  if (win) {
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

ipcMain.handle("decrypt", async (event, { packedKeys, method }) => {
  try {
    const decrypted = await decrypt({ packedKeys, method });
    return decrypted;
  } catch (error) {
    safeWriteLog(`Decryption error: ${error}`);
    return "invalid";
  }
});

ipcMain.handle("encrypt", async (event, { text, method }) => {
  try {
    const result = await encrypt(text, method);
    return result;
  } catch (error) {
    safeWriteLog(`Encryption error: ${error}`);
    throw error;
  }
});

// IPC Handlers for File Encryption/Decryption

ipcMain.handle(
  "encrypt-file",
  async (event, inputPath: string, method: string, outputPath?: string) => {
    try {
      await initializeUniqueKey();

      if (!win) {
        throw new Error("Main window not available");
      }

      if (!PRIVATE_KEY) {
        throw new Error("No unique key found for file encryption");
      }

      const originalFilename = path.basename(inputPath);
      const encryptedFilename = `${originalFilename}.arocrypt`;

      const saveDialogResult = await dialog.showSaveDialog(win, {
        title: "Save Encrypted File",
        defaultPath: encryptedFilename,
        filters: [{ name: "Encrypted File", extensions: ["arocrypt"] }],
      });

      if (saveDialogResult.canceled || !saveDialogResult.filePath) {
        return "encryption_canceled";
      }

      const finalOutputPath = saveDialogResult.filePath;

      const result = encryptFile(inputPath, method, finalOutputPath);

      return result;
    } catch (error) {
      console.error("Encryption error:", error);
      throw error;
    }
  }
);

ipcMain.handle(
  "decrypt-file",
  async (event, inputPath: string, method: string) => {
    try {
      await initializeUniqueKey();

      if (!inputPath.endsWith(".arocrypt")) {
        return "invalid_file_type";
      }

      if (!win) {
        throw new Error("Main window not available");
      }

      if (!PRIVATE_KEY) {
        throw new Error("No unique key found for file decryption");
      }

      try {
        await validateFileDecryption(inputPath, method, PRIVATE_KEY);
      } catch (decryptionError) {
        return "key_error";
      }

      const originalFilename = path.basename(inputPath, ".arocrypt");

      const saveDialogResult = await dialog.showSaveDialog(win, {
        title: "Save Decrypted File",
        defaultPath: originalFilename,
        filters: [{ name: "All Files", extensions: ["*"] }],
      });

      if (saveDialogResult.canceled || !saveDialogResult.filePath) {
        return "decryption_canceled";
      }

      const finalOutputPath = saveDialogResult.filePath;

      const decryptedPath = decryptFile(inputPath, method, PRIVATE_KEY);

      fs.copyFileSync(await decryptedPath, finalOutputPath);

      return finalOutputPath;
    } catch (error) {
      console.error("Decryption error:", error);

      if ((error as any).message !== "File decryption canceled") {
        dialog.showErrorBox(
          "Decryption Error",
          (error as any).message ||
          "An unknown error occurred during decryption"
        );
      }

      throw error;
    }
  }
);

ipcMain.handle(
  "hide-data",
  async (event, imagePath: string, secretFilesPaths: string[], method: string) => {
    if (!win) return;

    if (!Array.isArray(secretFilesPaths) || secretFilesPaths.length === 0) {
      throw new Error("No secret files provided.");
    }
    
    try {
      await initializeUniqueKey();

      if (!PRIVATE_KEY) {
        throw new Error("No unique key found for file encryption");
      }

      const originalFilename = path.basename(imagePath);

      const saveDialogResult = await dialog.showSaveDialog(win, {
        title: "Save Stego Image",
        defaultPath: originalFilename,
        filters: [{ name: "Images", extensions: ["png"] }],
      });

      if (saveDialogResult.canceled || !saveDialogResult.filePath) {
        return "hiding_canceled";
      }

      const finalOutputPath = saveDialogResult.filePath;

      const result = await hideDataInImage(imagePath, secretFilesPaths, method, finalOutputPath);

      return result;
    } catch (error) {
      console.error("Data hiding error:", error);
      throw error;
    }
  }
);

ipcMain.handle(
  "extract-data",
  async (event, imagePath: string, method: string) => {
    if (!win) return;
    
    try {
      await initializeUniqueKey();

      if (!PRIVATE_KEY) {
        throw new Error("No unique key found for file encryption");
      }

      // First extract the data to get the file paths
      const extractionResult = await extractHiddenData(imagePath, method);

      if (extractionResult.response !== "OK") {
        return "BAD_EXTRACT";
      }

      // And Then show save dialog
      const saveDialogResult = await dialog.showOpenDialog(win, {
        title: "Select Folder to Save Extracted Data",
        properties: ["openDirectory"],
      });

      if (saveDialogResult.canceled || !saveDialogResult.filePaths[0]) {
        return "hiding_canceled";
      }

      const finalOutputPath = saveDialogResult.filePaths[0];

      // Move the extracted files to the selected location
      const result = await moveExtractedFiles(extractionResult.files, finalOutputPath);

      return result.join(',');
    } catch (error) {
      console.error("Data hiding error:", error);
      throw error;
    }
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
    properties: ["openFile"],
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

// Important Handlers (WINDOW UI)

ipcMain.handle("get-app-version", () => {
  const version = app.getVersion();
  return version;
});

ipcMain.handle("minimize-window", () => {
  if (win) {
    win.minimize();
  }
});

ipcMain.handle("close-window", () => {
  if (win) {
    win.close();
  }
});

ipcMain.on("open-external-link", (event, url) => {
  shell.openExternal(url);
});

/* Secret Key Functions */

ipcMain.handle("save-unique-key", async (event, key) => {
  return await savePrivateKey(key);
});

ipcMain.handle("get-unique-key", () => {
  return getKey();
});

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
    icon: path.join("./icons/png/64x64.png"),
    webPreferences: {
      preload,
      contextIsolation: true,
      nodeIntegration: false,
      devTools: !isProduction,
    },
  });

  if (isProduction) {
    aboutWin.loadFile(indexHtml, { hash: 'about' });
  } else {
    aboutWin.loadURL(`${VITE_DEV_SERVER_URL}#about`);
  }

  aboutWin.on("closed", () => {
    aboutWin = null;
  });
});
