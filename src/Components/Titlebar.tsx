import useAppVersion from '@/Utils/getAppVersion';
import React, { useState, useEffect, useRef } from 'react'
import MainDropDown from './MainDropDown';

interface TitlebarProps {
    isAbout: boolean;
}

const Titlebar: React.FC<TitlebarProps> = ({ isAbout }) => {
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
            if (isAbout) {
                window.close()
            } else {
                await window.electronAPI.closeWindow();
            }
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
                    <img src="./logo/logo.png" alt="AroCrypt Logo" className="titlebar_icon" />
                    <p className="titlebar_appname">AroCrypt <span>v{appVersion}</span></p>
                </div>
                <div className="titlebar_controls">
                    {
                        !isAbout && (
                            <>
                                <button
                                    className={`titlebar_button small re ${isMenuOpen ? "active" : ''}`}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setIsMenuOpen(prevState => !prevState);
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 256 256"><path d="M112,60a16,16,0,1,1,16,16A16,16,0,0,1,112,60Zm16,52a16,16,0,1,0,16,16A16,16,0,0,0,128,112Zm0,68a16,16,0,1,0,16,16A16,16,0,0,0,128,180Z"></path></svg>
                                </button>
                                <button className="titlebar_button re" onClick={handleMinimize}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128Z"></path></svg>
                                </button>
                            </>
                        )
                    }
                    <button className="titlebar_button close re" onClick={handleClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>
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