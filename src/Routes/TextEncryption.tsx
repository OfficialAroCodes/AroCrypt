import CopyText from "@/Utils/copyText";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { setOutputPackedKeys, setEncryptText } from "../store/encryptionSlice";
import BottomInfo from "@/Components/BottomInfo";
import ViewUnpackedKeys from "@/Components/ViewUnpackedKeys";

const Encryption: React.FC = () => {
  const { t } = useTranslation();
  const [inputText, setInputText] = useState("");
  const [isViewKeysModalOpen, setIsViewKeysModalOpen] = useState(false);

  const dispatch = useDispatch();
  const { output_PackedKeys, encryptText } = useSelector(
    (state: RootState) => state.encryption
  );

  const en_method = localStorage.getItem("encryptionMethod");

  const handleEncrypt = async () => {
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
      });

      dispatch(setOutputPackedKeys(data));
      dispatch(setEncryptText(inputText));
    } catch (error: any) {
      console.error("Encryption error:", error);
      alert(`Encryption failed: ${error.message}`);
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

  const { theme } = useSelector((state: any) => state.global);

  const handleTypeTextToEncrpyt = (e: any) => {
    setInputText(e.target.value);
    dispatch(setEncryptText(e.target.value));
    dispatch(setOutputPackedKeys(""));
  };

  return (
    <>
      {theme}
      <div className="page_content">
        <p className="page_header">{t("text_encryption")}</p>
        <div className="InputContainer">
          <label>{t("text_to_encrypt")}</label>
          <textarea
            spellCheck="false"
            className="Input Textarea"
            placeholder=""
            id="inputText"
            value={inputText || encryptText}
            onChange={handleTypeTextToEncrpyt}
          ></textarea>
        </div>
        <div className="key_input_container">
          <div className="InputContainer">
            <div className="labels">
              <label>{t("packed_public_keys")}</label>
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
            <button className="InputCopyBTN re" onClick={handleCopyTextEn}>
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
          className="main_button re"
          disabled={!encryptText}
          onClick={handleEncrypt}
        >
          {t("encrypt_text")}
        </button>
        <BottomInfo />
      </div>

      <div className={`modal_box ${isViewKeysModalOpen ? "Show" : ""}`}>
        <ViewUnpackedKeys
          isShown={isViewKeysModalOpen}
          packedKeys={output_PackedKeys}
          onClose={setIsViewKeysModalOpen}
        />
      </div>
    </>
  );
};

export default Encryption;
