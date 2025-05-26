import React, { useState } from 'react'
import Security from '@/Routes/SettingsTabs/Security';
import Appearance from '@/Routes/SettingsTabs/Appearance';
import About from '@/Routes/SettingsTabs/About';
import { useTranslation } from 'react-i18next';
import BottomInfo from '@/Components/BottomInfo';

const Settings: React.FC = () => {
    const { t } = useTranslation();

    const [isSecurityTab, setIsSecurityTab] = useState(true);
    const [isAppearanceTab, setIsAppearanceTab] = useState(false);
    const [isAboutTab, setIsAboutTab] = useState(false);

    const handleSecurityTab = () => {
        setIsSecurityTab(true);
        setIsAppearanceTab(false);
        setIsAboutTab(false);
    }
    const handleAppearanceTab = () => {
        setIsSecurityTab(false);
        setIsAppearanceTab(true);
        setIsAboutTab(false);
    }
    const handleAboutTab = () => {
        setIsSecurityTab(false);
        setIsAppearanceTab(false);
        setIsAboutTab(true);
    }

    return (
        <>
            <div className="SeparatorBox">
                <span></span>
                <div className="settings_tab_box long">
                    <button onClick={handleSecurityTab} className={`setting_tab re ${isSecurityTab ? ('Active') : ('')}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"
                            className="icon icon-tabler icons-tabler-filled icon-tabler-shield-half">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path
                                d="M11.998 2l.032 .002l.086 .005a1 1 0 0 1 .342 .104l.105 .062l.097 .076l.016 .015l.247 .21a11 11 0 0 0 7.189 2.537l.342 -.01a1 1 0 0 1 1.005 .717a13 13 0 0 1 -9.208 16.25a1 1 0 0 1 -.502 0a13 13 0 0 1 -9.209 -16.25a1 1 0 0 1 1.005 -.717a11 11 0 0 0 7.791 -2.75l.046 -.036l.053 -.041a1 1 0 0 1 .217 -.112l.075 -.023l.036 -.01a1 1 0 0 1 .12 -.022l.086 -.005zm.002 2.296l-.176 .135a13 13 0 0 1 -7.288 2.572l-.264 .006l-.064 .31a11 11 0 0 0 1.064 7.175l.17 .314a11 11 0 0 0 6.49 5.136l.068 .019z" />
                        </svg>
                        {t('security')}
                    </button>
                    <button onClick={handleAppearanceTab} className={`setting_tab re ${isAppearanceTab ? ('Active') : ('')}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className="icon icon-tabler icons-tabler-outline icon-tabler-layout">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M4 4m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v1a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" />
                            <path d="M4 13m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" />
                            <path d="M14 4m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" />
                        </svg>
                        {t('interface')}
                    </button>
                    <button onClick={handleAboutTab} className={`setting_tab re ${isAboutTab ? ('Active') : ('')}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className="icon icon-tabler icons-tabler-outline icon-tabler-file-invoice">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                            <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                            <path d="M9 7l1 0" />
                            <path d="M9 13l6 0" />
                            <path d="M13 17l2 0" />
                        </svg>
                        {t('about')}
                    </button>
                </div>
                <span id="SettingsLastLine"></span>
            </div>
            <div className="page_content">
                <div className={`settings_tab_page ${isSecurityTab ? 'show' : ''}`}>
                    <Security />
                </div>
                <div className={`settings_tab_page ${isAppearanceTab ? 'show' : ''}`}>
                    <Appearance />
                </div>
                <div className={`settings_tab_page ${isAboutTab ? 'show' : ''}`}>
                    <About />
                </div>
            </div>
            <BottomInfo hideCondition={isAboutTab} />
        </>
    )
}

export default Settings