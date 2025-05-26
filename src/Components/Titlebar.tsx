import useAppVersion from '@/Utils/getAppVersion';
import React, { useState, useEffect, useRef } from 'react'
import MainDropDown from './MainDropDown';

const Titlebar: React.FC = () => {
    const appVersion = useAppVersion();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleMinimize = async () => {
        try {
            await window.electronAPI.minimizeWindow();
        } catch (error) {
            console.error('Failed to minimize window:', error);
        }
    }

    const handleClose = async () => {
        try {
            await window.electronAPI.closeWindow();
        } catch (error) {
            console.error('Failed to close window:', error);
        }
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                !(event.target as HTMLElement).closest('.titlebar_button.small.re')
            ) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [setIsMenuOpen]);

    return (
        <>
            <div className="titlebar">
                <div className="titlebar_title">
                    <img src="./logo/128x128.png" alt="AroCrypt Logo" className="titlebar_icon" />
                    <p className="titlebar_appname">AroCrypt <span>v{appVersion}</span></p>
                </div>
                <div className="titlebar_controls">
                    <button
                        className={`titlebar_button small re ${isMenuOpen ? "active" : ''}`}
                        onClick={(event) => {
                            event.stopPropagation();
                            setIsMenuOpen(prevState => !prevState);
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /></svg>
                    </button>
                    <button className="titlebar_button re" onClick={handleMinimize}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className="icon icon-tabler icons-tabler-outline icon-tabler-minus">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M5 12l14 0" />
                        </svg>
                    </button>
                    <button className="titlebar_button close re" onClick={handleClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className="icon icon-tabler icons-tabler-outline icon-tabler-x">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M18 6l-12 12" />
                            <path d="M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
            <div ref={dropdownRef} style={{ position: 'absolute' }}>
                <MainDropDown show={isMenuOpen} />
            </div>
        </>
    )
}

export default Titlebar;