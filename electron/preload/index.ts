import { ipcRenderer, contextBridge } from "electron";

interface FileResult {
  inputPath: string;
  output: string;
}

type KyberKeyPair = {
  pubkey: string;
  secret: string;
};

interface ElectronAPI {
  encryptFile: (
    filesPath: string[],
    method: string,
    isDeleteSource: boolean,
    isSaveHistory: boolean,
    isSingleOutput: boolean,
    isShareable: boolean
  ) => Promise<FileResult[]>;

  decryptFile: (
    filesPath: string[],
    method: string,
    isDeleteSource: boolean,
    isSaveHistory: boolean,
    isSingleOutput: boolean
  ) => Promise<FileResult[]>;

  extractHiddenData: (
    filesPath: string[],
    method: string,
    isDeleteSource: boolean,
    isSaveHistory: boolean,
    isSingleOutput: boolean
  ) => Promise<FileResult[]>;

  hideData: (
    filesPath: string[],
    secretFilesPath: string[],
    method: string,
    isDeleteSource: boolean,
    isSaveHistory: boolean,
    isShareable: boolean
  ) => Promise<FileResult[]>;

  showSaveDialog: (options: {
    title?: string;
    defaultPath?: string;
  }) => Promise<string>;

  openFileDialog: () => Promise<string[]>;
  openFileDialogD: () => Promise<string[]>;

  // # Args from Context Menu
  onFilesToDecrypt: (callback: (paths: string[]) => void) => void;
  onFilesToEncrypt: (callback: (paths: string[]) => void) => void;

  selectDataHiderImage: () => Promise<string[]>;
  selectDataHiderSecretFiles: () => Promise<string[]>;
  selectDataExtractorImage: () => Promise<string[]>;

  // Keys
  noKeys: () => Promise<boolean>;

  kyberKeyPair: () => Promise<KyberKeyPair>;
  saveKeys: (secret_key: string, public_key: string, recipient_key: string) => Promise<boolean>;
  getKeys: () => Promise<{ secret_key: string; public_key: string }>;

  // Other Functions
  encrypt: (params: { text: string; method: string; isSaveHistory: boolean; isShareable: boolean }) => Promise<{
    content: string;
    iv: string;
    salt: string;
    hmac: string;
    method: string;
  }>;
  decrypt: (params: { packedKeys: string; method: string; isSaveHistory: boolean }) => Promise<string>;

  // Utility Methods
  copyToClipboard: (text: string) => Promise<void>;
  openExternalLink: (url: string) => void;
  getAppVersion: () => Promise<string>;
  getPlatform: () => Promise<string>;

  getLogs: (table: string) => void;
  deleteLog: (params: { table: string; id: string }) => void;

  // Window Control
  maximizeWindow: () => Promise<void>;
  onMaximize: (callback: (isMax: boolean) => void) => void;
  minimizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  downloadUpdate?: () => Promise<void>;
  openAboutWindow?: () => Promise<void>;

  // Update Checking
  checkForUpdates: () => Promise<UpdateInfo | null>;
  onUpdateAvailable: (
    callback: (updateInfo: UpdateInfo & { isUpdateAvailable: boolean }) => void
  ) => void;
  onUpdateNotAvailable: (
    callback: (updateInfo: UpdateInfo & { isUpdateAvailable: boolean }) => void
  ) => void;

  onUpdateDownloadProgress: (
    callback: (progress: {
      percent: number;
      transferred: number;
      total: number;
      bytesPerSecond: number;
    }) => void
  ) => void;
}

interface UpdateInfo {
  version: string;
  files: Array<{
    url: string;
    size: number;
  }>;
  path?: string;
  releaseDate?: string;
}

let bufferedFilesToDecrypt: string[] | null = null;
let filesToDecryptCallback: ((paths: string[]) => void) | null = null;

// --------- Expose some API to the Renderer process ---------
const electronAPI: ElectronAPI = {
  encryptFile: (
    filesPath: string[],
    method: string,
    isDeleteSource: boolean,
    isSaveHistory: boolean,
    isSingleOutput: boolean,
    isShareable: boolean
  ) =>
    ipcRenderer.invoke(
      "encrypt-file",
      filesPath,
      method,
      isDeleteSource,
      isSaveHistory,
      isSingleOutput,
      isShareable
    ),

  decryptFile: (
    filesPath: string[],
    method: string,
    isDeleteSource: boolean,
    isSaveHistory: boolean,
    isSingleOutput: boolean
  ) =>
    ipcRenderer.invoke(
      "decrypt-file",
      filesPath,
      method,
      isDeleteSource,
      isSaveHistory,
      isSingleOutput
    ),

  extractHiddenData: (
    filesPath: string[],
    method: string,
    isDeleteSource: boolean,
    isSaveHistory: boolean,
    isSingleOutput: boolean
  ) =>
    ipcRenderer.invoke(
      "extract-data",
      filesPath,
      method,
      isDeleteSource,
      isSaveHistory,
      isSingleOutput
    ),

  hideData: (
    filesPath: string[],
    secretFilesPath: string[],
    method: string,
    isDeleteSource: boolean,
    isSaveHistory: boolean,
    isShareable: boolean
  ) =>
    ipcRenderer.invoke(
      "hide-data",
      filesPath,
      secretFilesPath,
      method,
      isDeleteSource,
      isSaveHistory,
      isShareable
    ),

  showSaveDialog: (options) =>
    ipcRenderer.invoke("show-save-dialog", options).then((result) => {
      if (result.canceled) {
        throw new Error("Save dialog was canceled");
      }
      return result.filePath;
    }),

  // # Args from Context Menu
  onFilesToDecrypt: (cb) =>
    ipcRenderer.on("files-to-decrypt", (_e, files) => cb(files)),
  onFilesToEncrypt: (cb) =>
    ipcRenderer.on("files-to-encrypt", (_e, files) => cb(files)),

  //Dialogs
  openFileDialog: () => ipcRenderer.invoke("open-file-dialog"),
  openFileDialogD: () => ipcRenderer.invoke("open-file-dialog-d"),

  selectDataHiderImage: () => ipcRenderer.invoke("select-image-datahider"),
  selectDataHiderSecretFiles: () => ipcRenderer.invoke("select-secret-files"),

  selectDataExtractorImage: () =>
    ipcRenderer.invoke("select-data-extractor-image"),

  // Private and Public Keys

  noKeys: async () => {
    const key = await ipcRenderer.invoke("get-keys");
    return key.length === 0;
  },

  kyberKeyPair: async (): Promise<KyberKeyPair> => {
    const keys = await ipcRenderer.invoke("create-kyber-keys");
    return keys as KyberKeyPair;
  },

  saveKeys: (secret_key: string, public_key: string, recipient_key: string) => {
    return ipcRenderer.invoke("save-keys", secret_key, public_key, recipient_key);
  },
  
  getKeys: () => ipcRenderer.invoke("get-keys"),

  // Other Functions
  encrypt: ({ text, method, isSaveHistory, isShareable }) => {
    return ipcRenderer.invoke("encrypt", { text, method, isSaveHistory, isShareable });
  },
  decrypt: ({ packedKeys, method, isSaveHistory }) => {
    return ipcRenderer.invoke("decrypt", { packedKeys, method, isSaveHistory });
  },

  // Utility Methods
  copyToClipboard: (text) => navigator.clipboard.writeText(text),
  openExternalLink: (url) => ipcRenderer.send("open-external-link", url),
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  getPlatform: () => ipcRenderer.invoke("get-platform"),

  getLogs: (table) => ipcRenderer.invoke("get-logs", table),
  deleteLog: ({ table, id }) => ipcRenderer.invoke("delete-log", { table, id }),

  // Window Control
  maximizeWindow: () => ipcRenderer.invoke("maximize-window"),
  onMaximize: (callback: (isMax: boolean) => void) => {
    ipcRenderer.on("window-maximize", (_event, state: boolean) =>
      callback(state)
    );
  },
  minimizeWindow: () => ipcRenderer.invoke("minimize-window"),
  closeWindow: () => ipcRenderer.invoke("close-window"),

  onUpdateAvailable: (callback) =>
    ipcRenderer.on("update-available", (_event, updateInfo) => {
      callback({ ...updateInfo, isUpdateAvailable: true });
    }),

  checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),
  downloadUpdate: () => ipcRenderer.invoke("download-update"),
  openAboutWindow: () => ipcRenderer.invoke("open-about-window"),

  onUpdateNotAvailable: (callback) =>
    ipcRenderer.on("update-not-available", (_event, updateInfo) => {
      callback({ ...updateInfo, isUpdateAvailable: false });
    }),

  onUpdateDownloadProgress: (
    callback: (progress: {
      percent: number;
      transferred: number;
      total: number;
      bytesPerSecond: number;
    }) => void
  ) =>
    ipcRenderer.on("update-download-progress", (_event, progress) =>
      callback(progress)
    ),
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);
