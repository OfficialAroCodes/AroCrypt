import useAppVersion from "@/Utils/getAppVersion";
import useOpenLink from "@/Utils/openLink";
import { useTranslation } from "react-i18next";

export default function AboutWindow(): JSX.Element {
  const { t } = useTranslation();
  const appVersion = useAppVersion();

  return (
    <div className="about_window">
      <img src="./logo/logo.png" alt="Logo" className="about_main_logo" />
      <div className="text_details">
        <h1>AroCrypt <span onClick={() =>  useOpenLink(`https://github.com/OfficialAroCodes/arocrypt/releases`)}>v{appVersion}</span></h1>
        <p className="app_info">{t("about_page_info")}</p>
        <p className="dev_info">{t('about_dev_info')} <a onClick={() =>  useOpenLink("https://github.com/OfficialAroCodes")}>AroCodes</a>.</p>
      </div>
    </div>
  );
} 