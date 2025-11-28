import React, { useEffect, useRef, useState } from "react";
import { lineSpinner, orbit } from "ldrs";
import { useClickOutside, useKeyPress } from "react-haiku";
import { Trans, useTranslation } from "react-i18next";

// info: Components
import SwitchToggler from "@/Components/ui/SwitchToggler";
import HistoryModal from "@/Components/HistoryModal";
import BottomInfo from "@/Components/BottomInfo";

// info: Contexts
import { useToast } from "@/Context/ToastContext";
import { useEmbed } from "@/Context/EmbedContext";
import InlineMessageBox from "@/Components/InlineMessageBox";
import { CheckAlgorithm } from "@/Utils/AlgorithmUtil";
import getDeviceOS from "@/Utils/getDeviceOS";

interface EmbedFile {
    originalPath: string;
    embeddedPath: {
        inputPath: string;
        output: string;
    } | string;
}

const DataHider: React.FC = () => {
    lineSpinner.register();
    orbit.register();
    const toast = useToast();
    const osType = getDeviceOS();

    const { t } = useTranslation();
    const [embeddedFiles, setEmbeddedFiles] = useState<EmbedFile[]>([]);
    const [badFiles, setBadFiles] = useState<string[]>([]);
    const [isEmbedding, setIsEmbedding] = useState<boolean>(false);
    const [isDisabled, setIsDisabled] = useState<boolean>(false);

    const { files, secretFiles, setFiles, setSecretFiles } = useEmbed();
    const en_method = localStorage.getItem("encryptionMethod");

    const embedFiles = async () => {
        CheckAlgorithm();
        if (!en_method) return;
        if (files.length === 0) return;

        setBadFiles([])
        setIsEmbedding(true);
        setIsDisabled(true);
        const extractedFilesResult: EmbedFile[] = [];

        let filesPath: string | string[];
        filesPath = files.map(file => file.path);

        let secretFilesPath: string | string[];
        secretFilesPath = secretFiles.map(file => file.path);

        try {
            const embeddedResults = await window.electronAPI.hideData(
                filesPath,
                secretFilesPath,
                en_method,
                isDeleteSource,
                isSaveHistory,
                isShareable
            );

            for (const result of embeddedResults) {
                const { inputPath, output } = result;

                if (output === "fail") {
                    setBadFiles((prev) =>
                        prev.includes(inputPath) ? prev : [...prev, inputPath]
                    );
                } else if (output === "canceled") {
                    setIsDisabled(false);
                    setBadFiles((prev) =>
                        prev.includes(inputPath) ? prev : [...prev, inputPath]
                    );
                } else if (output === "payload_too_large") {
                    toast(2, t('toast.payload_too_large_msg'), t('toast.payload_too_large_title'));
                } else {
                    extractedFilesResult.push({
                        originalPath: inputPath,
                        embeddedPath: result,
                    });
                    setIsDisabled(true);
                }
            }

            setEmbeddedFiles(extractedFilesResult);
        } catch (error: any) {
            return toast(0, error, t('toast.unexpected_error_title'));
        } finally {
            setIsEmbedding(false);
        }
    };

    useEffect(() => {
        if (badFiles.length > 0) {
            toast(0, t('toast.data_embedding_msg'), t('toast.data_embedding_title'));
        }
    }, [badFiles])

    const handleFileSelect = async () => {
        try {
            const selectedFiles = await window.electronAPI.selectDataHiderImage();

            if (selectedFiles && selectedFiles.length > 0) {
                const formattedFiles = selectedFiles.map((filePath) => ({
                    path: filePath,
                    name: filePath.split("\\").pop() || filePath.split("/").pop() || "",
                }));

                setIsDisabled(false);
                setFiles(formattedFiles);
                setBadFiles([])
            }
        } catch (error) {
            console.error("File selection error:", error);
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

                if (formattedFiles.length >= 21) {
                    return toast(2, t('toast.file_limit_msg'), t('toast.file_limit_title'));
                }

                setIsDisabled(false);
                setSecretFiles(formattedFiles);
                setBadFiles([])
            }
        } catch (error) {
            console.error("File selection error:", error);
        }
    };

    const combination = () => {
        if (!isEmbedding && files.length > 0 && !isDisabled) {
            embedFiles();
        }
    }

    useKeyPress(['Control', 'H'], combination);
    useKeyPress(['Meta', 'H'], combination);

    /* info: Config Functions */

    // Dropdown and Modal
    const [isHistoryModal, setHistoryModal] = useState(false);
    const [isConfigOpen, setConfigOpen] = useState(false);
    const ConfigRef = useRef(null)

    useClickOutside(ConfigRef, () => setConfigOpen(false));

    // Configs
    const [isShareable, setShareable] = useState(false);
    const [isSaveHistory, setSaveHistory] = useState(false);
    const [isDeleteSource, setDeleteSource] = useState(false);

    useEffect(() => {
        const contentShareable = localStorage.getItem('shareable.hider') === 'true';
        const contentHistory = localStorage.getItem('logs.hider') === 'true';
        const contentDeleteSource = localStorage.getItem('delete_source.hider') === 'true';

        setShareable(contentShareable)
        setSaveHistory(contentHistory);
        setDeleteSource(contentDeleteSource);
    }, [isSaveHistory, isDeleteSource])

    const HandleConfigOperation = (config: string) => {
        switch (config) {
            case "logs":
                localStorage.setItem('logs.hider', `${isSaveHistory ? false : true}`)
                setSaveHistory(!isSaveHistory)
                break;
            case "shareable":
                localStorage.setItem('shareable.hider', `${isShareable ? false : true}`)
                setShareable(!isShareable)
                break;
            case "delete_source":
                localStorage.setItem('delete_source.hider', `${isDeleteSource ? false : true}`)
                setDeleteSource(!isDeleteSource)
                break;
        }
    }

    /* info: Config Functions {END} */

    return (
        <>
            <div className="page_content">
                <p className="page_header">{t("data_embedding")}</p>
                <div className="page_config">
                    <button
                        className={`config_button re ${files.length >= 1 || secretFiles.length >= 1 ? 'show' : ''}`}
                        onClick={() => {
                            setFiles([]);
                            setSecretFiles([]);
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 256 256"><path d="M192.8,165.12,43.93,105.57A110.88,110.88,0,0,1,61.47,82.38a8,8,0,0,1,8.67-1.81L95.52,90.85a16,16,0,0,0,20.82-9l21-53.1c4.15-10,15.47-15.33,25.63-11.53a20,20,0,0,1,11.51,26.39L153.13,96.71a16,16,0,0,0,8.93,20.75L187,127.3a8,8,0,0,1,5,7.43V152A104.58,104.58,0,0,0,192.8,165.12Z" opacity="0.2"></path><path d="M235.5,216.81c-22.56-11-35.5-34.58-35.5-64.8V134.73a15.94,15.94,0,0,0-10.09-14.87L165,110a8,8,0,0,1-4.48-10.34l21.32-53a28,28,0,0,0-16.1-37,28.14,28.14,0,0,0-35.82,16,.61.61,0,0,0,0,.12L108.9,79a8,8,0,0,1-10.37,4.49L73.11,73.14A15.89,15.89,0,0,0,55.74,76.8C34.68,98.45,24,123.75,24,152a111.45,111.45,0,0,0,31.18,77.53A8,8,0,0,0,61,232H232a8,8,0,0,0,3.5-15.19ZM67.14,88l25.41,10.3a24,24,0,0,0,31.23-13.45l21-53c2.56-6.11,9.47-9.27,15.43-7a12,12,0,0,1,6.88,15.92L145.69,93.76a24,24,0,0,0,13.43,31.14L184,134.73V152c0,.33,0,.66,0,1L55.77,101.71A108.84,108.84,0,0,1,67.14,88Zm48,128a87.53,87.53,0,0,1-24.34-42,8,8,0,0,0-15.49,4,105.16,105.16,0,0,0,18.36,38H64.44A95.54,95.54,0,0,1,40,152a85.9,85.9,0,0,1,7.73-36.29l137.8,55.12c3,18,10.56,33.48,21.89,45.16Z"></path></svg>
                    </button>
                    <span className={`btn_line ${files.length >= 1 || secretFiles.length ? 'show' : ''}`}></span>
                    <button
                        className={`config_button re show`}
                        onClick={() => setHistoryModal(!isHistoryModal)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 256 256"><path d="M216,128a88,88,0,1,1-88-88A88,88,0,0,1,216,128Z" opacity="0.2"></path><path d="M136,80v43.47l36.12,21.67a8,8,0,0,1-8.24,13.72l-40-24A8,8,0,0,1,120,128V80a8,8,0,0,1,16,0Zm-8-48A95.44,95.44,0,0,0,60.08,60.15C52.81,67.51,46.35,74.59,40,82V64a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H72a8,8,0,0,0,0-16H49c7.15-8.42,14.27-16.35,22.39-24.57a80,80,0,1,1,1.66,114.75,8,8,0,1,0-11,11.64A96,96,0,1,0,128,32Z"></path></svg>
                    </button>
                    <div ref={ConfigRef} className="config_box">
                        <button
                            className={`config_button re show ${isConfigOpen ? 'active' : ''}`}
                            onClick={() => setConfigOpen(!isConfigOpen)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 256 256"><path d="M128,80a24,24,0,1,1-24-24A24,24,0,0,1,128,80Zm40,72a24,24,0,1,0,24,24A24,24,0,0,0,168,152Z" opacity="0.2"></path><path d="M40,88H73a32,32,0,0,0,62,0h81a8,8,0,0,0,0-16H135a32,32,0,0,0-62,0H40a8,8,0,0,0,0,16Zm64-24A16,16,0,1,1,88,80,16,16,0,0,1,104,64ZM216,168H199a32,32,0,0,0-62,0H40a8,8,0,0,0,0,16h97a32,32,0,0,0,62,0h17a8,8,0,0,0,0-16Zm-48,24a16,16,0,1,1,16-16A16,16,0,0,1,168,192Z"></path></svg>
                        </button>
                        <div className={`config_dropdown ${isConfigOpen ? 'show' : ''}`}>
                            <p className="title">{t("config.hide_data")}</p>
                            <span className="line"></span>
                            <div className="box re" onClick={() => HandleConfigOperation("shareable")}>
                                <div className="texts">
                                    <p className="name">
                                        {t("config.shareable.title")}
                                    </p>
                                    <p className="desc">{t("config.shareable.desc")}</p>
                                </div>
                                <SwitchToggler isOn={isShareable} onToggle={() => HandleConfigOperation("shareable")} />
                            </div>
                            <div className="box re" onClick={() => HandleConfigOperation("delete_source")}>
                                <div className="texts">
                                    <p className="name">
                                        {t("config.delete_source.title")}
                                    </p>
                                    <p className="desc">{t("config.delete_source.desc")}</p>
                                </div>
                                <SwitchToggler isOn={isDeleteSource} onToggle={() => HandleConfigOperation("delete_source")} />
                            </div>
                            <span className="line light"></span>
                            <div className="box re" onClick={() => HandleConfigOperation("logs")}>
                                <div className="texts">
                                    <p className="name">{t("config.history.title")}</p>
                                    <p className="desc">{t("config.history.desc")}</p>
                                </div>
                                <SwitchToggler isOn={isSaveHistory} onToggle={() => HandleConfigOperation("logs")} />
                            </div>
                        </div>
                    </div>
                </div>
                <>
                    <div
                        className="select_file re"
                        onClick={!isEmbedding ? handleFileSelect : undefined}
                    >
                        {files.length > 0 ? (
                            isEmbedding ? (
                                <div className="file_box">
                                    <div className="container">
                                        <l-line-spinner
                                            size={46}
                                            stroke={3}
                                            color={"currentColor"}
                                        />
                                    </div>
                                    <div className="content">
                                        <p>{t("embedding_files")}</p>
                                        {files.map((item, index) => (
                                            <p className="info" key={index}>{item.name}{index !== files.length - 1 ? ', ' : ''}</p>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="file_box">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="currentColor" viewBox="0 0 256 256"><path d="M104,152l48,72H24l36-56,16.36,25.45ZM152,32V88h56Z" opacity="0.2"></path><path d="M110.66,147.56a8,8,0,0,0-13.32,0L76.49,178.85l-9.76-15.18a8,8,0,0,0-13.46,0l-36,56A8,8,0,0,0,24,232H152a8,8,0,0,0,6.66-12.44ZM38.65,216,60,182.79l9.63,15a8,8,0,0,0,13.39.11l21-31.47L137.05,216Zm175-133.66-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40v88a8,8,0,0,0,16,0V40h88V88a8,8,0,0,0,8,8h48V216h-8a8,8,0,0,0,0,16h8a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160Z"></path></svg>
                                    <div className="content">
                                        <p>{t("choose_image_to_embed")}</p>
                                        {files.map((item, index) => (
                                            <p className="info" key={index}>{item.name}{index !== files.length - 1 ? ', ' : ''}</p>
                                        ))}
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="file_box">
                                <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="currentColor" viewBox="0 0 256 256"><path d="M104,152l48,72H24l36-56,16.36,25.45ZM152,32V88h56Z" opacity="0.2"></path><path d="M110.66,147.56a8,8,0,0,0-13.32,0L76.49,178.85l-9.76-15.18a8,8,0,0,0-13.46,0l-36,56A8,8,0,0,0,24,232H152a8,8,0,0,0,6.66-12.44ZM38.65,216,60,182.79l9.63,15a8,8,0,0,0,13.39.11l21-31.47L137.05,216Zm175-133.66-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40v88a8,8,0,0,0,16,0V40h88V88a8,8,0,0,0,8,8h48V216h-8a8,8,0,0,0,0,16h8a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160Z"></path></svg>
                                <div className="content">
                                    <p>{t("choose_image_to_embed")}</p>
                                    <p className="info">{t("no_files_selected")}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {
                        files.length > 0 && (
                            <div className="select_box">
                                <InlineMessageBox
                                    className="for_select"
                                    message={t('data_embedding_info')}
                                    type={1}
                                />

                                <div
                                    className="select_file re"
                                    onClick={!isEmbedding ? handleSecretFileSelect : undefined}
                                >
                                    {secretFiles.length > 0 ? (
                                        isEmbedding ? (
                                            <div className="file_box">
                                                <div className="container">
                                                    <l-line-spinner
                                                        size={46}
                                                        stroke={3}
                                                        color={"currentColor"}
                                                    />
                                                </div>
                                                <div className="content">
                                                    <p>{t("embedding_files")}</p>
                                                    <p className="info">{t("files_selected", { count: secretFiles.length })}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="file_box">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="currentColor" viewBox="0 0 256 256"><path d="M128,129.09V232a8,8,0,0,1-3.84-1l-88-48.18a8,8,0,0,1-4.16-7V80.18a8,8,0,0,1,.7-3.25Z" opacity="0.2"></path><path d="M223.68,66.15,135.68,18a15.88,15.88,0,0,0-15.36,0l-88,48.17a16,16,0,0,0-8.32,14v95.64a16,16,0,0,0,8.32,14l88,48.17a15.88,15.88,0,0,0,15.36,0l88-48.17a16,16,0,0,0,8.32-14V80.18A16,16,0,0,0,223.68,66.15ZM128,32l80.34,44-29.77,16.3-80.35-44ZM128,120,47.66,76l33.9-18.56,80.34,44ZM40,90l80,43.78v85.79L40,175.82Zm176,85.78h0l-80,43.79V133.82l32-17.51V152a8,8,0,0,0,16,0V107.55L216,90v85.77Z"></path></svg>
                                                <div className="content">
                                                    <p>{t("choose_files_to_embed")}</p>
                                                    <p className="info">{t("files_selected", { count: secretFiles.length })}</p>
                                                </div>
                                            </div>
                                        )
                                    ) : (
                                        <div className="file_box">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="currentColor" viewBox="0 0 256 256"><path d="M128,129.09V232a8,8,0,0,1-3.84-1l-88-48.18a8,8,0,0,1-4.16-7V80.18a8,8,0,0,1,.7-3.25Z" opacity="0.2"></path><path d="M223.68,66.15,135.68,18a15.88,15.88,0,0,0-15.36,0l-88,48.17a16,16,0,0,0-8.32,14v95.64a16,16,0,0,0,8.32,14l88,48.17a15.88,15.88,0,0,0,15.36,0l88-48.17a16,16,0,0,0,8.32-14V80.18A16,16,0,0,0,223.68,66.15ZM128,32l80.34,44-29.77,16.3-80.35-44ZM128,120,47.66,76l33.9-18.56,80.34,44ZM40,90l80,43.78v85.79L40,175.82Zm176,85.78h0l-80,43.79V133.82l32-17.51V152a8,8,0,0,0,16,0V107.55L216,90v85.77Z"></path></svg>
                                            <div className="content">
                                                <p>{t("choose_files_to_embed")}</p>
                                                <p className="info">{t("no_files_selected")}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    }

                    {
                        secretFiles.length >= 1 && (
                            <div className="files_list small">
                                {
                                    secretFiles.map((file, index) => (
                                        <div key={index} className="item">
                                            <p className="file_name">
                                                <span className="list_num">#{index + 1} »</span>
                                                <span className="name">{file.name}</span>
                                            </p>
                                            <div className="buttons">
                                                {
                                                    badFiles.some(badFile => secretFiles.some(secretFile => secretFile.name === badFile)) ? (
                                                        <span title="Error Code: BAD_EXTRACT" className="status error">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity="0.2"></path><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"></path></svg>
                                                        </span>
                                                    ) : !isEmbedding
                                                        && secretFiles.some(sFile => embeddedFiles.some(eFile => eFile.originalPath === sFile.path))
                                                        && embeddedFiles.some(eFile => eFile.embeddedPath !== "canceled") ? (
                                                        <span className="status success">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity="0.2"></path><path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path></svg>
                                                        </span>
                                                    ) : ('')
                                                }
                                                <button
                                                    className="cancel re"
                                                    onClick={() => {
                                                        const newFiles = secretFiles.filter((_, i) => i !== index);
                                                        setSecretFiles(newFiles);
                                                    }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z"></path></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        )
                    }

                    {
                        files.length >= 1 && secretFiles.length >= 1 && (
                            <button
                                onClick={() => embedFiles()}
                                className="page_main_button re"
                                disabled={isEmbedding || files.length <= 0 || isDisabled}
                            >
                                {isShareable ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M208,200a32,32,0,1,1-32-32A32,32,0,0,1,208,200ZM176,88a32,32,0,1,0-32-32A32,32,0,0,0,176,88Z" opacity="0.2"></path><path d="M176,160a39.89,39.89,0,0,0-28.62,12.09l-46.1-29.63a39.8,39.8,0,0,0,0-28.92l46.1-29.63a40,40,0,1,0-8.66-13.45l-46.1,29.63a40,40,0,1,0,0,55.82l46.1,29.63A40,40,0,1,0,176,160Zm0-128a24,24,0,1,1-24,24A24,24,0,0,1,176,32ZM64,152a24,24,0,1,1,24-24A24,24,0,0,1,64,152Zm112,72a24,24,0,1,1,24-24A24,24,0,0,1,176,224Z"></path></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M216,96V208a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V96a8,8,0,0,1,8-8H208A8,8,0,0,1,216,96Z" opacity="0.2"></path><path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM48,128H208v16H48Zm0,32H208v16H48ZM96,56a32,32,0,0,1,64,0V80H96ZM208,96v16H48V96Zm0,112H48V192H208v16Z"></path></svg>
                                )}
                                <div className="content">
                                    {
                                        isEmbedding ? (
                                            <l-orbit
                                                size="35"
                                                speed="1.5"
                                                color="currentColor"
                                            />
                                        ) : (
                                            <>
                                                <p>{t("embed_data")}</p>
                                                <span>
                                                    <Trans i18nKey="using_algo" values={{ method: en_method }}>
                                                        Using <span className="algo">{en_method}</span> Algorithm
                                                    </Trans>
                                                </span>
                                            </>
                                        )
                                    }
                                </div>
                                <span className="combination">{osType === 'mac' ? ('Command') : 'Ctrl'} + H</span>
                            </button>
                        )
                    }
                </>
                <BottomInfo />
                <HistoryModal isShown={isHistoryModal} onClose={setHistoryModal} operation="steg_in" />
            </div >
        </>
    );
};

export default DataHider;
