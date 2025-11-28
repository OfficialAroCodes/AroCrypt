interface FileResult {
  inputPath: string;
  output: string;
}

type KyberKeyPair = {
  secretKey: string;
  publicKey: string;
};

interface ElectronAPI {
  // User Keys
  getPrivateKey: () => Promise<string | null>;
  getPublicKey: () => Promise<string | null>;

  kyberKeyPair: () => Promise<KyberKeyPair>;
  saveKeys: (secret_key: string, public_key: string, recipient_key: string) => Promise<boolean>;
  getKeys: () => Promise<{ secret: string; public: string; recipient: string }>;
  noKeys: () => Promise<boolean>;

  // Text
  encrypt: (params: { text: string; method: string; isSaveHistory: boolean; isShareable: boolean }) => Promise<any>;
  decrypt: (params: { packedKeys: string; method: string; isSaveHistory: boolean }) => Promise<any>;

  showSaveDialog: (options: {
    title?: string;
    defaultPath?: string;
  }) => Promise<{
    canceled: boolean;
    filePath?: string;
  }>;

  onFilesToDecrypt: (callback: (paths: string[]) => void) => void;
  onFilesToEncrypt: (callback: (paths: string[]) => void) => void;

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

  openFileDialog: () => Promise<string[]>;
  openFileDialogD: () => Promise<string[]>;

  // Embed Data
  selectDataHiderImage: () => Promise<string[]>;
  selectDataHiderSecretFiles: () => Promise<string[]>;

  selectDataExtractorImage: () => Promise<string[]>;

  // Utility
  copyToClipboard: (text: string) => Promise<void>;
  openExternalLink: (url: string) => void;
  getAppVersion: () => Promise<string>;
  getPlatform: () => Promise<string>;

  getLogs: (table: string) => Promise<LogEntry[]>;
  deleteLog: (args: { table: string; id: string }) => Promise<void>;

  // Window Control
  maximizeWindow: () => Promise<void>;
  onMaximize: (callback: (isMax: boolean) => void) => void;
  minimizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;

  // Update
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
  checkForUpdates: () => Promise<UpdateInfo>;
  downloadUpdate?: () => Promise<void>;
  openAboutWindow: () => Promise<void>;
}

interface UpdateInfo {
  version: string;
  files: Array<{
    url: string;
    size: number;
  }>;
  path?: string;
  releaseDate?: string;
  releaseNotes?: string;
  isUpdateAvailable?: boolean;
}

interface LogEntry {
  id: string;
  timestamp: number;
  input_path: string;
  output_path: string;
  input_size?: number;
  output_size?: number;
  status?: string;
  duration?: number;
}

interface Window {
  electronAPI: ElectronAPI;
}
