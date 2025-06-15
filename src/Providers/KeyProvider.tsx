import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import getCurrentKey from '@/Utils/getCurrentKey';
import CopyText from '@/Utils/copyText';
import { generateCryptographicKey } from '@/Utils/keyUtils';
import ModalAlertBox from '@/Components/ModalAlertBox';

interface ChangeKeyModalProps {
    show?: boolean;
    onClose?: () => void;
}

const KeyProvider: React.FC<ChangeKeyModalProps> = ({ show, onClose }) => {
    const { t } = useTranslation();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [uniqueKey, setUniqueKey] = useState('');
    const [isSaveDisabled, setIsSaveDisabled] = useState(true);
    const [noKey, setNoKey] = useState(false);

    const uniqueKeyInputRef = useRef<HTMLInputElement>(null);

    const checkUniqueKey = useCallback(async () => {
        try {
            const noKey = await window.electronAPI.noUniqueKey();
            setNoKey(noKey)
            setIsModalVisible(noKey);
        } catch (error) {
            console.error('Error checking unique key:', error);
        }
    }, []);

    useEffect(() => {
        checkUniqueKey();
    }, [checkUniqueKey]);

    useEffect(() => {
        const fetchCurrentKey = async () => {
            const currentKey = await getCurrentKey();
            setUniqueKey(currentKey || '');
        };

        if (show) {
            setIsModalVisible(show);
        }

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

    useEffect(() => {
        if (noKey) {
            handleGenerateRandomKey();
        }
    }, [noKey])


    return (
        <div className={`modal_box ${isModalVisible ? 'Show' : ''}`} id="settingKeyBox">
            <div className="modal_content">
                <p className="modal_header">
                    {
                        noKey ? t("set_private_key") : t('change_private_key')
                    }
                </p>
                <div className='modal_box_alerts'>
                    <ModalAlertBox
                        header={t('what_is_this_key')}
                        text_info={t('what_is_this_key_info')}
                        type={0}
                        changable={true}
                    />
                    <ModalAlertBox
                        header={t('critical_security')}
                        text_info={t('critical_security_info')}
                        type={1}
                        changable={false}
                    />
                </div>
                <div className="InputContainer">
                    <button className="refresh_key_btn re" onClick={handleGenerateRandomKey}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 256 256"><path d="M216,128a88,88,0,1,1-88-88A88,88,0,0,1,216,128Z" opacity="0.2"></path><path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h28.69L182.06,73.37a79.56,79.56,0,0,0-56.13-23.43h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27a96,96,0,0,1,135,.79L208,76.69V48a8,8,0,0,1,16,0ZM186.41,183.29a80,80,0,0,1-112.47-.66L59.31,168H88a8,8,0,0,0,0-16H40a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V179.31l14.63,14.63A95.43,95.43,0,0,0,130,222.06h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z"></path></svg>
                    </button>
                    <input
                        ref={uniqueKeyInputRef}
                        spellCheck="false"
                        type="text"
                        className={`Input padding-2 ${IsCopied ? 'Success' : ''}`}
                        id="uniqueKey"
                        maxLength={64}
                        value={uniqueKey}
                        onChange={handleKeyInput}
                    />
                    <button className="InputCopyBTN re" onClick={handleCopyKey}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="22"
                            height="22"
                            fill="currentColor"
                            viewBox="0 0 256 256"
                        >
                            <path d="M216,40V168H168V88H88V40Z" opacity="0.2"></path>
                            <path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"></path>
                        </svg>
                    </button>
                </div>
                <div className="modal_btns">
                    {
                        !noKey && (
                            <button
                                className="secondary_button re"
                                onClick={handleClose}
                            >
                                {t('cancel')}
                            </button>
                        )
                    }
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

export default KeyProvider