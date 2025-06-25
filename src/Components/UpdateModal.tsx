import useOpenLink from '@/Utils/openLink';
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

        return () => { };

    }, []);

    const [isLoading, setIsLoading] = useState(false);

    const handleDownloadUpdate = () => {
        setIsLoading(true);
        window.electronAPI.downloadUpdate?.();
    };

    // Get OS info: mac, win, or linux
    const [osType, setOsType] = useState<'mac' | 'win' | 'linux' | null>(null);

    useEffect(() => {
        let platform = '';
        if (window?.electronAPI?.getPlatform) {
            window.electronAPI.getPlatform().then((result: string) => {
                platform = result;
                if (platform.startsWith('win')) setOsType('win');
                else if (platform.startsWith('darwin') || platform === 'mac') setOsType('mac');
                else if (platform.startsWith('linux')) setOsType('linux');
                else setOsType(null);
            }).catch(() => setOsType(null));
        } else if (navigator?.userAgent) {
            const ua = navigator.userAgent.toLowerCase();
            if (ua.indexOf('win') !== -1) setOsType('win');
            else if (ua.indexOf('mac') !== -1) setOsType('mac');
            else if (ua.indexOf('linux') !== -1) setOsType('linux');
            else setOsType(null);
        }
    }, []);

    return (
        <div className={`modal_box ${isUpdateAvailable && 'Show'}`}>
            <div className="modal_content update_modal">
                <div className='update_box'>
                    <div className='icon'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="currentColor" viewBox="0 0 256 256"><path d="M216,128a88,88,0,1,1-88-88A88,88,0,0,1,216,128Z" opacity="0.2"></path><path d="M88,104H40a8,8,0,0,1-8-8V48a8,8,0,0,1,16,0V76.69L62.63,62.06A95.43,95.43,0,0,1,130,33.94h.53a95.36,95.36,0,0,1,67.07,27.33,8,8,0,0,1-11.18,11.44,79.52,79.52,0,0,0-55.89-22.77h-.45A79.56,79.56,0,0,0,73.94,73.37L59.31,88H88a8,8,0,0,1,0,16Zm128,48H168a8,8,0,0,0,0,16h28.69l-14.63,14.63a79.56,79.56,0,0,1-56.13,23.43h-.45a79.52,79.52,0,0,1-55.89-22.77,8,8,0,1,0-11.18,11.44,95.36,95.36,0,0,0,67.07,27.33H126a95.43,95.43,0,0,0,67.36-28.12L208,179.31V208a8,8,0,0,0,16,0V160A8,8,0,0,0,216,152Z"></path></svg>
                    </div>
                    <div className='details'>
                        <p className='modal_header uh'>{t('update_required')}</p>
                        <p className="update_info">{t('update_info')}</p>
                    </div>
                    {
                        osType === "mac" ? (
                            <button
                                className='main_button re'
                                onClick={() => useOpenLink("https://github.com/OfficialAroCodes/AroCrypt/releases/latest")}
                            >
                                {t("open_github_rel")}
                            </button>

                        ) : (
                            <button
                                className='main_button re'
                                disabled={isLoading}
                                onClick={handleDownloadUpdate}
                            >
                                {isLoading ? (
                                    <>
                                        <svg
                                            className="btn_container"
                                            viewBox="0 0 40 40"
                                            height="40"
                                            width="40"
                                        >
                                            <circle
                                                className="track"
                                                cx="20"
                                                cy="20"
                                                r="17.5"
                                                pathLength="100"
                                                stroke-width="5px"
                                                fill="none"
                                            />
                                            <circle
                                                className="car"
                                                cx="20"
                                                cy="20"
                                                r="17.5"
                                                pathLength="100"
                                                stroke-width="5px"
                                                fill="none"
                                            />
                                        </svg>
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M232,136v64a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V136a8,8,0,0,1,8-8H224A8,8,0,0,1,232,136Z" opacity="0.2"></path><path d="M240,136v64a16,16,0,0,1-16,16H32a16,16,0,0,1-16-16V136a16,16,0,0,1,16-16H72a8,8,0,0,1,0,16H32v64H224V136H184a8,8,0,0,1,0-16h40A16,16,0,0,1,240,136Zm-117.66-2.34a8,8,0,0,0,11.32,0l48-48a8,8,0,0,0-11.32-11.32L136,108.69V24a8,8,0,0,0-16,0v84.69L85.66,74.34A8,8,0,0,0,74.34,85.66ZM200,168a12,12,0,1,0-12,12A12,12,0,0,0,200,168Z"></path></svg>
                                        {t('update_to')} v{updateVersion}
                                    </>
                                )}
                            </button>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default UpdateModal;