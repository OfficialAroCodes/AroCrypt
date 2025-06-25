interface ElectronAPI {

    // Private Key
    saveUniqueKey: (key: string) => Promise<boolean>;
    getUniqueKey: () => Promise<string | null>;
    noUniqueKey: () => Promise<boolean>;

    // Text
    encrypt: (params: { text: string; method: string }) => Promise<any>;
    decrypt: (params: {
        packedKeys: string;
        method: string;
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

    decryptFile: (filePath: string, method: string) => Promise<string>;
    openFileDialog: () => Promise<string[]>;
    openFileDialogD: () => Promise<string[]>;

    // Embed Data
    hideData: (
        imagePath: string,
        secretFilesPath: string[],
        method: string,
        outputPath?: string
    ) => Promise<string>;
    selectDataHiderImage: () => Promise<string[]>;
    selectDataHiderSecretFiles: () => Promise<string[]>;

    // Hidden Data Extraction
    extractHiddenData: (
        imagePath: string,
        method: string,
        outputPath?: string
    ) => Promise<string>;
    selectDataExtractorImage: () => Promise<string[]>;
    
    // Utility
    copyToClipboard: (text: string) => Promise<void>;
    openExternalLink: (url: string) => void;
    getAppVersion: () => Promise<string>;
    getPlatform: () => Promise<string>;

    // Window Control
    minimizeWindow: () => Promise<void>;
    closeWindow: () => Promise<void>;

    // Update
    onUpdateAvailable: (callback: (updateInfo: UpdateInfo & { isUpdateAvailable: boolean }) => void) => void;
    onUpdateNotAvailable: (callback: (updateInfo: UpdateInfo & { isUpdateAvailable: boolean }) => void) => void;
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

interface Window {
    electronAPI: ElectronAPI;
}