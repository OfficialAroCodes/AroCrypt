import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface EncryptedFile {
    originalPath: string;
    encryptedPath: string;
}

interface File {
    path: string;
    name: string;
}

const FileEncryptionForm: React.FC = () => {
    const { t } = useTranslation();
    const [files, setFiles] = useState<File[]>([]);
    const [encryptedFiles, setEncryptedFiles] = useState<EncryptedFile[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isEncrypting, setIsEncrypting] = useState<boolean>(false);
    const [isDisabled, setIsDisabled] = useState<boolean>(false);
    const en_method = localStorage.getItem("encryptionMethod") || "aes-256-cbc";

    const handleFileSelect = async () => {
        try {
            const selectedFiles = await window.electronAPI.openFileDialog();

            if (selectedFiles && selectedFiles.length > 0) {
                const formattedFiles = selectedFiles.map(filePath => ({
                    path: filePath,
                    name: filePath.split('\\').pop() || filePath.split('/').pop() || ''
                }));

                setFiles(formattedFiles);
                setError(null);
            }
        } catch (error) {
            console.error('File selection error:', error);
            setError(t('file_selection_error'));
        }
    };

    const encryptFiles = async () => {
        if (files.length === 0) {
            setError(t('no_files_selected'));
            return;
        }
        setIsEncrypting(true);
        const encryptedFilesResult: EncryptedFile[] = [];

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                try {
                    const encryptedPath = await window.electronAPI.encryptFile(
                        file.path,
                        en_method
                    );

                    encryptedFilesResult.push({
                        originalPath: file.path,
                        encryptedPath: encryptedPath
                    });

                    if (encryptedPath === "encryption_canceled") {
                        return;
                    }

                } catch (fileError) {
                    if ((fileError as any).message === 'File encryption canceled') {
                        console.log(`Encryption canceled for file: ${file.path}`);
                        continue;
                    }
                    throw fileError;
                }
            }

            setEncryptedFiles(encryptedFilesResult);
            setFiles([]);
        } catch (err) {
            setError(t('encryption_failed'));
            console.error(err);
        } finally {
            setIsEncrypting(false);
        }
    };

    return (
        <>
            <div
                className="dropzone re"
                onClick={!isEncrypting ? (handleFileSelect) : undefined}
            >
                {files.length > 0 ? (
                    isEncrypting ? (
                        <>
                            <div className="container">
                                <div className="dot"></div>
                                <div className="dot"></div>
                                <div className="dot"></div>
                                <div className="dot"></div>
                                <div className="dot"></div>
                                <div className="dot"></div>
                                <div className="dot"></div>
                                <div className="dot"></div>
                                <div className="dot"></div>
                                <div className="dot"></div>
                                <div className="dot"></div>
                                <div className="dot"></div>
                                <div className="dot"></div>
                                <div className="dot"></div>
                                <div className="dot"></div>
                                <div className="dot"></div>
                            </div>
                            <p>{t("encrypting_progress")}</p>
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M18.333 6a3.667 3.667 0 0 1 3.667 3.667v8.666a3.667 3.667 0 0 1 -3.667 3.667h-8.666a3.667 3.667 0 0 1 -3.667 -3.667v-8.666a3.667 3.667 0 0 1 3.667 -3.667zm-3.333 -4c1.094 0 1.828 .533 2.374 1.514a1 1 0 1 1 -1.748 .972c-.221 -.398 -.342 -.486 -.626 -.486h-10c-.548 0 -1 .452 -1 1v9.998c0 .32 .154 .618 .407 .805l.1 .065a1 1 0 1 1 -.99 1.738a3 3 0 0 1 -1.517 -2.606v-10c0 -1.652 1.348 -3 3 -3zm1.293 9.293l-3.293 3.292l-1.293 -1.292a1 1 0 0 0 -1.414 1.414l2 2a1 1 0 0 0 1.414 0l4 -4a1 1 0 0 0 -1.414 -1.414" /></svg>
                            <p>{t('files_selected', { count: files.length })}</p>
                        </>
                    )
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M15 3v4a1 1 0 0 0 1 1h4" /><path d="M18 17h-7a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h4l5 5v7a2 2 0 0 1 -2 2z" /><path d="M16 17v2a2 2 0 0 1 -2 2h-7a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h2" /></svg>
                        <p>{t('en_no_files_selected')}</p>
                    </>
                )}
            </div>

            {
                files.length > 0 ? (
                    <button
                        onClick={encryptFiles}
                        className="main_button re"
                        disabled={isEncrypting || isDisabled}
                    >
                        {t('encrypt_files')}
                    </button>
                ) : ('')
            }

            {
                error && (
                    <div className="page_error_message">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="currentColor"  ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 2l.642 .005l.616 .017l.299 .013l.579 .034l.553 .046c4.687 .455 6.65 2.333 7.166 6.906l.03 .29l.046 .553l.041 .727l.006 .15l.017 .617l.005 .642l-.005 .642l-.017 .616l-.013 .299l-.034 .579l-.046 .553c-.455 4.687 -2.333 6.65 -6.906 7.166l-.29 .03l-.553 .046l-.727 .041l-.15 .006l-.617 .017l-.642 .005l-.642 -.005l-.616 -.017l-.299 -.013l-.579 -.034l-.553 -.046c-4.687 -.455 -6.65 -2.333 -7.166 -6.906l-.03 -.29l-.046 -.553l-.041 -.727l-.006 -.15l-.017 -.617l-.004 -.318v-.648l.004 -.318l.017 -.616l.013 -.299l.034 -.579l.046 -.553c.455 -4.687 2.333 -6.65 6.906 -7.166l.29 -.03l.553 -.046l.727 -.041l.15 -.006l.617 -.017c.21 -.003 .424 -.005 .642 -.005zm.01 13l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-.01 -8a1 1 0 0 0 -.993 .883l-.007 .117v4l.007 .117a1 1 0 0 0 1.986 0l.007 -.117v-4l-.007 -.117a1 1 0 0 0 -.993 -.883z" /></svg>
                        <div>
                            <p className='page_error_header'>{t('encryption_failed')}</p>
                            <p className='page_error_info'>{error}</p>
                        </div>
                    </div>
                )
            }

            {encryptedFiles.length > 0 && (
                <>
                    <div className="SeparatorBox">
                        <span></span>
                        <p className="SectionName">{t('encrypted_files_history')}</p>
                        <span></span>
                    </div>
                    <table className={`files_table ${files.length > 0 ? "hide" : ""}`}>
                        <thead>
                            <tr>
                                <th>{t("original_files")}</th>
                                <th>{t("encrypted_files")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {encryptedFiles.map((file, index) => (
                                <tr key={index}>
                                    <td>{file.originalPath.split('\\').pop()}</td>
                                    <td>{file.encryptedPath.split('\\').pop()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </>
    );
};

export default FileEncryptionForm;