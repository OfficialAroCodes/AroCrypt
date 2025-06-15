import { RootState } from "@/store";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { setPackedKeys, setDecryptedText } from "@/store/decryptionSlice";
import BottomInfo from "@/Components/BottomInfo";

const Decryption: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isIncorrectKey, setIsIncorrectKey] = useState(false);
  const { packedKeys, decrypted_text } = useSelector(
    (state: RootState) => state.decryption
  );
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const de_method = localStorage.getItem("decryptionMethod");

  const handleDecrypt = async () => {
    try {
      if (!packedKeys) {
        setDecryptedText("Enter key to decrpyt.");
        setIsIncorrectKey(true);
        return;
      }

      const decryptParams = {
        packedKeys: packedKeys,
        method: de_method,
      };

      const decryptedResult = await window.electronAPI.decrypt(
        decryptParams as any
      );

      if (decryptedResult === "invalid") {
        setIsIncorrectKey(true);
        dispatch(setDecryptedText(""));
        return;
      }

      dispatch(setDecryptedText(decryptedResult));
      setIsButtonDisabled(true);
    } catch (error: any) {
      console.error("Decryption error:", error);
      alert(`${t("decryption_failed")}: ${error.message}`);
    }
  };

  const handleTypeSecuirtyKey = (e: any) => {
    dispatch(setPackedKeys(e.target.value));
    dispatch(setDecryptedText(""));
    setIsIncorrectKey(false);
    setIsButtonDisabled(false);
  };

  return (
    <>
      <div className="page_content">
        <p className="page_header">{t("text_decryption")}</p>
        <div className={`InputContainer ${isIncorrectKey ? "invalid" : ""}`}>
          <label>{t("packed_public_keys")}</label>
          <input
            spellCheck="false"
            className={`Input`}
            type="text"
            value={packedKeys}
            onChange={handleTypeSecuirtyKey}
            placeholder=""
          />
        </div>
        <div className={`InputContainer`}>
          <label>{t("decrypted_text")}</label>
          <textarea
            spellCheck="false"
            className={`Input Textarea active`}
            disabled
            placeholder=""
            value={decrypted_text}
          ></textarea>
        </div>
        <button
          className="main_button re"
          disabled={!packedKeys || isIncorrectKey || isButtonDisabled}
          onClick={handleDecrypt}
        >
          {t("decrypt_text")}
        </button>
        <BottomInfo />
      </div>
    </>
  );
};

export default Decryption;
