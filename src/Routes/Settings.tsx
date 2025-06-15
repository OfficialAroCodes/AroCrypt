import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
    setEncryptionMethod,
    setDecryptionMethod,
} from "@/store/encryptionMethodSlice";
import { useTranslation } from "react-i18next";
import BottomInfo from "@/Components/BottomInfo";
import SettingsDropDown from "@/Components/SettingsDropDown";
import KeyProvider from "@/Providers/KeyProvider";

const Settings = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { encryptionMethod, decryptionMethod } = useAppSelector(
        (state) => state.encryptionMethod
    );

    // info: States
    const [isChangingKey, setIsChangingKey] = useState(false);
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
                        upperCase={true}
                    >
                        <button
                            className={`re ${encryptionMethod === "aes-256-cbc" ? "active" : ""
                                }`}
                            onClick={() => handleEncryptionMethodChange("aes-256-cbc")}
                        >
                            <p>AES-256-CBC</p>
                        </button>
                        <button
                            className={`re ${encryptionMethod === "aes-192-cbc" ? "active" : ""
                                }`}
                            onClick={() => handleEncryptionMethodChange("aes-192-cbc")}
                        >
                            <p>AES-192-CBC</p>
                        </button>
                        <button
                            className={`re ${encryptionMethod === "aes-128-cbc" ? "active" : ""
                                }`}
                            onClick={() => handleEncryptionMethodChange("aes-128-cbc")}
                        >
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
                        upperCase={true}
                    >
                        <button
                            className={`re ${decryptionMethod === "aes-256-cbc" ? "active" : ""
                                }`}
                            onClick={() => handleDecryptionMethodChange("aes-256-cbc")}
                        >
                            <p>AES-256-CBC</p>
                        </button>
                        <button
                            className={`re ${decryptionMethod === "aes-192-cbc" ? "active" : ""
                                }`}
                            onClick={() => handleDecryptionMethodChange("aes-192-cbc")}
                        >
                            <p>AES-192-CBC</p>
                        </button>
                        <button
                            className={`re ${decryptionMethod === "aes-128-cbc" ? "active" : ""
                                }`}
                            onClick={() => handleDecryptionMethodChange("aes-128-cbc")}
                        >
                            <p>AES-128-CBC</p>
                        </button>
                    </SettingsDropDown>
                </div>
                <div className="setting_row">
                    <div className="setting_row_textes">
                        <p className="setting_row_header">{t("private_key")}</p>
                        <p className="setting_row_info">{t("private_key_info")}</p>
                    </div>
                    <button
                        className="setting_row_btn re"
                        onClick={() => setIsChangingKey(true)}
                    >
                        {t("change")}
                    </button>
                </div>
                <BottomInfo />
            </div>

            <KeyProvider
                show={isChangingKey}
                onClose={() => setIsChangingKey(false)}
            />
        </>
    );
};

export default Settings;
