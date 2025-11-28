import React, { useEffect, useRef, useState } from "react";
import { lineSpinner, orbit } from "ldrs";
import { useClickOutside, useKeyPress } from "react-haiku";
import { Trans, useTranslation } from "react-i18next";

// info: Components
import SwitchToggler from "@/Components/ui/SwitchToggler";
import HistoryModal from "@/Components/HistoryModal";
import BottomInfo from "@/Components/BottomInfo";

// info: Contexts
import { useEncrypt } from "@/Context/EncryptContext";
import { useToast } from "@/Context/ToastContext";
import { CheckAlgorithm } from "@/Utils/AlgorithmUtil";
import getDeviceOS from "@/Utils/getDeviceOS";

interface EncryptedFile {
  originalPath: string;
  encryptedPath: {
    inputPath: string;
    output: string;
  } | string;
}

const FileEncryption: React.FC = () => {
  lineSpinner.register();
  orbit.register();
  const toast = useToast();
  const osType = getDeviceOS();

  const { t } = useTranslation();
  const [encryptedFiles, setEncryptedFiles] = useState<EncryptedFile[]>([]);
  const [badFiles, setBadFiles] = useState<string[]>([]);
  const [isEncrypting, setIsEncrypting] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  const { files, setFiles } = useEncrypt();
  const en_method = localStorage.getItem("encryptionMethod");

  const encryptFiles = async ({ singleFilePath }: { singleFilePath?: string } = {}) => {
    CheckAlgorithm();
    if (!en_method) return;
    if (files.length === 0) return;

    setBadFiles([])
    setIsEncrypting(true);
    setIsDisabled(true);
    const encryptedFilesResult: EncryptedFile[] = [];

    let filesPath: string | string[];
    if (singleFilePath) {
      filesPath = [singleFilePath];
    } else {
      filesPath = files.map(file => file.path);
    }

    try {
      const encryptedResults = await window.electronAPI.encryptFile(
        filesPath,
        en_method,
        isDeleteSource,
        isSaveHistory,
        isSingleOutput,
        isShareable
      );

      for (const result of encryptedResults) {
        const { inputPath, output } = result;

        if (output === "unknown_fail") {
          setBadFiles((prev) =>
            prev.includes(inputPath) ? prev : [...prev, inputPath]
          );
        } else if (output === "canceled") {
          setIsDisabled(false);
          setBadFiles((prev) =>
            prev.includes(inputPath) ? prev : [...prev, inputPath]
          );
        } else {
          encryptedFilesResult.push({
            originalPath: inputPath,
            encryptedPath: result,
          });
          setIsDisabled(true);
        }
      }

      setEncryptedFiles(encryptedFilesResult);
    } catch (error: any) {
      return toast(0, error, t('toast.unexpected_error_title'))
    } finally {
      setIsEncrypting(false);
    }
  };

  useEffect(() => {
    if (badFiles.length > 0) {
      toast(0, t('toast.file_encryption_msg'), t('toast.file_encryption_title'));
    }
  }, [badFiles])

  const handleFileSelect = async () => {
    try {
      const selectedFiles = await window.electronAPI.openFileDialog();

      if (selectedFiles && selectedFiles.length > 0) {
        const formattedFiles = selectedFiles.map((filePath) => ({
          path: filePath,
          name: filePath.split("\\").pop() || filePath.split("/").pop() || "",
        }));

        if (formattedFiles.length >= 21) {
          return toast(2, t('toast.file_limit_msg'), t('toast.file_limit_title'));
        }

        setIsDisabled(false);
        setFiles(formattedFiles);
        setBadFiles([])
      }
    } catch (error) {
      console.error("File selection error:", error);
    }
  };

  const combination = () => {
    if (!isEncrypting && files.length > 0 && !isDisabled) {
      encryptFiles();
    }
  }

  useKeyPress(['Control', 'E'], combination);
  useKeyPress(['Meta', 'E'], combination);

  /* info: Config Functions */

  // Dropdown and Modal
  const [isHistoryModal, setHistoryModal] = useState(false);
  const [isConfigOpen, setConfigOpen] = useState(false);
  const ConfigRef = useRef(null)

  useClickOutside(ConfigRef, () => setConfigOpen(false));

  // Configs
  const [isShareable, setShareable] = useState(false);
  const [isSaveHistory, setSaveHistory] = useState(false);
  const [isSingleOutput, setSingleOutput] = useState(false);
  const [isDeleteSource, setDeleteSource] = useState(false);

  useEffect(() => {
    const contentShareable = localStorage.getItem('shareable.efile') === 'true';
    const contentHistory = localStorage.getItem('logs.efile') === 'true';
    const contentSingleOutput = localStorage.getItem('single_output.efile') === 'true';
    const contentDeleteSource = localStorage.getItem('delete_source.efile') === 'true';

    setShareable(contentShareable)
    setSaveHistory(contentHistory);
    setSingleOutput(contentSingleOutput);
    setDeleteSource(contentDeleteSource);
  }, [isSaveHistory, isShareable, isSingleOutput, isDeleteSource])

  const HandleConfigOperation = (config: string) => {
    switch (config) {
      case "logs":
        localStorage.setItem('logs.efile', `${isSaveHistory ? false : true}`)
        setSaveHistory(!isSaveHistory)
        break;
      case "shareable":
        localStorage.setItem('shareable.efile', `${isShareable ? false : true}`)
        setShareable(!isShareable)
        break;
      case "single_output":
        localStorage.setItem('single_output.efile', `${isSingleOutput ? false : true}`)
        setSingleOutput(!isSingleOutput)
        break;
      case "delete_source":
        localStorage.setItem('delete_source.efile', `${isDeleteSource ? false : true}`)
        setDeleteSource(!isDeleteSource)
        break;
    }
  }

  /* info: Config Functions {END} */

  return (
    <>
      <div className="page_content">
        <p className="page_header">{t("file_encryption")}</p>
        <div className="page_config">
          <button
            className={`config_button re ${files.length >= 1 ? 'show' : ''}`}
            onClick={() => {
              setFiles([]);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 256 256"><path d="M192.8,165.12,43.93,105.57A110.88,110.88,0,0,1,61.47,82.38a8,8,0,0,1,8.67-1.81L95.52,90.85a16,16,0,0,0,20.82-9l21-53.1c4.15-10,15.47-15.33,25.63-11.53a20,20,0,0,1,11.51,26.39L153.13,96.71a16,16,0,0,0,8.93,20.75L187,127.3a8,8,0,0,1,5,7.43V152A104.58,104.58,0,0,0,192.8,165.12Z" opacity="0.2"></path><path d="M235.5,216.81c-22.56-11-35.5-34.58-35.5-64.8V134.73a15.94,15.94,0,0,0-10.09-14.87L165,110a8,8,0,0,1-4.48-10.34l21.32-53a28,28,0,0,0-16.1-37,28.14,28.14,0,0,0-35.82,16,.61.61,0,0,0,0,.12L108.9,79a8,8,0,0,1-10.37,4.49L73.11,73.14A15.89,15.89,0,0,0,55.74,76.8C34.68,98.45,24,123.75,24,152a111.45,111.45,0,0,0,31.18,77.53A8,8,0,0,0,61,232H232a8,8,0,0,0,3.5-15.19ZM67.14,88l25.41,10.3a24,24,0,0,0,31.23-13.45l21-53c2.56-6.11,9.47-9.27,15.43-7a12,12,0,0,1,6.88,15.92L145.69,93.76a24,24,0,0,0,13.43,31.14L184,134.73V152c0,.33,0,.66,0,1L55.77,101.71A108.84,108.84,0,0,1,67.14,88Zm48,128a87.53,87.53,0,0,1-24.34-42,8,8,0,0,0-15.49,4,105.16,105.16,0,0,0,18.36,38H64.44A95.54,95.54,0,0,1,40,152a85.9,85.9,0,0,1,7.73-36.29l137.8,55.12c3,18,10.56,33.48,21.89,45.16Z"></path></svg>
          </button>
          <span className={`btn_line ${files.length >= 1 ? 'show' : ''}`}></span>
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
              <p className="title">{t("config.efile")}</p>
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
              <div className="box re" onClick={() => HandleConfigOperation("single_output")}>
                <div className="texts">
                  <p className="name">
                    {t("config.single_output.title")}
                  </p>
                  <p className="desc">{t("config.single_output.desc")}</p>
                </div>
                <SwitchToggler isOn={isSingleOutput} onToggle={() => HandleConfigOperation("single_output")} />
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
            onClick={!isEncrypting ? handleFileSelect : undefined}
          >
            {files.length > 0 ? (
              isEncrypting ? (
                <div className="file_box">
                  <div className="container">
                    <l-line-spinner
                      size={46}
                      stroke={3}
                      color={"currentColor"}
                    />
                  </div>
                  <div className="content">
                    <p>{t("encrypting_files")}</p>
                    <p className="info">{t("files_selected", { count: files.length })}</p>
                  </div>
                </div>
              ) : (
                <div className="file_box">
                  <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="currentColor" viewBox="0 0 256 256"><path d="M208,72V184a8,8,0,0,1-8,8H176V104L136,64H80V40a8,8,0,0,1,8-8h80Z" opacity="0.2"></path><path d="M213.66,66.34l-40-40A8,8,0,0,0,168,24H88A16,16,0,0,0,72,40V56H56A16,16,0,0,0,40,72V216a16,16,0,0,0,16,16H168a16,16,0,0,0,16-16V200h16a16,16,0,0,0,16-16V72A8,8,0,0,0,213.66,66.34ZM168,216H56V72h76.69L168,107.31v84.53c0,.06,0,.11,0,.16s0,.1,0,.16V216Zm32-32H184V104a8,8,0,0,0-2.34-5.66l-40-40A8,8,0,0,0,136,56H88V40h76.69L200,75.31Zm-56-32a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h48A8,8,0,0,1,144,152Zm0,32a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h48A8,8,0,0,1,144,184Z"></path></svg>
                  <div className="content">
                    <p>{t("select_files_to_encrypt")}</p>
                    <p className="info">{t("files_selected", { count: files.length })}</p>
                  </div>
                </div>
              )
            ) : (
              <div className="file_box">
                <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="currentColor" viewBox="0 0 256 256"><path d="M208,72V184a8,8,0,0,1-8,8H176V104L136,64H80V40a8,8,0,0,1,8-8h80Z" opacity="0.2"></path><path d="M213.66,66.34l-40-40A8,8,0,0,0,168,24H88A16,16,0,0,0,72,40V56H56A16,16,0,0,0,40,72V216a16,16,0,0,0,16,16H168a16,16,0,0,0,16-16V200h16a16,16,0,0,0,16-16V72A8,8,0,0,0,213.66,66.34ZM168,216H56V72h76.69L168,107.31v84.53c0,.06,0,.11,0,.16s0,.1,0,.16V216Zm32-32H184V104a8,8,0,0,0-2.34-5.66l-40-40A8,8,0,0,0,136,56H88V40h76.69L200,75.31Zm-56-32a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h48A8,8,0,0,1,144,152Zm0,32a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h48A8,8,0,0,1,144,184Z"></path></svg>
                <div className="content">
                  <p>{t("select_files_to_encrypt")}</p>
                  <p className="info">{t("no_files_selected")}</p>
                </div>
              </div>
            )}
          </div>

          {
            files.length > 0 && (
              <div className="files_list">
                {
                  files.map((file, index) => (
                    <div key={index} className="item">
                      <p className="file_name">
                        <span className="list_num">#{index + 1} »</span>
                        <span className="name">{file.name}</span>
                      </p>
                      <div className="buttons">
                        {
                          badFiles.some(badFile => badFile === file.path) ? (
                            <span title="Error Code: BAD_ENCRYPT" className="status error">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity="0.2"></path><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"></path></svg>
                            </span>
                          ) : !isEncrypting && encryptedFiles.some(eFile => eFile.originalPath === file.path) && encryptedFiles.some(eFile => eFile.encryptedPath !== "encryption_canceled") ? (
                            <span className="status success">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity="0.2"></path><path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path></svg>
                            </span>
                          ) : ('')
                        }
                        <button
                          className="cancel re"
                          onClick={() => {
                            const newFiles = files.filter((_, i) => i !== index);
                            setFiles(newFiles);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z"></path></svg>
                        </button>
                        {
                          files.length > 1 && (
                            <button
                              className="submit re"
                              disabled={isEncrypting || files.length <= 0}
                              onClick={() => encryptFiles({ singleFilePath: file.path })}
                            >
                              {t('encrypt_file')}
                            </button>
                          )
                        }
                      </div>
                    </div>
                  ))
                }
              </div>
            )
          }

          {
            files.length >= 1 && (
              <button
                onClick={() => encryptFiles()}
                className="page_main_button re"
                disabled={isEncrypting || files.length <= 0 || isDisabled}
              >
                {isShareable ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M208,200a32,32,0,1,1-32-32A32,32,0,0,1,208,200ZM176,88a32,32,0,1,0-32-32A32,32,0,0,0,176,88Z" opacity="0.2"></path><path d="M176,160a39.89,39.89,0,0,0-28.62,12.09l-46.1-29.63a39.8,39.8,0,0,0,0-28.92l46.1-29.63a40,40,0,1,0-8.66-13.45l-46.1,29.63a40,40,0,1,0,0,55.82l46.1,29.63A40,40,0,1,0,176,160Zm0-128a24,24,0,1,1-24,24A24,24,0,0,1,176,32ZM64,152a24,24,0,1,1,24-24A24,24,0,0,1,64,152Zm112,72a24,24,0,1,1,24-24A24,24,0,0,1,176,224Z"></path></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M216,96V208a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V96a8,8,0,0,1,8-8H208A8,8,0,0,1,216,96Z" opacity="0.2"></path><path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM48,128H208v16H48Zm0,32H208v16H48ZM96,56a32,32,0,0,1,64,0V80H96ZM208,96v16H48V96Zm0,112H48V192H208v16Z"></path></svg>
                )}
                <div className="content">
                  {
                    isEncrypting ? (
                      <l-orbit
                        size="35"
                        speed="1.5"
                        color="currentColor"
                      />
                    ) : (
                      <>
                        <p>
                          {
                            files.length > 1 ? t("encrypt_all_files") : t('encrypt_file')
                          }
                        </p>
                        <span>
                          <Trans i18nKey="using_algo" values={{ method: en_method }}>
                            Using <span className="algo">{en_method}</span> Algorithm
                          </Trans>
                        </span>
                      </>
                    )
                  }
                </div>
                <span className="combination">{osType === 'mac' ? ('Command') : 'Ctrl'} + E</span>
              </button>
            )
          }

        </>
        <BottomInfo />
        <HistoryModal isShown={isHistoryModal} onClose={setHistoryModal} operation="efile" />
      </div >
    </>
  );
};

export default FileEncryption;