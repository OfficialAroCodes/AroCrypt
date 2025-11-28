import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
    setEncryptionMethod,
    setDecryptionMethod,
} from "@/store/encryptionMethodSlice";
import { useTranslation } from "react-i18next";
import BottomInfo from "@/Components/BottomInfo";
import SettingsDropDown from "@/Components/SettingsDropDown";
import { useKeyProvider } from "@/Context/KeysContext";

const Settings = () => {
    const { openManual } = useKeyProvider();
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { encryptionMethod, decryptionMethod } = useAppSelector(
        (state) => state.encryptionMethod
    );

    // info: States
    const [isEnMenuOpen, setIsEnMenuOpen] = useState(false);
    const [isDeMenuOpen, setIsDeMenuOpen] = useState(false);

    const handleEncryptionMethodChange = (method: any) => {
        dispatch(setEncryptionMethod(method));
    };

    const handleDecryptionMethodChange = (method: any) => {
        dispatch(setDecryptionMethod(method));
    };

    return (
        <>
            <div className="page_content settings">
                <div className="setting_row">
                    <div className="setting_row_textes">
                        <p className="setting_row_header">{t('encryption_algorithm')}</p>
                        <p className="setting_row_info">{t('encryption_algorithm_info')}</p>
                    </div>
                    <SettingsDropDown
                        label={encryptionMethod}
                        isOpen={isEnMenuOpen}
                        setIsOpen={setIsEnMenuOpen}
                    >
                        <span className="group_title">AES-GCM ({t('recommended')})</span>
                        <button
                            className={`re ${encryptionMethod === "AES-256-GCM" ? "active" : ""
                                }`}
                            onClick={() => handleEncryptionMethodChange("AES-256-GCM")}>
                            <p>AES-256-GCM</p>
                        </button>
                        <button
                            className={`re ${encryptionMethod === "AES-192-GCM" ? "active" : ""
                                }`}
                            onClick={() => handleEncryptionMethodChange("AES-192-GCM")}>
                            <p>AES-192-GCM</p>
                        </button>
                        <button
                            className={`re ${encryptionMethod === "AES-128-GCM" ? "active" : ""
                                }`}
                            onClick={() => handleEncryptionMethodChange("AES-128-GCM")}>
                            <p>AES-128-GCM</p>
                        </button>
                        <span className="line" />
                        <span className="group_title">AES-CTR ({t('stream_mode')})</span>
                        <button
                            className={`re ${encryptionMethod === "AES-256-CTR" ? "active" : ""
                                }`}
                            onClick={() => handleEncryptionMethodChange("AES-256-CTR")}>
                            <p>AES-256-CTR</p>
                        </button>
                        <button
                            className={`re ${encryptionMethod === "AES-192-CTR" ? "active" : ""
                                }`}
                            onClick={() => handleEncryptionMethodChange("AES-192-CTR")}>
                            <p>AES-192-CTR</p>
                        </button>
                        <button
                            className={`re ${encryptionMethod === "AES-128-CTR" ? "active" : ""
                                }`}
                            onClick={() => handleEncryptionMethodChange("AES-128-CTR")}>
                            <p>AES-128-CTR</p>
                        </button>
                        <span className="line" />
                        <span className="group_title">AES-CBC ({t('legacy')})</span>
                        <button
                            className={`re ${encryptionMethod === "AES-256-CBC" ? "active" : ""
                                }`}
                            onClick={() => handleEncryptionMethodChange("AES-256-CBC")}>
                            <p>AES-256-CBC</p>
                        </button>
                        <button
                            className={`re ${encryptionMethod === "AES-192-CBC" ? "active" : ""
                                }`}
                            onClick={() => handleEncryptionMethodChange("AES-192-CBC")}>
                            <p>AES-192-CBC</p>
                        </button>
                        <button
                            className={`re ${encryptionMethod === "AES-128-CBC" ? "active" : ""
                                }`}
                            onClick={() => handleEncryptionMethodChange("AES-128-CBC")}>
                            <p>AES-128-CBC</p>
                        </button>
                    </SettingsDropDown>
                </div>
                <div className="setting_row">
                    <div className="setting_row_textes">
                        <p className="setting_row_header">{t('decryption_algorithm')}</p>
                        <p className="setting_row_info">{t('decryption_algorithm_info')}</p>
                    </div>
                    <SettingsDropDown
                        label={decryptionMethod}
                        isOpen={isDeMenuOpen}
                        setIsOpen={setIsDeMenuOpen}
                    >
                        <span className="group_title">AES-GCM ({t('recommended')})</span>
                        <button
                            className={`re ${decryptionMethod === "AES-256-GCM" ? "active" : ""
                                }`}
                            onClick={() => handleDecryptionMethodChange("AES-256-GCM")}>
                            <p>AES-256-GCM</p>
                        </button>
                        <button
                            className={`re ${decryptionMethod === "AES-192-GCM" ? "active" : ""
                                }`}
                            onClick={() => handleDecryptionMethodChange("AES-192-GCM")}>
                            <p>AES-192-GCM</p>
                        </button>
                        <button
                            className={`re ${decryptionMethod === "AES-128-GCM" ? "active" : ""
                                }`}
                            onClick={() => handleDecryptionMethodChange("AES-128-GCM")}>
                            <p>AES-128-GCM</p>
                        </button>
                        <span className="line" />
                        <span className="group_title">AES-CTR ({t('stream_mode')})</span>
                        <button
                            className={`re ${decryptionMethod === "AES-256-CTR" ? "active" : ""
                                }`}
                            onClick={() => handleDecryptionMethodChange("AES-256-CTR")}>
                            <p>AES-256-CTR</p>
                        </button>
                        <button
                            className={`re ${decryptionMethod === "AES-192-CTR" ? "active" : ""
                                }`}
                            onClick={() => handleDecryptionMethodChange("AES-192-CTR")}>
                            <p>AES-192-CTR</p>
                        </button>
                        <button
                            className={`re ${decryptionMethod === "AES-128-CTR" ? "active" : ""
                                }`}
                            onClick={() => handleDecryptionMethodChange("AES-128-CTR")}>
                            <p>AES-128-CTR</p>
                        </button>
                        <span className="line" />
                        <span className="group_title">AES-CBC ({t('legacy')})</span>
                        <button
                            className={`re ${decryptionMethod === "AES-256-CBC" ? "active" : ""
                                }`}
                            onClick={() => handleDecryptionMethodChange("AES-256-CBC")}>
                            <p>AES-256-CBC</p>
                        </button>
                        <button
                            className={`re ${decryptionMethod === "AES-192-CBC" ? "active" : ""
                                }`}
                            onClick={() => handleDecryptionMethodChange("AES-192-CBC")}>
                            <p>AES-192-CBC</p>
                        </button>
                        <button
                            className={`re ${decryptionMethod === "AES-128-CBC" ? "active" : ""
                                }`}
                            onClick={() => handleDecryptionMethodChange("AES-128-CBC")}>
                            <p>AES-128-CBC</p>
                        </button>
                    </SettingsDropDown>
                </div>
                <div className="setting_row">
                    <div className="setting_row_textes">
                        <p className="setting_row_header">{t("manage_keys")}</p>
                        <p className="setting_row_info">{t("manage_keys_info")}</p>
                    </div>
                    <button
                        className="setting_row_btn re"
                        onClick={openManual}
                    >
                        {t("manage_keys")}
                    </button>
                </div>
                <BottomInfo />
            </div>
        </>
    );
};

export default Settings;
