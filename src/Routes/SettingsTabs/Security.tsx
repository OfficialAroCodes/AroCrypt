import SecretKeyModal from '@/Components/SecretKeyModal';
import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
    setEncryptionMethod,
    setDecryptionMethod
} from '@/store/encryptionMethodSlice';
import { useTranslation } from 'react-i18next';

const Security = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { encryptionMethod, decryptionMethod } = useAppSelector(
        (state) => state.encryptionMethod
    );
    const [isChangingKey, setIsChangingKey] = useState(false);

    const handleEncryptionMethodChange = (method: any) => {
        dispatch(setEncryptionMethod(method));
    };

    const handleDecryptionMethodChange = (method: any) => {
        dispatch(setDecryptionMethod(method));
    };

    const [isEnMenuOpen, setIsEnMenuOpen] = useState(false);
    const enDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                enDropdownRef.current &&
                !enDropdownRef.current.contains(event.target as Node) &&
                !(event.target as HTMLElement).closest('.settings_dropdown_btn')
            ) {
                setIsEnMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [setIsEnMenuOpen]);

    const [isDeMenuOpen, setIsDeMenuOpen] = useState(false);
    const deDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                deDropdownRef.current &&
                !deDropdownRef.current.contains(event.target as Node) &&
                !(event.target as HTMLElement).closest('.settings_dropdown_btn')
            ) {
                setIsDeMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [setIsDeMenuOpen]);

    return (
        <>
            <div className="setting_row">
                <div className="setting_row_textes">
                    <p className="setting_row_header">{t('en_method')}</p>
                    <p className="setting_row_info">{t('en_method_info')}</p>
                </div>
                <div className='settings_dropdown_container'>
                    <button
                        className='settings_dropdown_btn uc re'
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsDeMenuOpen(false);
                            setIsEnMenuOpen(!isEnMenuOpen);
                        }}
                    >
                        {encryptionMethod}
                        <svg className={isEnMenuOpen ? 'rotate' : ''} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M6 9l6 6l6 -6" /></svg>
                    </button>
                    <div ref={enDropdownRef} className={`settings_dropdown_box ${isEnMenuOpen ? 'show' : ''}`}>
                        <button
                            className={`re ${encryptionMethod === 'aes-256-cbc' ? 'active' : ''}`}
                            onClick={() => handleEncryptionMethodChange('aes-256-cbc')}
                        >
                            AES-256-CBC
                        </button>
                        <button
                            className={`re ${encryptionMethod === 'aes-192-cbc' ? 'active' : ''}`}
                            onClick={() => handleEncryptionMethodChange('aes-192-cbc')}
                        >
                            AES-192-CBC
                        </button>
                        <button
                            className={`re ${encryptionMethod === 'aes-128-cbc' ? 'active' : ''}`}
                            onClick={() => handleEncryptionMethodChange('aes-128-cbc')}
                        >
                            AES-128-CBC
                        </button>
                    </div>
                </div>
            </div>
            <div className="setting_row">
                <div className="setting_row_textes">
                    <p className="setting_row_header">{t('de_method')}</p>
                    <p className="setting_row_info">{t('de_method_info')}</p>
                </div>
                <div className='settings_dropdown_container'>
                    <button
                        className='settings_dropdown_btn uc re'
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsEnMenuOpen(false);
                            setIsDeMenuOpen(!isDeMenuOpen);
                        }}
                    >
                        {decryptionMethod}
                        <svg className={isDeMenuOpen ? 'rotate' : ''} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M6 9l6 6l6 -6" /></svg>
                    </button>
                    <div ref={deDropdownRef} className={`settings_dropdown_box ${isDeMenuOpen ? 'show' : ''}`}>
                        <button
                            className={`re ${decryptionMethod === 'aes-256-cbc' ? 'active' : ''}`}
                            onClick={() => handleDecryptionMethodChange('aes-256-cbc')}
                        >
                            AES-256-CBC
                        </button>
                        <button
                            className={`re ${decryptionMethod === 'aes-192-cbc' ? 'active' : ''}`}
                            onClick={() => handleDecryptionMethodChange('aes-192-cbc')}
                        >
                            AES-192-CBC
                        </button>
                        <button
                            className={`re ${decryptionMethod === 'aes-128-cbc' ? 'active' : ''}`}
                            onClick={() => handleDecryptionMethodChange('aes-128-cbc')}
                        >
                            AES-128-CBC
                        </button>
                    </div>
                </div>
            </div>
            <div className="SeparatorBox">
                <span></span>
                <p className="SectionName">{t('extra_security')}</p>
                <span></span>
            </div>
            <div className="setting_row">
                <div className="setting_row_textes">
                    <p className="setting_row_header">{t('secret_key')}</p>
                    <p className="setting_row_info">{t('secret_key_info')}</p>
                </div>
                <button className="setting_row_btn re" onClick={() => setIsChangingKey(true)}>{t('change')}</button>
            </div>

            <SecretKeyModal show={isChangingKey} onClose={() => setIsChangingKey(false)} />
        </>
    )
}

export default Security