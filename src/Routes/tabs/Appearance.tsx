import { useState } from "react";
import { useAppDispatch } from "@/store";
import { useTranslation } from "react-i18next";
import BottomInfo from "@/Components/BottomInfo";
import SettingsDropDown from "@/Components/SettingsDropDown";
import { useSelector } from "react-redux";
import { setLanguage } from "@/globalSlice";
import ThemeSettings from "../components/ThemeSettings";

const AppearanceSettings = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    /* info: States */
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

    const currentLanguage = useSelector((state: any) => state.global.language);
    const handleLanguageChange = (lang: any) => {
        dispatch(setLanguage(lang));
    };

    return (
        <>
            <div className="page_content settings">
                <div className="setting_row">
                    <div className="setting_row_textes">
                        <p className="setting_row_header">{t("interface_language")}</p>
                        <p className="setting_row_info">{t("interface_language_info")}</p>
                    </div>
                    <SettingsDropDown
                        label={currentLanguage === "en" ? "English" : "Русский"}
                        isOpen={isLangMenuOpen}
                        setIsOpen={setIsLangMenuOpen}
                    >
                        <button
                            className={`re ${currentLanguage === "en" ? "active" : ""}`}
                            onClick={() => handleLanguageChange("en")}
                        >
                            <p>English</p>
                        </button>
                        <button
                            className={`re ${currentLanguage === "ru" ? "active" : ""}`}
                            onClick={() => handleLanguageChange("ru")}
                        >
                            <p>Русский</p>
                        </button>
                    </SettingsDropDown>
                </div>
                <div className="setting_row">
                    <div className="setting_row_textes">
                        <p className="setting_row_header">{t('brand_color')}</p>
                        <p className="setting_row_info">{t('brand_color_info')}</p>
                    </div>
                    <ThemeSettings />
                </div>
                <BottomInfo />
            </div>
        </>
    );
};

export default AppearanceSettings;
