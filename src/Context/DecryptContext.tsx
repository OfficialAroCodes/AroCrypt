import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastContext';

export type File = {
  path: string;
  name: string;
};

type DecryptContextType = {
  files: File[];
  setFiles: (files: File[]) => void;
};

const DecryptContext = createContext<DecryptContextType | undefined>(undefined);

export const useDecrypt = () => {
  const ctx = useContext(DecryptContext);
  if (!ctx) throw new Error('useDecrypt must be used within DecryptProvider');
  return ctx;
};

export const DecryptProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const navigate = useNavigate();
  const [isManyFiles, setIsManyFiles] = useState(false);

  useEffect(() => {
    window.electronAPI.onFilesToDecrypt((incomingFiles: string[]) => {
      setIsManyFiles(false);

      if (files.length > 0) {
        navigate('/decryption/file');
      }

      setFiles(prevFiles => {
        const newFiles = incomingFiles.map(path => ({
          path,
          name: path.split(/[\\/]/).pop() || path,
        }));
        const allFiles = [...prevFiles, ...newFiles];
        const uniqueFiles = Array.from(new Map(allFiles.map(f => [f.path, f])).values());

        if (uniqueFiles.length >= 21) {
          setIsManyFiles(true);
          return prevFiles;
        }

        return uniqueFiles;
      });
    });
  }, []);

  useEffect(() => {
    if (isManyFiles === true) {
      toast(2, t('toast.file_limit_msg'), t('toast.file_limit_title'));
    }
  }, [isManyFiles])

  useEffect(() => {
    if (files.length > 0) {
      navigate('/decryption/file');
    }
  }, [files]);

  return (
    <DecryptContext.Provider value={{ files, setFiles }}>
      {children}
    </DecryptContext.Provider>
  );
};