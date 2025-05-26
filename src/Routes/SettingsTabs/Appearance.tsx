import InterfaceThemes from "@/Components/InterfaceThemes";
import { setLanguage } from "@/globalSlice";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

const Appearance = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const currentLanguage = useSelector((state: any) => state.global.language);

  const handleLanguageChange = (lang: any) => {
    dispatch(setLanguage(lang));
  };

  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(".settings_dropdown_btn")
      ) {
        setIsLangMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsLangMenuOpen]);

  return (
    <>
      <p className="setting_row_header">{t("interface_theme")}</p>
      <InterfaceThemes />
      <div className="setting_row">
        <div className="setting_row_textes">
          <p className="setting_row_header">{t("interface_language")}</p>
          <p className="setting_row_info">{t("interface_language_info")}</p>
        </div>
        <div className="settings_dropdown_container">
          <button
            className="settings_dropdown_btn re"
            onClick={(event) => {
              event.stopPropagation();
              setIsLangMenuOpen((prevState) => !prevState);
            }}
          >
            {currentLanguage === "en" ? "English" : "Русский"}
            <svg
              className={isLangMenuOpen ? "rotate" : ""}
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M6 9l6 6l6 -6" />
            </svg>
          </button>
          <div
            ref={langDropdownRef}
            className={`settings_dropdown_box ${isLangMenuOpen ? "show" : ""}`}
          >
            <button
              className={`re ${currentLanguage === "en" ? "active" : ""}`}
              onClick={() => handleLanguageChange("en")}
            >
              English
            </button>
            <button
              className={`re ${currentLanguage === "ru" ? "active" : ""}`}
              onClick={() => handleLanguageChange("ru")}
            >
              Русский
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Appearance;
