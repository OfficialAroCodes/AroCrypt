import KeysProvider from '@/Providers/KeysProvider';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { useToast } from './ToastContext';

interface KeyProviderContextType {
    openManual: () => void;
    openAuto: () => void;
    close: () => void;
}

const KeyProviderContext = createContext<KeyProviderContextType | null>(null);

export const useKeyProvider = () => {
    const ctx = useContext(KeyProviderContext);
    if (!ctx) throw new Error("useKeyProvider must be used within KeyProviderProvider");
    return ctx;
};

export const KeysMainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [manualOpen, setManualOpen] = useState(false);
    const [autoOpen, setAutoOpen] = useState(false);

    const openManual = useCallback(() => setManualOpen(true), []);
    const openAuto = useCallback(() => setAutoOpen(true), []);

    const close = useCallback(() => {
        setManualOpen(false);
        setAutoOpen(false);
    }, []);

    return (
        <KeyProviderContext.Provider value={{ openManual, openAuto, close }}>
            {children}
            <KeysProvider show={manualOpen || autoOpen} onClose={() => {
                close();
            }} />
        </KeyProviderContext.Provider>
    );
};