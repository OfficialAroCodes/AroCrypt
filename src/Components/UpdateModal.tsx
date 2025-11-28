import useOpenLink from '@/Utils/openLink';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import InlineMessageBox from './InlineMessageBox';
import getDeviceOS from '@/Utils/getDeviceOS';

const UpdateModal = () => {
    const { t } = useTranslation();
    const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
    const [updateVersion, setUpdateVersion] = useState<string | null>(null);
    const osType = getDeviceOS();

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
    const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

    const handleDownloadUpdate = () => {
        setIsLoading(true);
        window.electronAPI.downloadUpdate?.();
    };

    useEffect(() => {
        if (!isLoading) return;
        const handleProgress = (progress: { percent: number }) => {
            setDownloadProgress(progress.percent);
        };
        window.electronAPI.onUpdateDownloadProgress(handleProgress);
        return () => {
            // No way to remove listener with current API, but safe for now
        };
    }, [isLoading]);

    return (
        <div className={`modal_box update_box ${isUpdateAvailable && 'Show'}`}>
            <div className="modal_content update_modal">
                <div className='update_box'>
                    <div className='icon'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" viewBox="0 0 256 256"><path d="M216,128a88,88,0,1,1-88-88A88,88,0,0,1,216,128Z" opacity="0.2"></path><path d="M88,104H40a8,8,0,0,1-8-8V48a8,8,0,0,1,16,0V76.69L62.63,62.06A95.43,95.43,0,0,1,130,33.94h.53a95.36,95.36,0,0,1,67.07,27.33,8,8,0,0,1-11.18,11.44,79.52,79.52,0,0,0-55.89-22.77h-.45A79.56,79.56,0,0,0,73.94,73.37L59.31,88H88a8,8,0,0,1,0,16Zm128,48H168a8,8,0,0,0,0,16h28.69l-14.63,14.63a79.56,79.56,0,0,1-56.13,23.43h-.45a79.52,79.52,0,0,1-55.89-22.77,8,8,0,1,0-11.18,11.44,95.36,95.36,0,0,0,67.07,27.33H126a95.43,95.43,0,0,0,67.36-28.12L208,179.31V208a8,8,0,0,0,16,0V160A8,8,0,0,0,216,152Z"></path></svg>
                    </div>
                    <div className='details'>
                        <p className='modal_header uh'>{t('update_required')}</p>
                        <p className="update_info">{t('update_info')}</p>
                    </div>
                    {
                        osType === "mac" ? (
                            <>
                                {
                                    osType === "mac" && (
                                        <InlineMessageBox
                                            message={"Автообновление не работает, так как у приложения отсутствует подпись Apple Developer ID."}
                                            type={2}
                                        />
                                    )
                                }
                                <button
                                    className='main_button re'
                                    onClick={() => useOpenLink("https://arocrypt.vercel.app/download")}
                                >
                                    {t("open_latest_version")}
                                </button>
                            </>
                        ) : (
                            isLoading ? (
                                <>
                                    <div className='progressbar_box'>
                                        <div className='text_info'>
                                            <p className='text'>{t('downloading')}</p>
                                            <p className='percent'>{downloadProgress !== null ? `${downloadProgress.toFixed(1)}%` : "0%"} / 100%</p>
                                        </div>
                                        <div className='progressbar'>
                                            <div className='line' style={{
                                                width: `${downloadProgress ?? 0}%`,
                                            }} />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <button
                                    className='main_button re'
                                    disabled={isLoading}
                                    onClick={handleDownloadUpdate}
                                >

                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 256 256"><path d="M216,128a88,88,0,1,1-88-88A88,88,0,0,1,216,128Z" opacity="0.2"></path><path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h28.69L182.06,73.37a79.56,79.56,0,0,0-56.13-23.43h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27a96,96,0,0,1,135,.79L208,76.69V48a8,8,0,0,1,16,0ZM186.41,183.29a80,80,0,0,1-112.47-.66L59.31,168H88a8,8,0,0,0,0-16H40a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V179.31l14.63,14.63A95.43,95.43,0,0,0,130,222.06h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z"></path></svg>
                                        {t('update_now')}
                                    </>
                                </button>
                            )
                        )
                    }
                </div>
            </div>
        </div >
    )
}

export default UpdateModal;