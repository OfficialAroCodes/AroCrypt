import { ipcRenderer, contextBridge } from 'electron'

interface ElectronAPI {
  // Encryption/Decryption Events
  onEncrypted: (callback: (event: any) => void) => void;
  onDecrypted: (callback: (event: any) => void) => void;

  encryptFile: (inputPath: string, method: string, outputPath?: string) => Promise<string>;
  decryptFile: (filePath: string, method: string) => Promise<string>;
  showSaveDialog: (options: { title?: string; defaultPath?: string }) => Promise<string>;
  onEncryptionProgress: (callback: (progress: number) => void) => void;
  openFileDialog: () => Promise<string[]>;
  openFileDialogD: () => Promise<string[]>;

  // Secret Key Methods
  saveUniqueKey: (key: string) => Promise<boolean>;
  getUniqueKey: () => Promise<string | null>;
  noUniqueKey: () => Promise<boolean>;
  encrypt: (params: { text: string; method: string }) => Promise<any>;
  decrypt: (params: {
    content: string;
    iv: string;
    method: string;
    authTag: string
  }) => Promise<any>;

  // Utility Methods
  copyToClipboard: (text: string) => Promise<void>;
  openExternalLink: (url: string) => void;
  getAppVersion: () => Promise<string>;

  // Window Control
  minimizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  downloadUpdate?: () => Promise<void>;

  // Update Checking
  checkForUpdates: () => Promise<UpdateInfo | null>;
  onUpdateAvailable: (callback: (updateInfo: UpdateInfo & { isUpdateAvailable: boolean }) => void) => void;
  onUpdateNotAvailable: (callback: (updateInfo: UpdateInfo & { isUpdateAvailable: boolean }) => void) => void;
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
  onEncrypted: (callback) => ipcRenderer.on('encrypted', callback),
  onDecrypted: (callback) => ipcRenderer.on('decrypted', callback),

  onEncryptionProgress: (callback: (progress: number) => void) =>
    ipcRenderer.on('encryption-progress', (_event, progressData: { progress: number }) => {
      callback(progressData.progress);
    }),
  encryptFile: (inputPath, method, outputPath) =>
    ipcRenderer.invoke('encrypt-file', inputPath, method, outputPath),
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
    return ipcRenderer.invoke('encrypt', { text, method });
  },
  decrypt: ({ content, iv, method, authTag }) => {
    return ipcRenderer.invoke('decrypt', { content, iv, method, authTag });
  },

  // Utility Methods
  copyToClipboard: (text) => navigator.clipboard.writeText(text),
  openExternalLink: (url) => ipcRenderer.send('open-external-link', url),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // Window Control
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),

  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (_event, updateInfo) => {
    callback({ ...updateInfo, isUpdateAvailable: true });
  }),

  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  onUpdateNotAvailable: (callback) => ipcRenderer.on('update-not-available', (_event, updateInfo) => {
    callback({ ...updateInfo, isUpdateAvailable: false });
  }),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);