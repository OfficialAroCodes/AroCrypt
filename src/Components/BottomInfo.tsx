import useAppVersion from '@/Utils/getAppVersion'
import useOpenLink from '@/Utils/openLink'
import React from 'react';
import { useTranslation } from 'react-i18next';

interface BottomInfoProps {
    hideCondition?: boolean;
}

const BottomInfo: React.FC<BottomInfoProps> = ({ hideCondition = false }) => {
    const { t } = useTranslation();
    const appVersion = useAppVersion();
    const isHidden = hideCondition ? 'hide' : '';

    return (
        <div className={`settings_info ${isHidden}`}>
            <p className="settings_info_text">{t('programmed_by')} <a onClick={() => useOpenLink("https://arocodes.rf.gd/")}>AroCodes</a></p>
            <p className="settings_info_text"><a onClick={() => useOpenLink("https://github.com/OfficialAroCodes/arocrypt/releases")}>Public Beta - <span>v{appVersion}</span></a></p>
        </div>
    )
}

export default BottomInfo