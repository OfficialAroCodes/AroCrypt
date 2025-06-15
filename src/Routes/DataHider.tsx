import BottomInfo from "@/Components/BottomInfo";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface HidingDataFile {
    originalPath: string;
    hidingDataPath: string | { outputPath: string; response: any };
}

interface File {
    path: string;
    name: string;
}

const DataHider = () => {
    const { t } = useTranslation();
    const [error, setError] = useState<string | null>(null);
    const en_method = localStorage.getItem("encryptionMethod");

    const [imageFile, setImageFile] = useState<File[]>([]);
    const [secretFiles, setSecretFiles] = useState<File[]>([])
    const [readyFiles, setReadyFiles] = useState<HidingDataFile[]>([]);
    const [isInProgress, setIsInProgress] = useState<boolean>(false);

    const handleFileSelect = async () => {
        try {
            const selectedFiles = await window.electronAPI.selectDataHiderImage();

            if (selectedFiles && selectedFiles.length > 0) {
                const formattedFiles = selectedFiles.map((filePath) => ({
                    path: filePath,
                    name: filePath.split("\\").pop() || filePath.split("/").pop() || "",
                }));

                setImageFile(formattedFiles);
                setError(null);
            }
        } catch (error) {
            console.error("File selection error:", error);
            setError(t("file_selection_error"));
        }
    };

    const handleSecretFileSelect = async () => {
        try {
            const selectedFiles = await window.electronAPI.selectDataHiderSecretFiles();

            if (selectedFiles && selectedFiles.length > 0) {
                const formattedFiles = selectedFiles.map((filePath) => ({
                    path: filePath,
                    name: filePath.split("\\").pop() || filePath.split("/").pop() || "",
                }));

                setSecretFiles(formattedFiles);
                setError(null);
            }
        } catch (error) {
            console.error("File selection error:", error);
            setError(t('embed_data_error'));
        }
    };

    const handleSubmit = async () => {
        if (!en_method) return;

        if (!imageFile || imageFile.length === 0 || secretFiles.length === 0) {
            setError(t("no_files_selected"));
            return;
        }

        setIsInProgress(true);

        try {
            const imagePath = imageFile[0].path;
            const secretFilesPaths = secretFiles.map(f => f.path);

            const hidingDataPath = await window.electronAPI.hideData(
                imagePath,
                secretFilesPaths,
                en_method
            );

            if (hidingDataPath === "hiding_canceled") return;

            setReadyFiles([
                {
                    originalPath: imagePath,
                    hidingDataPath,
                },
            ]);

            setImageFile([]);
            setSecretFiles([]);
        } catch (err: any) {
            if (err === "payload_too_large" || err?.message?.includes("payload_too_large")) {
                setError(t('payload_too_large'));
            } else {
                setError(t('embed_data_error'));
                console.error(err);
            }
        } finally {
            setIsInProgress(false);
        }
    };


    return (
        <>
            <div className="page_content">
                <p className="page_header">{t('data_embedding')}</p>
                <p className="page_info">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity="0.2"></path><path d="M144,176a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176Zm88-48A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128ZM124,96a12,12,0,1,0-12-12A12,12,0,0,0,124,96Z"></path></svg>
                    {t('data_embedding_info')}
                </p>
                <>
                    <div
                        className={`select_file re ${imageFile.length > 0 ? 'active' : ''}`}
                        onClick={!isInProgress ? handleFileSelect : undefined}
                    >
                        {imageFile.length > 0 ? (
                            isInProgress ? (
                                <div className="file_box">
                                    <div className="container">
                                        <div className="line"></div>
                                        <div className="line"></div>
                                        <div className="line"></div>
                                        <div className="line"></div>
                                        <div className="line"></div>
                                        <div className="line"></div>
                                        <div className="line"></div>
                                        <div className="line"></div>
                                        <div className="line"></div>
                                        <div className="line"></div>
                                        <div className="line"></div>
                                        <div className="line"></div>
                                    </div>
                                    <div className="content">
                                        <p>{t('embedding_files')}</p>
                                        <div className="files_list">
                                            {imageFile.map((item, index) => (
                                                <p key={index}>{item.name}{index !== imageFile.length - 1 ? ', ' : ''}</p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="file_box">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="currentColor" viewBox="0 0 256 256"><path d="M208,40H80a8,8,0,0,0-8,8V176a8,8,0,0,0,8,8H96.69l77.65-77.66a8,8,0,0,1,11.32,0L216,136.69V48A8,8,0,0,0,208,40Zm-88,64a16,16,0,1,1,16-16A16,16,0,0,1,120,104Z" opacity="0.2"></path><path d="M208,32H80A16,16,0,0,0,64,48V64H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V192h16a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM80,48H208v69.38l-16.7-16.7a16,16,0,0,0-22.62,0L93.37,176H80Zm96,160H48V80H64v96a16,16,0,0,0,16,16h96Zm32-32H116l64-64,28,28v36Zm-88-64A24,24,0,1,0,96,88,24,24,0,0,0,120,112Zm0-32a8,8,0,1,1-8,8A8,8,0,0,1,120,80Z"></path></svg>
                                    <div className="content">
                                        <p>{t("files_selected", { count: imageFile.length })}</p>
                                        <div className="files_list">
                                            {imageFile.map((item, index) => (
                                                <p key={index}>{item.name}{index !== imageFile.length - 1 ? ', ' : ''}</p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="file_box">
                                <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="currentColor" viewBox="0 0 256 256"><path d="M208,40H48a8,8,0,0,0-8,8V208a8,8,0,0,0,8,8h8.69L166.34,106.34a8,8,0,0,1,11.32,0L216,144.69V48A8,8,0,0,0,208,40ZM96,112a16,16,0,1,1,16-16A16,16,0,0,1,96,112Z" opacity="0.2"></path><path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM48,48H208v77.38l-24.69-24.7a16,16,0,0,0-22.62,0L53.37,208H48ZM208,208H76l96-96,36,36v60ZM96,120A24,24,0,1,0,72,96,24,24,0,0,0,96,120Zm0-32a8,8,0,1,1-8,8A8,8,0,0,1,96,88Z"></path></svg>
                                <div className="content">
                                    <p>{t('choose_image_to_embed')}</p>
                                    <div className="files_list">
                                        <p>{t('embed_data_info')}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {
                        imageFile.length > 0 && (
                            <div
                                className={`select_file re ${secretFiles.length > 0 ? 'active' : ''}`}
                                onClick={!isInProgress ? handleSecretFileSelect : undefined}
                            >
                                {secretFiles.length > 0 ? (
                                    <div className="file_box">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="currentColor" viewBox="0 0 256 256"><path d="M208,88H152V32Z" opacity="0.2"></path><path d="M80,224a8,8,0,0,1-8,8H56a16,16,0,0,1-16-16V184a8,8,0,0,1,16,0v32H72A8,8,0,0,1,80,224ZM216,88v48a8,8,0,0,1-16,0V96H152a8,8,0,0,1-8-8V40H120a8,8,0,0,1,0-16h32a8,8,0,0,1,5.66,2.34l56,56A8,8,0,0,1,216,88Zm-56-8h28.69L160,51.31ZM80,24H56A16,16,0,0,0,40,40V64a8,8,0,0,0,16,0V40H80a8,8,0,0,0,0-16ZM208,168a8,8,0,0,0-8,8v40h-8a8,8,0,0,0,0,16h8a16,16,0,0,0,16-16V176A8,8,0,0,0,208,168ZM48,152a8,8,0,0,0,8-8V104a8,8,0,0,0-16,0v40A8,8,0,0,0,48,152Zm104,64H112a8,8,0,0,0,0,16h40a8,8,0,0,0,0-16Z"></path></svg>
                                        <div className="content">
                                            <p>{t("files_selected", { count: secretFiles.length })}</p>
                                            <div className="files_list">
                                                {secretFiles.map((item, index) => (
                                                    <p key={index}>{item.name}{index !== secretFiles.length - 1 ? ', ' : ''}</p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="file_box">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="currentColor" viewBox="0 0 256 256"><path d="M208,72V184a8,8,0,0,1-8,8H176V104L136,64H80V40a8,8,0,0,1,8-8h80Z" opacity="0.2"></path><path d="M213.66,66.34l-40-40A8,8,0,0,0,168,24H88A16,16,0,0,0,72,40V56H56A16,16,0,0,0,40,72V216a16,16,0,0,0,16,16H168a16,16,0,0,0,16-16V200h16a16,16,0,0,0,16-16V72A8,8,0,0,0,213.66,66.34ZM168,216H56V72h76.69L168,107.31v84.53c0,.06,0,.11,0,.16s0,.1,0,.16V216Zm32-32H184V104a8,8,0,0,0-2.34-5.66l-40-40A8,8,0,0,0,136,56H88V40h76.69L200,75.31Zm-56-32a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h48A8,8,0,0,1,144,152Zm0,32a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h48A8,8,0,0,1,144,184Z"></path></svg>
                                        <div className="content">
                                            <p>{t('choose_files_to_embed')}</p>
                                            <div className="files_list">
                                                <p>{t('no_files_selected')}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    }

                    <button
                        onClick={handleSubmit}
                        className="main_button re"
                        disabled={isInProgress || imageFile.length <= 0 || secretFiles.length <= 0}
                    >
                        {t('embed_data')}
                    </button>

                    {error && (
                        <div className="page_error_message">
                            <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" fill="currentColor" viewBox="0 0 256 256"><path d="M232,128c0,12.51-17.82,21.95-22.68,33.69-4.68,11.32,1.42,30.64-7.78,39.85s-28.53,3.1-39.85,7.78C150,214.18,140.5,232,128,232s-22-17.82-33.69-22.68c-11.32-4.68-30.65,1.42-39.85-7.78s-3.1-28.53-7.78-39.85C41.82,150,24,140.5,24,128s17.82-22,22.68-33.69C51.36,83,45.26,63.66,54.46,54.46S83,51.36,94.31,46.68C106.05,41.82,115.5,24,128,24S150,41.82,161.69,46.68c11.32,4.68,30.65-1.42,39.85,7.78s3.1,28.53,7.78,39.85C214.18,106.05,232,115.5,232,128Z" opacity="0.2"></path><path d="M225.86,102.82c-3.77-3.94-7.67-8-9.14-11.57-1.36-3.27-1.44-8.69-1.52-13.94-.15-9.76-.31-20.82-8-28.51s-18.75-7.85-28.51-8c-5.25-.08-10.67-.16-13.94-1.52-3.56-1.47-7.63-5.37-11.57-9.14C146.28,23.51,138.44,16,128,16s-18.27,7.51-25.18,14.14c-3.94,3.77-8,7.67-11.57,9.14C88,40.64,82.56,40.72,77.31,40.8c-9.76.15-20.82.31-28.51,8S41,67.55,40.8,77.31c-.08,5.25-.16,10.67-1.52,13.94-1.47,3.56-5.37,7.63-9.14,11.57C23.51,109.72,16,117.56,16,128s7.51,18.27,14.14,25.18c3.77,3.94,7.67,8,9.14,11.57,1.36,3.27,1.44,8.69,1.52,13.94.15,9.76.31,20.82,8,28.51s18.75,7.85,28.51,8c5.25.08,10.67.16,13.94,1.52,3.56,1.47,7.63,5.37,11.57,9.14C109.72,232.49,117.56,240,128,240s18.27-7.51,25.18-14.14c3.94-3.77,8-7.67,11.57-9.14,3.27-1.36,8.69-1.44,13.94-1.52,9.76-.15,20.82-.31,28.51-8s7.85-18.75,8-28.51c.08-5.25.16-10.67,1.52-13.94,1.47-3.56,5.37-7.63,9.14-11.57C232.49,146.28,240,138.44,240,128S232.49,109.73,225.86,102.82Zm-11.55,39.29c-4.79,5-9.75,10.17-12.38,16.52-2.52,6.1-2.63,13.07-2.73,19.82-.1,7-.21,14.33-3.32,17.43s-10.39,3.22-17.43,3.32c-6.75.1-13.72.21-19.82,2.73-6.35,2.63-11.52,7.59-16.52,12.38S132,224,128,224s-9.15-4.92-14.11-9.69-10.17-9.75-16.52-12.38c-6.1-2.52-13.07-2.63-19.82-2.73-7-.1-14.33-.21-17.43-3.32s-3.22-10.39-3.32-17.43c-.1-6.75-.21-13.72-2.73-19.82-2.63-6.35-7.59-11.52-12.38-16.52S32,132,32,128s4.92-9.15,9.69-14.11,9.75-10.17,12.38-16.52c2.52-6.1,2.63-13.07,2.73-19.82.1-7,.21-14.33,3.32-17.43S70.51,56.9,77.55,56.8c6.75-.1,13.72-.21,19.82-2.73,6.35-2.63,11.52-7.59,16.52-12.38S124,32,128,32s9.15,4.92,14.11,9.69,10.17,9.75,16.52,12.38c6.1,2.52,13.07,2.63,19.82,2.73,7,.1,14.33.21,17.43,3.32s3.22,10.39,3.32,17.43c.1,6.75.21,13.72,2.73,19.82,2.63,6.35,7.59,11.52,12.38,16.52S224,124,224,128,219.08,137.15,214.31,142.11ZM120,136V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"></path></svg>
                            <div>
                                <p className="page_error_header">{t('unable_embed_data')}</p>
                                <p className="page_error_info">{error}</p>
                            </div>
                        </div>
                    )}

                    {readyFiles.length > 0 && (
                        <div className="files_log">
                            <span className="line"></span>
                            <table
                                className={`files_table ${imageFile.length > 0 ? "hide" : ""}`}
                            >
                                <thead>
                                    <tr>
                                        <th>{t('original_files')}</th>
                                        <th>{t('result')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {readyFiles.map((file, index) => (
                                        <tr key={index}>
                                            <td>{file.originalPath.split("\\").pop()}</td>
                                            <td>
                                                {typeof file.hidingDataPath === 'string'
                                                    ? file.hidingDataPath.split("\\").pop()
                                                    : file.hidingDataPath.outputPath?.split("\\").pop() || 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
                <BottomInfo />
            </div>
        </>
    );
};

export default DataHider;
