import CopyText from "@/Utils/copyText";
import React, { useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { setOutputPackedKeys, setEncryptText } from "../store/encryptionSlice";
import BottomInfo from "@/Components/BottomInfo";
import ViewUnpackedKeys from "@/Components/ViewUnpackedKeys";
import { useClickOutside, useDeviceOS, useKeyPress } from "react-haiku";
import SwitchToggler from "@/Components/ui/SwitchToggler";
import HistoryModal from "@/Components/HistoryModal";
import { useToast } from "@/Context/ToastContext";
import { CheckAlgorithm } from "@/Utils/AlgorithmUtil";
import getDeviceOS from "@/Utils/getDeviceOS";

const Encryption: React.FC = () => {
  const toast = useToast();
  const { t } = useTranslation();
  const [inputText, setInputText] = useState("");
  const [isViewKeysModalOpen, setIsViewKeysModalOpen] = useState(false);
  const osType = getDeviceOS();

  const dispatch = useDispatch();
  const { output_PackedKeys, encryptText } = useSelector(
    (state: RootState) => state.encryption
  );

  const en_method = localStorage.getItem("encryptionMethod");

  const handleEncrypt = async () => {
    CheckAlgorithm();

    if (!inputText) {
      setInputText(encryptText);
      return;
    }

    if (!en_method) {
      setInputText("/Encryption method not found./");
      return;
    }

    try {
      const data = await window.electronAPI.encrypt({
        text: inputText,
        method: en_method,
        isSaveHistory: isSaveHistory,
        isShareable: isShareable
      });

      dispatch(setOutputPackedKeys(data));
      dispatch(setEncryptText(inputText));
    } catch (error: any) {
      dispatch(setOutputPackedKeys(""));
      return toast(0, error.toString(), t('toast.unexpected_error_title'));
    }
  };

  const [isCopiedEn, setIsCopiedEn] = useState(false);

  const handleCopyTextEn = async () => {
    const copyData = await CopyText(output_PackedKeys);

    if (copyData === "success") {
      setIsCopiedEn(true);
      setTimeout(() => {
        setIsCopiedEn(false);
      }, 1000);
    }
  };

  const handleTypeTextToEncrypt = (e: any) => {
    setInputText(e.target.value);
    dispatch(setEncryptText(e.target.value));
    dispatch(setOutputPackedKeys(""));
  };

  const combination = () => {
    if (encryptText) {
      handleEncrypt();
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
    const contentShareable = localStorage.getItem('shareable.etext') === 'true';
    const contentHistory = localStorage.getItem('logs.etext') === 'true';
    const contentSingleOutput = localStorage.getItem('single_output.etext') === 'true';
    const contentDeleteSource = localStorage.getItem('delete_source.etext') === 'true';

    setShareable(contentShareable)
    setSaveHistory(contentHistory);
    setSingleOutput(contentSingleOutput);
    setDeleteSource(contentDeleteSource);
  }, [isSaveHistory, isShareable, isSingleOutput, isDeleteSource])

  const HandleConfigOperation = (config: string) => {
    switch (config) {
      case "logs":
        localStorage.setItem('logs.etext', `${isSaveHistory ? false : true}`)
        setSaveHistory(!isSaveHistory)
        break;
      case "shareable":
        localStorage.setItem('shareable.etext', `${isShareable ? false : true}`)
        setShareable(!isShareable)
        break;
      case "single_output":
        localStorage.setItem('single_output.etext', `${isSingleOutput ? false : true}`)
        setSingleOutput(!isSingleOutput)
        break;
      case "delete_source":
        localStorage.setItem('delete_source.etext', `${isDeleteSource ? false : true}`)
        setDeleteSource(!isDeleteSource)
        break;
    }
  }

  /* info: Config Functions {END} */

  return (
    <>
      <div className="page_content">
        <p className="page_header">{t("text_encryption")}</p>
        <div className="page_config">
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
              <p className="title">{t("config.etext")}</p>
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
        <div className="InputContainer full-height">
          <label>{t("text_to_encrypt")}</label>
          <textarea
            spellCheck="false"
            className="Input Textarea"
            placeholder=""
            id="inputText"
            value={inputText || encryptText}
            onChange={handleTypeTextToEncrypt}
          ></textarea>
        </div>
        <div className="key_input_container">
          <div className="InputContainer">
            <div className="labels">
              <label>{t("packed_package")}</label>
              <label
                className={`clickable ${!output_PackedKeys ? 'disabled' : ''}`}
                onClick={() => output_PackedKeys ? setIsViewKeysModalOpen(true) : ''}
              >
                {t('view_unpacked')}
              </label>
            </div>
            <input
              spellCheck="false"
              id="outputText"
              className={`Input active ${isCopiedEn ? "Success" : ""}`}
              type="text"
              value={output_PackedKeys}
              readOnly
              placeholder=""
            />
            <button className="input_side_button re" onClick={handleCopyTextEn}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M216,40V168H168V88H88V40Z" opacity="0.2"></path>
                <path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"></path>
              </svg>
            </button>
          </div>
        </div>
        <button
          className="page_main_button re"
          disabled={!encryptText}
          onClick={handleEncrypt}
        >
          {isShareable ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M208,200a32,32,0,1,1-32-32A32,32,0,0,1,208,200ZM176,88a32,32,0,1,0-32-32A32,32,0,0,0,176,88Z" opacity="0.2"></path><path d="M176,160a39.89,39.89,0,0,0-28.62,12.09l-46.1-29.63a39.8,39.8,0,0,0,0-28.92l46.1-29.63a40,40,0,1,0-8.66-13.45l-46.1,29.63a40,40,0,1,0,0,55.82l46.1,29.63A40,40,0,1,0,176,160Zm0-128a24,24,0,1,1-24,24A24,24,0,0,1,176,32ZM64,152a24,24,0,1,1,24-24A24,24,0,0,1,64,152Zm112,72a24,24,0,1,1,24-24A24,24,0,0,1,176,224Z"></path></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M216,96V208a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V96a8,8,0,0,1,8-8H208A8,8,0,0,1,216,96Z" opacity="0.2"></path><path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM48,128H208v16H48Zm0,32H208v16H48ZM96,56a32,32,0,0,1,64,0V80H96ZM208,96v16H48V96Zm0,112H48V192H208v16Z"></path></svg>
          )}
          <div className="content">
            <p>{t("encrypt_text")}</p>
            <span>
              <Trans i18nKey="using_algo" values={{ method: en_method }}>
                Using <span className="algo">{en_method}</span> Algorithm
              </Trans>
            </span>
          </div>
          <span className="combination">
            {osType === 'mac' ? ('Command') : 'Ctrl'} + E
          </span>
        </button>
        <BottomInfo />
      </div>

      <ViewUnpackedKeys
        isShown={isViewKeysModalOpen}
        packedKeys={output_PackedKeys}
        onClose={setIsViewKeysModalOpen}
      />
      <HistoryModal isShown={isHistoryModal} onClose={setHistoryModal} operation="etext" />
    </>
  );
};

export default Encryption;
