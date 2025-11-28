import { RootState } from "@/store";
import React, { useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { setPackedKeys, setDecryptedText } from "@/store/decryptionSlice";
import BottomInfo from "@/Components/BottomInfo";
import { useToast } from "@/Context/ToastContext";
import { useClickOutside, useKeyPress } from "react-haiku";
import SwitchToggler from "@/Components/ui/SwitchToggler";
import HistoryModal from "@/Components/HistoryModal";
import { CheckAlgorithm } from "@/Utils/AlgorithmUtil";
import getDeviceOS from "@/Utils/getDeviceOS";

const Decryption: React.FC = () => {
  const toast = useToast();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { packedKeys, decrypted_text } = useSelector(
    (state: RootState) => state.decryption
  );
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const osType = getDeviceOS();

  const de_method = localStorage.getItem("decryptionMethod");

  const handleDecrypt = async () => {
    try {
      CheckAlgorithm();

      const decryptParams = {
        packedKeys: packedKeys,
        method: de_method,
        isSaveHistory: isSaveHistory,
      };

      const decryptedResult = await window.electronAPI.decrypt(
        decryptParams as any
      );

      if (decryptedResult === "invalid") {
        dispatch(setDecryptedText(""));
        setIsButtonDisabled(true);
        toast(0, t('toast.text_decryption_msg'), t('toast.text_decryption_title'))
        return;
      }

      dispatch(setDecryptedText(decryptedResult));
      setIsButtonDisabled(true);
    } catch (error: any) {
      toast(0, `Unexpected Error has Occurred: ${error}`, "Unexpected Error")
    }
  };

  const handleTypeSecurityKey = (e: any) => {
    dispatch(setPackedKeys(e.target.value));
    dispatch(setDecryptedText(""));
    setIsButtonDisabled(false);
    setIsButtonDisabled(false);
  };

  const combination = () => {
    if (packedKeys && !isButtonDisabled) {
      handleDecrypt();
    }
  }

  useKeyPress(['Control', 'D'], combination);
  useKeyPress(['Meta', 'D'], combination);

  /* info: Config Functions */

  // Dropdown and Modal
  const [isHistoryModal, setHistoryModal] = useState(false);
  const [isConfigOpen, setConfigOpen] = useState(false);
  const ConfigRef = useRef(null)

  useClickOutside(ConfigRef, () => setConfigOpen(false));

  // Configs
  const [isSaveHistory, setSaveHistory] = useState(false);

  useEffect(() => {
    const contentHistory = localStorage.getItem('logs.dtext') === 'true';

    setSaveHistory(contentHistory);
  }, [isSaveHistory])

  const HandleConfigOperation = (config: string) => {
    switch (config) {
      case "logs":
        localStorage.setItem('logs.dtext', `${isSaveHistory ? false : true}`)
        setSaveHistory(!isSaveHistory)
        break;
    }
  }

  /* info: Config Functions {END} */

  return (
    <>
      <div className="page_content">
        <p className="page_header">{t("text_decryption")}</p>
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
              <p className="title">{t("config.dtext")}</p>
              <span className="line"></span>
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
        <div className={`InputContainer`}>
          <label>{t("packed_package")}</label>
          <input
            spellCheck="false"
            className={`Input`}
            type="text"
            value={packedKeys}
            onChange={handleTypeSecurityKey}
            placeholder=""
          />
        </div>
        <div className={`InputContainer full-height`}>
          <label>{t("decrypted_text")}</label>
          <textarea
            spellCheck="false"
            className={`Input Textarea active`}
            placeholder=""
            readOnly
            value={decrypted_text}
          ></textarea>
        </div>
        <button
          className="page_main_button re"
          disabled={!packedKeys || isButtonDisabled}
          onClick={handleDecrypt}
        >
          <div className="content">
            <p>{t("decrypt_text")}</p>
            <span>
              <Trans i18nKey="using_algo" values={{ method: de_method }}>
                Using <span className="algo">{de_method}</span> Algorithm
              </Trans>
            </span>
          </div>
          <span className="combination">{osType === 'mac' ? ('Command') : 'Ctrl'} + D</span>
        </button>
        <BottomInfo />
      </div>
      <HistoryModal isShown={isHistoryModal} onClose={setHistoryModal} operation="dtext" />
    </>
  );
};

export default Decryption;
