/// <reference types="vite-electron-plugin/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    VSCODE_DEBUG?: 'true'
    APP_ROOT?: string
    VITE_DEV_SERVER_URL?: string
    VITE_PUBLIC?: string
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬ dist-electron
     * │ ├─┬ main
     * │ │ └── index.js
     * │ └─┬ preload
     * │   └── index.js
     * ├─┬ dist
     * │ └── index.html
     * ```
     */
    DIST_ELECTRON: string
    DIST: string
    /** /dist/ or /public/ */
    PUBLIC: string
  }
}
