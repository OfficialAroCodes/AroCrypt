import { useAppSelector } from "@/store";
import useOpenLink from "@/Utils/openLink";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface dropdown {
  show: any;
}

export default function MainDropDown({ show }: dropdown): JSX.Element {
  const { t } = useTranslation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { encryptionMethod, decryptionMethod } = useAppSelector(
    (state) => state.encryptionMethod
  );

  return (
    <div
      ref={dropdownRef}
      className={`dropdown_menu_box ${show ? "show" : ""}`}
    >
      <div className="dropdown_menu">
        <div>
          <div
            className="dropdown_menu_line re"
            onClick={() => navigate("/Settings")}
          >
            <h3>{t("en_method")}</h3>
            <p>{encryptionMethod}</p>
          </div>
          <div
            className="dropdown_menu_line re"
            onClick={() => navigate("/Settings")}
          >
            <h3>{t("de_method")}</h3>
            <p>{decryptionMethod}</p>
          </div>
        </div>
        <span className="dropdown_sepatrator"></span>
        <div>
          <button
            className="dropdown_button re"
            onClick={() =>
              useOpenLink("https://github.com/OfficialAroCodes/arocrypt/")
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5" />
            </svg>
            {t("source_code")}
          </button>
          <button
            className="dropdown_button re"
            onClick={() =>
              useOpenLink("https://github.com/OfficialAroCodes/arocrypt/issues")
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M9 9v-1a3 3 0 0 1 6 0v1" />
              <path d="M8 9h8a6 6 0 0 1 1 3v3a5 5 0 0 1 -10 0v-3a6 6 0 0 1 1 -3" />
              <path d="M3 13l4 0" />
              <path d="M17 13l4 0" />
              <path d="M12 20l0 -6" />
              <path d="M4 19l3.35 -2" />
              <path d="M20 19l-3.35 -2" />
              <path d="M4 7l3.75 2.4" />
              <path d="M20 7l-3.75 2.4" />
            </svg>
            {t("report_issue")}
          </button>
        </div>
        <span className="dropdown_sepatrator"></span>
        <button
          className="dropdown_button re"
          onClick={() => useOpenLink("https://arocodes.rf.gd/")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 15h-6.5a2.5 2.5 0 1 1 0 -5h.5" />
            <path d="M15 12v6.5a2.5 2.5 0 1 1 -5 0v-.5" />
            <path d="M12 9h6.5a2.5 2.5 0 1 1 0 5h-.5" />
            <path d="M9 12v-6.5a2.5 2.5 0 0 1 5 0v.5" />
          </svg>
          {t("dev_contact")}
        </button>
      </div>
    </div>
  );
}
