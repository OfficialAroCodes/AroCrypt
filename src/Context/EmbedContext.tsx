import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export type File = {
    path: string;
    name: string;
};

type EmbedContextType = {
    files: File[];
    setFiles: (files: File[]) => void;
    secretFiles: File[];
    setSecretFiles: (files: File[]) => void;
};

const EmbedContext = createContext<EmbedContextType | undefined>(undefined);

export const useEmbed = () => {
    const ctx = useContext(EmbedContext);
    if (!ctx) throw new Error('useEmbed must be used within DecryptProvider');
    return ctx;
};

export const EmbedProvider = ({ children }: { children: ReactNode }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [secretFiles, setSecretFiles] = useState<File[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (files.length > 0) {
            navigate('/steganography/hide');
        }
    }, [files]);

    return (
        <EmbedContext.Provider value={{ files, setFiles, secretFiles, setSecretFiles }}>
            {children}
        </EmbedContext.Provider>
    );
};