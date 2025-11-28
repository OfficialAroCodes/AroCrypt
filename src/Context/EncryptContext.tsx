import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastContext';
import { useTranslation } from 'react-i18next';

export type File = {
  path: string;
  name: string;
};

type EncryptContextType = {
  files: File[];
  setFiles: (files: File[]) => void;
};

const EncryptContext = createContext<EncryptContextType | undefined>(undefined);

export const useEncrypt = () => {
  const ctx = useContext(EncryptContext);
  if (!ctx) throw new Error('useEncrypt must be used within EncryptProvider');
  return ctx;
};

export const EncryptProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const navigate = useNavigate();
  const [isManyFiles, setIsManyFiles] = useState(false);

  useEffect(() => {
    window.electronAPI.onFilesToEncrypt((incomingFiles: string[]) => {
      setIsManyFiles(false);
      
      if (files.length > 0) {
        navigate('/encryption/file');
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
      navigate('/encryption/file');
    }
  }, [files]);

  return (
    <EncryptContext.Provider value={{ files, setFiles }}>
      {children}
    </EncryptContext.Provider>
  );
};