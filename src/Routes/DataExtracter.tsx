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
import { useExtract } from "@/Context/ExtractContext";
import { CheckAlgorithm } from "@/Utils/AlgorithmUtil";
import getDeviceOS from "@/Utils/getDeviceOS";

interface ExtractFile {
  originalPath: string;
  extractedPath:
    | {
        inputPath: string;
        output: string;
      }
    | string;
}

const DataExtractor: React.FC = () => {
  lineSpinner.register();
  orbit.register();
  const toast = useToast();
  const osType = getDeviceOS();

  const { t } = useTranslation();
  const [extractedFiles, setExtractedFiles] = useState<ExtractFile[]>([]);
  const [badFiles, setBadFiles] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  const { files, setFiles } = useExtract();
  const de_method = localStorage.getItem("decryptionMethod");

  const extractFiles = async ({
    singleFilePath,
  }: { singleFilePath?: string } = {}) => {
    CheckAlgorithm();
    if (!de_method) return;
    if (files.length === 0) return;

    setBadFiles([]);
    setIsExtracting(true);
    setIsDisabled(true);
    const extractedFilesResult: ExtractFile[] = [];

    let filesPath: string | string[];
    if (singleFilePath) {
      filesPath = [singleFilePath];
    } else {
      filesPath = files.map((file) => file.path);
    }

    try {
      const extractedResults = await window.electronAPI.extractHiddenData(
        filesPath,
        de_method,
        isDeleteSource,
        isSaveHistory,
        isSingleOutput,
      );

      for (const result of extractedResults) {
        const { inputPath, output } = result;

        if (output === "fail") {
          setBadFiles((prev) =>
            prev.includes(inputPath) ? prev : [...prev, inputPath],
          );
        } else if (output === "canceled") {
          setIsDisabled(false);
          setBadFiles((prev) =>
            prev.includes(inputPath) ? prev : [...prev, inputPath],
          );
        } else {
          extractedFilesResult.push({
            originalPath: inputPath,
            extractedPath: result,
          });
          setIsDisabled(true);
        }
      }

      setExtractedFiles(extractedFilesResult);
    } catch (error: any) {
      return toast(0, error, t("toast.unexpected_error_title"));
    } finally {
      setIsExtracting(false);
    }
  };

  useEffect(() => {
    if (badFiles.length > 0) {
      toast(
        0,
        t("toast.data_extraction_msg"),
        t("toast.data_extraction_title"),
      );
    }
  }, [badFiles]);

  const handleFileSelect = async () => {
    try {
      const selectedFiles = await window.electronAPI.selectDataExtractorImage();

      if (selectedFiles && selectedFiles.length > 0) {
        const formattedFiles = selectedFiles.map((filePath) => ({
          path: filePath,
          name: filePath.split("\\").pop() || filePath.split("/").pop() || "",
        }));

        if (formattedFiles.length >= 21) {
          return toast(
            2,
            t("toast.file_limit_msg"),
            t("toast.file_limit_title"),
          );
        }

        setIsDisabled(false);
        setFiles(formattedFiles);
        setBadFiles([]);
      }
    } catch (error) {
      console.error("File selection error:", error);
    }
  };

  const combination = () => {
    if (!isExtracting && files.length > 0 && !isDisabled) {
      extractFiles();
    }
  };

  useKeyPress(["Control", "G"], combination);
  useKeyPress(["Meta", "G"], combination);

  /* info: Config Functions */

  // Dropdown and Modal
  const [isHistoryModal, setHistoryModal] = useState(false);
  const [isConfigOpen, setConfigOpen] = useState(false);
  const ConfigRef = useRef(null);

  useClickOutside(ConfigRef, () => setConfigOpen(false));

  // Configs
  const [isSaveHistory, setSaveHistory] = useState(false);
  const [isSingleOutput, setSingleOutput] = useState(false);
  const [isDeleteSource, setDeleteSource] = useState(false);

  useEffect(() => {
    const contentHistory = localStorage.getItem("logs.extracter") === "true";
    const contentSingleOutput =
      localStorage.getItem("single_output.extracter") === "true";
    const contentDeleteSource =
      localStorage.getItem("delete_source.extracter") === "true";

    setSaveHistory(contentHistory);
    setSingleOutput(contentSingleOutput);
    setDeleteSource(contentDeleteSource);
  }, [isSaveHistory, isSingleOutput, isDeleteSource]);

  const HandleConfigOperation = (config: string) => {
    switch (config) {
      case "logs":
        localStorage.setItem(
          "logs.extracter",
          `${isSaveHistory ? false : true}`,
        );
        setSaveHistory(!isSaveHistory);
        break;
      case "single_output":
        localStorage.setItem(
          "single_output.extracter",
          `${isSingleOutput ? false : true}`,
        );
        setSingleOutput(!isSingleOutput);
        break;
      case "delete_source":
        localStorage.setItem(
          "delete_source.extracter",
          `${isDeleteSource ? false : true}`,
        );
        setDeleteSource(!isDeleteSource);
        break;
    }
  };

  /* info: Config Functions {END} */

  return (
    <>
      <div className="page_content">
        <p className="page_header">{t("data_extractor")}</p>
        <div className="page_config">
          <button
            className={`config_button re ${files.length >= 1 ? "show" : ""}`}
            onClick={() => {
              setFiles([]);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path
                d="M192.8,165.12,43.93,105.57A110.88,110.88,0,0,1,61.47,82.38a8,8,0,0,1,8.67-1.81L95.52,90.85a16,16,0,0,0,20.82-9l21-53.1c4.15-10,15.47-15.33,25.63-11.53a20,20,0,0,1,11.51,26.39L153.13,96.71a16,16,0,0,0,8.93,20.75L187,127.3a8,8,0,0,1,5,7.43V152A104.58,104.58,0,0,0,192.8,165.12Z"
                opacity="0.2"
              ></path>
              <path d="M235.5,216.81c-22.56-11-35.5-34.58-35.5-64.8V134.73a15.94,15.94,0,0,0-10.09-14.87L165,110a8,8,0,0,1-4.48-10.34l21.32-53a28,28,0,0,0-16.1-37,28.14,28.14,0,0,0-35.82,16,.61.61,0,0,0,0,.12L108.9,79a8,8,0,0,1-10.37,4.49L73.11,73.14A15.89,15.89,0,0,0,55.74,76.8C34.68,98.45,24,123.75,24,152a111.45,111.45,0,0,0,31.18,77.53A8,8,0,0,0,61,232H232a8,8,0,0,0,3.5-15.19ZM67.14,88l25.41,10.3a24,24,0,0,0,31.23-13.45l21-53c2.56-6.11,9.47-9.27,15.43-7a12,12,0,0,1,6.88,15.92L145.69,93.76a24,24,0,0,0,13.43,31.14L184,134.73V152c0,.33,0,.66,0,1L55.77,101.71A108.84,108.84,0,0,1,67.14,88Zm48,128a87.53,87.53,0,0,1-24.34-42,8,8,0,0,0-15.49,4,105.16,105.16,0,0,0,18.36,38H64.44A95.54,95.54,0,0,1,40,152a85.9,85.9,0,0,1,7.73-36.29l137.8,55.12c3,18,10.56,33.48,21.89,45.16Z"></path>
            </svg>
          </button>
          <span
            className={`btn_line ${files.length >= 1 ? "show" : ""}`}
          ></span>
          <button
            className={`config_button re show`}
            onClick={() => setHistoryModal(!isHistoryModal)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path
                d="M216,128a88,88,0,1,1-88-88A88,88,0,0,1,216,128Z"
                opacity="0.2"
              ></path>
              <path d="M136,80v43.47l36.12,21.67a8,8,0,0,1-8.24,13.72l-40-24A8,8,0,0,1,120,128V80a8,8,0,0,1,16,0Zm-8-48A95.44,95.44,0,0,0,60.08,60.15C52.81,67.51,46.35,74.59,40,82V64a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H72a8,8,0,0,0,0-16H49c7.15-8.42,14.27-16.35,22.39-24.57a80,80,0,1,1,1.66,114.75,8,8,0,1,0-11,11.64A96,96,0,1,0,128,32Z"></path>
            </svg>
          </button>
          <div ref={ConfigRef} className="config_box">
            <button
              className={`config_button re show ${isConfigOpen ? "active" : ""}`}
              onClick={() => setConfigOpen(!isConfigOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="26"
                height="26"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path
                  d="M128,80a24,24,0,1,1-24-24A24,24,0,0,1,128,80Zm40,72a24,24,0,1,0,24,24A24,24,0,0,0,168,152Z"
                  opacity="0.2"
                ></path>
                <path d="M40,88H73a32,32,0,0,0,62,0h81a8,8,0,0,0,0-16H135a32,32,0,0,0-62,0H40a8,8,0,0,0,0,16Zm64-24A16,16,0,1,1,88,80,16,16,0,0,1,104,64ZM216,168H199a32,32,0,0,0-62,0H40a8,8,0,0,0,0,16h97a32,32,0,0,0,62,0h17a8,8,0,0,0,0-16Zm-48,24a16,16,0,1,1,16-16A16,16,0,0,1,168,192Z"></path>
              </svg>
            </button>
            <div className={`config_dropdown ${isConfigOpen ? "show" : ""}`}>
              <p className="title">{t("config.extract_data")}</p>
              <span className="line"></span>
              <div
                className="box re"
                onClick={() => HandleConfigOperation("delete_source")}
              >
                <div className="texts">
                  <p className="name">{t("config.delete_source.title")}</p>
                  <p className="desc">{t("config.delete_source.desc")}</p>
                </div>
                <SwitchToggler
                  isOn={isDeleteSource}
                  onToggle={() => HandleConfigOperation("delete_source")}
                />
              </div>
              <div
                className="box re"
                onClick={() => HandleConfigOperation("single_output")}
              >
                <div className="texts">
                  <p className="name">{t("config.single_output.title")}</p>
                  <p className="desc">{t("config.single_output.desc")}</p>
                </div>
                <SwitchToggler
                  isOn={isSingleOutput}
                  onToggle={() => HandleConfigOperation("single_output")}
                />
              </div>
              <span className="line light"></span>
              <div
                className="box re"
                onClick={() => HandleConfigOperation("logs")}
              >
                <div className="texts">
                  <p className="name">{t("config.history.title")}</p>
                  <p className="desc">{t("config.history.desc")}</p>
                </div>
                <SwitchToggler
                  isOn={isSaveHistory}
                  onToggle={() => HandleConfigOperation("logs")}
                />
              </div>
            </div>
          </div>
        </div>
        <>
          <div
            className="select_file re"
            onClick={!isExtracting ? handleFileSelect : undefined}
          >
            {files.length > 0 ? (
              isExtracting ? (
                <div className="file_box">
                  <div className="container">
                    <l-line-spinner
                      size={46}
                      stroke={3}
                      color={"currentColor"}
                    />
                  </div>
                  <div className="content">
                    <p>{t("extracting_files")}</p>
                    <p className="info">
                      {t("files_selected", { count: files.length })}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="file_box">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="56"
                    height="56"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path
                      d="M104,152l48,72H24l36-56,16.36,25.45ZM152,32V88h56Z"
                      opacity="0.2"
                    ></path>
                    <path d="M110.66,147.56a8,8,0,0,0-13.32,0L76.49,178.85l-9.76-15.18a8,8,0,0,0-13.46,0l-36,56A8,8,0,0,0,24,232H152a8,8,0,0,0,6.66-12.44ZM38.65,216,60,182.79l9.63,15a8,8,0,0,0,13.39.11l21-31.47L137.05,216Zm175-133.66-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40v88a8,8,0,0,0,16,0V40h88V88a8,8,0,0,0,8,8h48V216h-8a8,8,0,0,0,0,16h8a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160Z"></path>
                  </svg>
                  <div className="content">
                    <p>{t("choose_image_to_extract")}</p>
                    <p className="info">
                      {t("files_selected", { count: files.length })}
                    </p>
                  </div>
                </div>
              )
            ) : (
              <div className="file_box">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="56"
                  height="56"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  <path
                    d="M104,152l48,72H24l36-56,16.36,25.45ZM152,32V88h56Z"
                    opacity="0.2"
                  ></path>
                  <path d="M110.66,147.56a8,8,0,0,0-13.32,0L76.49,178.85l-9.76-15.18a8,8,0,0,0-13.46,0l-36,56A8,8,0,0,0,24,232H152a8,8,0,0,0,6.66-12.44ZM38.65,216,60,182.79l9.63,15a8,8,0,0,0,13.39.11l21-31.47L137.05,216Zm175-133.66-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40v88a8,8,0,0,0,16,0V40h88V88a8,8,0,0,0,8,8h48V216h-8a8,8,0,0,0,0,16h8a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160Z"></path>
                </svg>
                <div className="content">
                  <p>{t("choose_image_to_extract")}</p>
                  <p className="info">{t("no_files_selected")}</p>
                </div>
              </div>
            )}
          </div>

          {files.length > 0 && (
            <div className="files_list">
              {files.map((file, index) => (
                <div key={index} className="item">
                  <p className="file_name">
                    <span className="list_num">#{index + 1} »</span>
                    <span className="name">{file.name}</span>
                  </p>
                  <div className="buttons">
                    {badFiles.some((badFile) => badFile === file.path) ? (
                      <span
                        title="Error Code: BAD_EXTRACT"
                        className="status error"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="currentColor"
                          viewBox="0 0 256 256"
                        >
                          <path
                            d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z"
                            opacity="0.2"
                          ></path>
                          <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"></path>
                        </svg>
                      </span>
                    ) : !isExtracting &&
                      extractedFiles.some(
                        (xFile) => xFile.originalPath === file.path,
                      ) &&
                      extractedFiles.some(
                        (xFile) => xFile.extractedPath !== "canceled",
                      ) ? (
                      <span className="status success">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="currentColor"
                          viewBox="0 0 256 256"
                        >
                          <path
                            d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z"
                            opacity="0.2"
                          ></path>
                          <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path>
                        </svg>
                      </span>
                    ) : (
                      ""
                    )}
                    <button
                      className="cancel re"
                      onClick={() => {
                        const newFiles = files.filter((_, i) => i !== index);
                        setFiles(newFiles);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="currentColor"
                        viewBox="0 0 256 256"
                      >
                        <path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z"></path>
                      </svg>
                    </button>
                    {files.length > 1 && (
                      <button
                        className="submit re"
                        disabled={isExtracting || files.length <= 0}
                        onClick={() =>
                          extractFiles({ singleFilePath: file.path })
                        }
                      >
                        {t("extract_data")}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {files.length > 0 && (
            <button
              onClick={() => extractFiles()}
              className="page_main_button re"
              disabled={isExtracting || files.length <= 0 || isDisabled}
            >
              <div className="content">
                {isExtracting ? (
                  <l-orbit size="35" speed="1.5" color="currentColor" />
                ) : (
                  <>
                    <p>
                      {files.length > 1
                        ? t("extract_all_files")
                        : t("extract_data")}
                    </p>
                    <span>
                      <Trans
                        i18nKey="using_algo"
                        values={{ method: de_method }}
                      >
                        Using <span className="algo">{de_method}</span>{" "}
                        Algorithm
                      </Trans>
                    </span>
                  </>
                )}
              </div>
              <span className="combination">
                {osType === "mac" ? "Command" : "Ctrl"} + G
              </span>
            </button>
          )}
        </>
        <BottomInfo />
        <HistoryModal
          isShown={isHistoryModal}
          onClose={setHistoryModal}
          operation="steg_out"
        />
      </div>
    </>
  );
};

export default DataExtractor;
