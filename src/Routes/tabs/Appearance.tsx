import { useEffect, useState } from "react";
import { useAppDispatch } from "@/store";
import { useTranslation } from "react-i18next";
import BottomInfo from "@/Components/BottomInfo";
import SettingsDropDown from "@/Components/SettingsDropDown";
import { useSelector } from "react-redux";
import { setLanguage } from "@/globalSlice";
import ThemeSettings from "../components/ThemeSettings";
import { useTheme } from "@/Providers/ThemeProvider";

const themes = ['dark', 'light'] as const;
type Theme = typeof themes[number];

const AppearanceSettings = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    /* info: States */
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
    const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

    const currentLanguage = useSelector((state: any) => state.global.language);
    const handleLanguageChange = (lang: any) => {
        dispatch(setLanguage(lang));
    };

    // Use theme context for type
    const { themeType, setThemeType } = useTheme();

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
                        <p className="setting_row_header">{t("app_theme.title")}</p>
                        <p className="setting_row_info">{t("app_theme.desc")}</p>
                    </div>
                    <SettingsDropDown
                        label={themeType === "dark" ? t("app_theme.dark") : t("app_theme.light")}
                        isOpen={isThemeMenuOpen}
                        setIsOpen={setIsThemeMenuOpen}
                    >
                        <button
                            className={`re ${themeType === "light" ? "active" : ""}`}
                            onClick={() => setThemeType("light")}
                        >
                            <p>{t("app_theme.light")}</p>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M184,128a56,56,0,1,1-56-56A56,56,0,0,1,184,128Z" opacity="0.2"></path><path d="M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Zm-16,0a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,128ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-16-16A8,8,0,0,0,42.34,53.66Zm0,116.68-16,16a8,8,0,0,0,11.32,11.32l16-16a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l16-16a8,8,0,0,0-11.32-11.32l-16,16A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32-11.32ZM48,128a8,8,0,0,0-8-8H16a8,8,0,0,0,0,16H40A8,8,0,0,0,48,128Zm80,80a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V216A8,8,0,0,0,128,208Zm112-88H216a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Z"></path></svg>
                        </button>
                        <button
                            className={`re ${themeType === "dark" ? "active" : ""}`}
                            onClick={() => setThemeType("dark")}
                        >
                            <p>{t("app_theme.dark")}</p>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M227.89,147.89A96,96,0,1,1,108.11,28.11,96.09,96.09,0,0,0,227.89,147.89Z" opacity="0.2"></path><path d="M233.54,142.23a8,8,0,0,0-8-2,88.08,88.08,0,0,1-109.8-109.8,8,8,0,0,0-10-10,104.84,104.84,0,0,0-52.91,37A104,104,0,0,0,136,224a103.09,103.09,0,0,0,62.52-20.88,104.84,104.84,0,0,0,37-52.91A8,8,0,0,0,233.54,142.23ZM188.9,190.34A88,88,0,0,1,65.66,67.11a89,89,0,0,1,31.4-26A106,106,0,0,0,96,56,104.11,104.11,0,0,0,200,160a106,106,0,0,0,14.92-1.06A89,89,0,0,1,188.9,190.34Z"></path></svg>
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
