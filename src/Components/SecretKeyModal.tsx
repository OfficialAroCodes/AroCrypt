import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import getCurrentKey from '@/Utils/getCurrentKey';
import CopyText from '@/Utils/copyText';
import { generateCryptographicKey } from '@/Utils/keyUtils';
import ModalAlertBox from './ModalAlertBox';

interface ChangeKeyModalProps {
    show: boolean;
    onClose: () => void;
}

const SecretKeyModal: React.FC<ChangeKeyModalProps> = ({ show, onClose }) => {
    const { t } = useTranslation();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [uniqueKey, setUniqueKey] = useState('');
    const [isSaveDisabled, setIsSaveDisabled] = useState(true);
    const uniqueKeyInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchCurrentKey = async () => {
            const currentKey = await getCurrentKey();
            setUniqueKey(currentKey || '');
        };

        setIsModalVisible(show);

        if (show) {
            fetchCurrentKey();
            setIsSaveDisabled(true);

            setTimeout(() => {
                uniqueKeyInputRef.current?.focus();
            }, 100);
        }
    }, [show]);

    const handleClose = () => {
        setIsModalVisible(false);
        onClose && onClose();
    };

    const handleKeyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const key = e.target.value;
        const isValidKey = /^[a-zA-Z0-9]{0,64}$/.test(key);

        if (isValidKey) {
            setUniqueKey(key);
            setIsSaveDisabled(key.length < 64);
        }
    };

    const handleGenerateRandomKey = () => {
        const randomKey = generateCryptographicKey(32);
        setUniqueKey(randomKey);
        setIsSaveDisabled(false);

        if (uniqueKeyInputRef.current) {
            uniqueKeyInputRef.current.value = randomKey;
        }
    };

    const handleSaveKey = async () => {
        try {
            const result = await window.electronAPI.saveUniqueKey(uniqueKey);
            if (result) {
                handleClose();
            }
        } catch (error) {
            console.error('Error saving unique key:', error);
        }
    };

    const [IsCopied, setIsCopied] = useState(false);

    const handleCopyKey = async () => {
        const copyData = await CopyText(uniqueKey);

        if (copyData === "success") {
            setIsCopied(true);
            setTimeout(() => {
                setIsCopied(false);
            }, 1000);
        }
    }

    return (
        <div className={`modal_box ${isModalVisible ? 'Show' : ''}`} id="settingKeyBox">
            <div className="modal_content">
                <p className="modal_header">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 2a5 5 0 0 1 5 5v3a3 3 0 0 1 3 3v6a3 3 0 0 1 -3 3h-10a3 3 0 0 1 -3 -3v-6a3 3 0 0 1 3 -3v-3a5 5 0 0 1 5 -5m0 12a2 2 0 0 0 -1.995 1.85l-.005 .15a2 2 0 1 0 2 -2m0 -10a3 3 0 0 0 -3 3v3h6v-3a3 3 0 0 0 -3 -3" /></svg>
                    <span id="SecretKeyModalHeader">{t('change_secret_key')}</span>
                </p>
                <div className='modal_box_alerts'>
                    <ModalAlertBox header={t('what_is_this_key')} text_info={t('unique_secret_key_info')} type={0} />
                </div>
                <div className="InputContainer">
                    <input
                        ref={uniqueKeyInputRef}
                        spellCheck="false"
                        type="text"
                        className={`Input padding ${IsCopied ? 'Success' : ''}`}
                        id="uniqueKey"
                        placeholder={t('key_recommendation')}
                        maxLength={64}
                        value={uniqueKey}
                        onChange={handleKeyInput}
                    />
                    <button className="InputCopyBTN re" onClick={handleCopyKey}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24">
                            <g id="copy_line" fill="none">
                                <path d="M24 0v24H0V0zM12.593 23.258l-.011.002-.071.035-.02.004-.014-.004-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01-.017.428.005.02.01.013.104.074.015.004.012-.004.104-.074.012-.016.004-.017-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113-.013.002-.185.093-.01.01-.003.011.018.43.005.012.008.007.201.093c.012.004.023 0 .029-.008l.004-.014-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014-.034.614c0 .012.007.02.017.024l.015-.002.201-.093.01-.008.004-.011.017-.43-.003-.012-.01-.01z" />
                                <path fill="currentColor" d="M19 2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2V4a2 2 0 0 1 2-2zm-4 6H5v12h10zm-5 7a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2zm9-11H9v2h6a2 2 0 0 1 2 2v8h2zm-7 7a1 1 0 0 1 .117 1.993L12 13H8a1 1 0 0 1-.117-1.993L8 11z" />
                            </g>
                        </svg>
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'end' }}>
                        <p
                            id="generateRandomKey"
                            onClick={handleGenerateRandomKey}
                            style={{ cursor: 'pointer' }}
                        >
                            {t('generate_random_key')}
                        </p>
                    </div>
                </div>
                <div className="modal_btns">
                    <button
                        className="secondary_button re"
                        onClick={handleClose}
                    >
                        {t('cancel')}
                    </button>
                    <button
                        className="main_button re"
                        disabled={isSaveDisabled}
                        onClick={handleSaveKey}
                    >
                        {t('apply')}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SecretKeyModal