import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const UpdateModal = () => {
    const { t } = useTranslation();
    const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
    const [updateVersion, setUpdateVersion] = useState<string | null>(null);

    useEffect(() => {
        window.electronAPI.checkForUpdates().catch((error) => {
            console.error('Update check failed:', error);
        });

        const handleUpdateAvailable = (updateInfo: any) => {
            console.log('Update availability event:', updateInfo);
            if (updateInfo.isUpdateAvailable) {
                setIsUpdateAvailable(true);
                setUpdateVersion(updateInfo.version);
            }
        };

        const handleUpdateNotAvailable = (updateInfo: any) => {
            console.log('No update available:', updateInfo);
            setIsUpdateAvailable(false);
            setUpdateVersion(null);
        };

        window.electronAPI.onUpdateAvailable(handleUpdateAvailable);
        window.electronAPI.onUpdateNotAvailable(handleUpdateNotAvailable);

        return () => {
        };
    }, []);

    const [isLoading, setIsLoading] = useState(false);

    const handleDownloadUpdate = () => {
        setIsLoading(true);
        window.electronAPI.downloadUpdate?.();
    };

    return (
        <div className={`modal_box ${isUpdateAvailable && 'Show'}`}>
            <div className="modal_content">
                <p className='modal_header'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M18 4h-6a3 3 0 0 0 -3 3v10a3 3 0 0 0 3 3h6a3 3 0 0 0 3 -3v-10a3 3 0 0 0 -3 -3z" /><path d="M7 6a1 1 0 0 1 .993 .883l.007 .117v10a1 1 0 0 1 -1.993 .117l-.007 -.117v-10a1 1 0 0 1 1 -1z" /><path d="M4 7a1 1 0 0 1 .993 .883l.007 .117v8a1 1 0 0 1 -1.993 .117l-.007 -.117v-8a1 1 0 0 1 1 -1z" /></svg>
                    {t("update_available")}
                </p>
                <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className='update_ill'> <g clipPath="url(#clip0_221_10)"> <path d="M0 0H100C155.228 0 200 44.7715 200 100V200H100C44.7715 200 0 155.228 0 100V0Z" fill="url(#paint0_linear_221_10)" /> </g> <defs> <linearGradient id="paint0_linear_221_10" x1="100" y1="0" x2="100" y2="200" gradientUnits="userSpaceOnUse"> <stop stopColor="#A7B5FF" /> <stop offset="1" stopColor="#F3ACFF" /> </linearGradient> <clipPath id="clip0_221_10"> <rect width="200" height="200" fill="white" /> </clipPath> </defs> </svg>
                <p className="update_info">{t("update_available_info")} v{updateVersion}</p>
                <button className='main_button re' disabled={isLoading} onClick={handleDownloadUpdate}>
                    {isLoading ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /><path d="M9 14v.01" /><path d="M12 14v.01" /><path d="M15 14v.01" /></svg>
                            {t("please_wait_for_btn")}
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path d="M7 11l5 5l5 -5" /><path d="M12 4l0 12" /></svg>
                            {t("download_install_btn")}
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}

export default UpdateModal;