import { ipcRenderer, contextBridge } from 'electron'

interface ElectronAPI {
  encryptFile: (inputPath: string, method: string, outputPath?: string) => Promise<string>;
  decryptFile: (filePath: string, method: string) => Promise<string>;
  hideData: (imagePath: string, secretFilesPath: string[], method: string, outputPath?: string) => Promise<string>;
  extractHiddenData: (imagePath: string, method: string, outputPath?: string) => Promise<string>;
  showSaveDialog: (options: { title?: string; defaultPath?: string }) => Promise<string>;
  openFileDialog: () => Promise<string[]>;
  openFileDialogD: () => Promise<string[]>;

  selectDataHiderImage: () => Promise<string[]>;
  selectDataHiderSecretFiles: () => Promise<string[]>;
  selectDataExtractorImage: () => Promise<string[]>;

  // Secret Key Methods
  saveUniqueKey: (key: string) => Promise<boolean>;
  getUniqueKey: () => Promise<string | null>;
  noUniqueKey: () => Promise<boolean>;
  encrypt: (params: { text: string; method: string }) => Promise<{
    content: string;
    iv: string;
    salt: string;
    hmac: string;
    method: string;
  }>;
  decrypt: (params: {
    packedKeys: string;
    method: string;
  }) => Promise<string>;

  // Utility Methods
  copyToClipboard: (text: string) => Promise<void>;
  openExternalLink: (url: string) => void;
  getAppVersion: () => Promise<string>;
  getPlatform: () => Promise<string>;

  // Window Control
  minimizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  downloadUpdate?: () => Promise<void>;
  openAboutWindow?: () => Promise<void>;

  // Update Checking
  checkForUpdates: () => Promise<UpdateInfo | null>;
  onUpdateAvailable: (callback: (updateInfo: UpdateInfo & { isUpdateAvailable: boolean }) => void) => void;
  onUpdateNotAvailable: (callback: (updateInfo: UpdateInfo & { isUpdateAvailable: boolean }) => void) => void;

  onUpdateDownloadProgress: (callback: (progress: { percent: number; transferred: number; total: number; bytesPerSecond: number }) => void) => void;
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

// --------- Expose some API to the Renderer process ---------
const electronAPI: ElectronAPI = {
  encryptFile: (inputPath, method, outputPath) =>
    ipcRenderer.invoke('encrypt-file', inputPath, method, outputPath),

  hideData: (imagePath, secretFilesPath, method, outputPath) =>
    ipcRenderer.invoke('hide-data', imagePath, secretFilesPath, method, outputPath),

  extractHiddenData: (imagePath, method, outputPath) =>
    ipcRenderer.invoke('extract-data', imagePath, method, outputPath),

  decryptFile: (filePath: string, method: string) =>
    ipcRenderer.invoke('decrypt-file', filePath, method),
  showSaveDialog: (options) =>
    ipcRenderer.invoke('show-save-dialog', options).then((result) => {
      if (result.canceled) {
        throw new Error('Save dialog was canceled');
      }
      return result.filePath;
    }),
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  openFileDialogD: () => ipcRenderer.invoke('open-file-dialog-d'),

  selectDataHiderImage: () => ipcRenderer.invoke('select-image-datahider'),
  selectDataHiderSecretFiles: () => ipcRenderer.invoke('select-secret-files'),

  selectDataExtractorImage: () => ipcRenderer.invoke('select-data-extractor-image'),
  
  // Secret Key Methods
  saveUniqueKey: (key) => {
    if (!key || key.length < 4) {
      return Promise.resolve(false);
    }
    return ipcRenderer.invoke('save-unique-key', key);
  },
  getUniqueKey: () => ipcRenderer.invoke('get-unique-key'),
  noUniqueKey: async () => {
    const key = await ipcRenderer.invoke('get-unique-key');
    return !key;
  },
  encrypt: ({ text, method }) => {
    return ipcRenderer.invoke("encrypt", { text, method });
  },
  decrypt: ({ packedKeys, method }) => {
    return ipcRenderer.invoke("decrypt", { packedKeys, method });
  },

  // Utility Methods
  copyToClipboard: (text) => navigator.clipboard.writeText(text),
  openExternalLink: (url) => ipcRenderer.send('open-external-link', url),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),

  // Window Control
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),

  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (_event, updateInfo) => {
    callback({ ...updateInfo, isUpdateAvailable: true });
  }),

  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  openAboutWindow: () => ipcRenderer.invoke('open-about-window'),
  
  onUpdateNotAvailable: (callback) => ipcRenderer.on('update-not-available', (_event, updateInfo) => {
    callback({ ...updateInfo, isUpdateAvailable: false });
  }),

  onUpdateDownloadProgress: (callback: (progress: { percent: number; transferred: number; total: number; bytesPerSecond: number }) => void) =>
    ipcRenderer.on('update-download-progress', (_event, progress) => callback(progress)),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);