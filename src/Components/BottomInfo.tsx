import useAppVersion from "@/Utils/getAppVersion";
import useOpenLink from "@/Utils/openLink";
import { useTranslation } from "react-i18next";

const BottomInfo = () => {
  const { t } = useTranslation();
  const appVersion = useAppVersion();

  return (
    <div className="bottominfo_position">
      <div className="bottominfo">
        <p className="bottominfo_text">
          {t("developed_by")}{" "}
          <a onClick={() => useOpenLink("https://arocodes.rf.gd/")}>AroCodes</a>
        </p>
        <p className="bottominfo_text">
          <a
            onClick={() =>
              useOpenLink(
                "https://github.com/OfficialAroCodes/arocrypt/releases"
              )
            }
          >
            Public Beta - <span>v{appVersion}</span>
          </a>
        </p>
      </div>
    </div>
  );
};

export default BottomInfo;
