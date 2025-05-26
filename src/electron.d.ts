interface ElectronAPI {
    // Encryption/Decryption Events
    onEncrypted: (callback: (event: any) => void) => void;
    onDecrypted: (callback: (event: any) => void) => void;

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

    showSaveDialog: (options: {
        title?: string;
        defaultPath?: string;
    }) => Promise<{
        canceled: boolean;
        filePath?: string;
    }>;
    encryptFile: (
        inputPath: string,
        method: string,
        outputPath?: string
    ) => Promise<string>;
    onEncryptionProgress: (callback: (event: { progress: number }) => void) => void;
    decryptFile: (filePath: string, method: string) => Promise<string>;
    openFileDialog: () => Promise<string[]>;
    openFileDialogD: () => Promise<string[]>;

    // Utility Methods
    copyToClipboard: (text: string) => Promise<void>;
    openExternalLink: (url: string) => void;
    getAppVersion: () => Promise<string>;

    // Window Control
    minimizeWindow: () => Promise<void>;
    closeWindow: () => Promise<void>;

    // Update Checking
    onUpdateAvailable: (callback: (updateInfo: UpdateInfo & { isUpdateAvailable: boolean }) => void) => void;
    onUpdateNotAvailable: (callback: (updateInfo: UpdateInfo & { isUpdateAvailable: boolean }) => void) => void;
    checkForUpdates: () => Promise<UpdateInfo>;
    downloadUpdate?: () => Promise<void>;
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

interface Window {
    electronAPI: ElectronAPI;
}