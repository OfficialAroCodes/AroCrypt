import { useState, useEffect } from 'react'

export const useAppVersion = () => {
    const [appVersion, setAppVersion] = useState<string>('')

    useEffect(() => {
        const fetchAppVersion = async () => {
            try {
                const version = await window.electronAPI.getAppVersion();
                setAppVersion(version);
            } catch (error) {
                console.error('Failed to fetch app version:', error);
                setAppVersion('[unknown]');
            }
        };

        fetchAppVersion();
    }, []);

    return appVersion;
}

export default useAppVersion;