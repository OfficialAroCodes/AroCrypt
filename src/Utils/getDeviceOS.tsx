import { useState } from "react";

export default function getDeviceOS() {
    const [osType, setOsType] = useState<'mac' | 'win' | 'linux' | null>(null);
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

    return osType;
}