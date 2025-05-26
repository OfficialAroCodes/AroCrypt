import useAppVersion from '@/Utils/getAppVersion'
import useOpenLink from '@/Utils/openLink';
import { useTranslation } from 'react-i18next';

const About = () => {
    const appVersion = useAppVersion();
    const { t } = useTranslation();

    return (
        <div className="settings_about_page">
            <div className='about_container'>
                <p className='about_container_header'>{t("for_what_app")}</p>
                <p className='about_container_info'>{t("about_This_app_info")}</p>
            </div>
            <div className="SeparatorBox">
                <span></span>
                <p className="SectionName">{t("used_techno")}</p>
                <span></span>
            </div>
            <div className='tech_container'>
                <div onClick={() => useOpenLink("https://www.electronjs.org/")} className='tech_box re'>
                    <img src="./icons/electron.svg" alt="electronjs" />
                    <p className='tech_name'>Electron.js</p>
                </div>
                <div onClick={() => useOpenLink("https://react.dev/")} className='tech_box re'>
                    <img src="./icons/reactjs.svg" alt="electronjs" />
                    <p className='tech_name'>React.js</p>
                </div>
                <div onClick={() => useOpenLink("https://nodejs.org/")} className='tech_box re'>
                    <img src="./icons/nodejs.svg" alt="electronjs" />
                    <p className='tech_name'>Node.js</p>
                </div>
                <div onClick={() => useOpenLink("https://www.typescriptlang.org/")} className='tech_box re'>
                    <img src="./icons/typescript.svg" alt="electronjs" />
                    <p className='tech_name'>TypeScript</p>
                </div>
                <div onClick={() => useOpenLink("https://developer.mozilla.org/en-US/docs/Web/JavaScript")} className='tech_box re'>
                    <img src="./icons/javascript.svg" alt="electronjs" />
                    <p className='tech_name'>JavaScript</p>
                </div>
                <div onClick={() => useOpenLink("https://vite.dev/")} className='tech_box re'>
                    <img src="./icons/redux.svg" alt="electronjs" />
                    <p className='tech_name'>Redux</p>
                </div>
            </div>
            <div className="SeparatorBox">
                <span></span>
                <p className="SectionName">{t("about_app_info")}</p>
                <span></span>
            </div>
            <div className='app_info_container'>
                <div className='app_info_box'>
                    <img src="./logo/128x128.png" alt="App Logo" />
                    <div className='app_info_details'>
                        <p className='about_app_name'>AroCrypt</p>
                        <p className='about_app_version'>v{appVersion}</p>
                    </div>
                </div>
                <div className='app_info_btns'>
                    <button className="mini_btn re" onClick={() => useOpenLink("https://github.com/OfficialAroCodes/arocrypt")}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5" /></svg>
                        {t("source_code")}
                    </button>
                    <button className="mini_btn re support" onClick={() => useOpenLink("https://buymeacoffee.com/arocodesw")}>
                        <img src="./icons/buymeacoffee.svg" alt="coffie" />
                        {t("support_me")}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default About