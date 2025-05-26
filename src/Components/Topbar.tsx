import React from 'react';
import { useAppVersion } from '@/Utils/getAppVersion';
import { useTranslation } from 'react-i18next';

const Topbar: React.FC = () => {
    const appVersion = useAppVersion();
    const { t } = useTranslation();

    return (
        <div className="AppInfoBox">
            <p className="AppName">AroCrypt <sup>v{appVersion}</sup></p>
            <p className="AppInfo">{t('app_info')}</p>
        </div>
    )
}

export default Topbar