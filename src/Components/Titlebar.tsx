import useAppVersion from '@/Utils/getAppVersion';
import React, { useState, useEffect, useRef } from 'react'
import MainDropDown from './MainDropDown';
import { useClickOutside } from 'react-haiku';

interface TitlebarProps {
    isAbout: boolean;
}

const Titlebar: React.FC<TitlebarProps> = ({ isAbout }) => {
    const appVersion = useAppVersion();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const dropdownRef = useRef(null);

    const handleMinimize = async () => {
        try {
            await window.electronAPI.minimizeWindow();
        } catch (error) {
            console.error('Failed to minimize window:', error);
        }
    }

    const handleMaximize = async () => {
        try {
            await window.electronAPI.maximizeWindow();
        } catch (error) {
            console.error('Failed to minimize window:', error);
        }
    }

    useEffect(() => {
        window.electronAPI.onMaximize((state) => {
            setIsMaximized(state);
        });
    }, []);

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

    useClickOutside(dropdownRef, () => setIsMenuOpen(false));

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
                                <div ref={dropdownRef}>
                                    <button
                                        className={`titlebar_button small re ${isMenuOpen ? "active" : ''}`}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            setIsMenuOpen(prevState => !prevState);
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 256 256"><path d="M112,60a16,16,0,1,1,16,16A16,16,0,0,1,112,60Zm16,52a16,16,0,1,0,16,16A16,16,0,0,0,128,112Zm0,68a16,16,0,1,0,16,16A16,16,0,0,0,128,180Z"></path></svg>
                                    </button>
                                    <MainDropDown isShown={isMenuOpen} />
                                </div>
                                <button className="titlebar_button re" onClick={handleMinimize}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M228,128a12,12,0,0,1-12,12H40a12,12,0,0,1,0-24H216A12,12,0,0,1,228,128Z"></path></svg>
                                </button>
                                <button className="titlebar_button re" onClick={handleMaximize}>
                                    {
                                        isMaximized ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M216,28H88A12,12,0,0,0,76,40V76H40A12,12,0,0,0,28,88V216a12,12,0,0,0,12,12H168a12,12,0,0,0,12-12V180h36a12,12,0,0,0,12-12V40A12,12,0,0,0,216,28ZM156,204H52V100H156Zm48-48H180V88a12,12,0,0,0-12-12H100V52H204Z"></path></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M208,28H48A20,20,0,0,0,28,48V208a20,20,0,0,0,20,20H208a20,20,0,0,0,20-20V48A20,20,0,0,0,208,28Zm-4,176H52V52H204Z"></path></svg>
                                        )
                                    }
                                </button>
                            </>
                        )
                    }
                    <button className="titlebar_button close re" onClick={handleClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>
                    </button>
                </div>
            </div>
        </>
    )
}

export default Titlebar;