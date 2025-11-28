import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export type File = {
    path: string;
    name: string;
};

type ExtractContextType = {
    files: File[];
    setFiles: (files: File[]) => void;
};

const ExtractContext = createContext<ExtractContextType | undefined>(undefined);

export const useExtract = () => {
    const ctx = useContext(ExtractContext);
    if (!ctx) throw new Error('useExtract must be used within DecryptProvider');
    return ctx;
};

export const ExtractProvider = ({ children }: { children: ReactNode }) => {
    const [files, setFiles] = useState<File[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (files.length > 0) {
            navigate('/steganography/extract');
        }
    }, [files]);

    return (
        <ExtractContext.Provider value={{ files, setFiles }}>
            {children}
        </ExtractContext.Provider>
    );
};