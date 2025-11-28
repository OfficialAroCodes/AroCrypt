import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import CopyText from '@/Utils/copyText';
import { useClickOutside } from 'react-haiku';
import Checkbox from '@/Components/ui/Checkbox';
import getKeys from '@/Utils/getUserKeys';
import { useToast } from '@/Context/ToastContext';

interface ChangeKeyModalProps {
    show?: boolean;
    onClose?: () => void;
}

const KeysProvider: React.FC<ChangeKeyModalProps> = ({ show, onClose }) => {
    const { t } = useTranslation();
    const toast = useToast();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isSaveDisabled, setIsSaveDisabled] = useState(true);
    const [copiedInput, setCopiedInput] = useState('');
    const [isChecked, setIsChecked] = useState(false);

    // # Keys
    const [privateKey, setPrivateKey] = useState('');
    const [publicKey, setPublicKey] = useState('');
    const [recipientKey, setRecipientKey] = useState('');

    const [noKeys, setNoKeys] = useState(false);

    const privateKeyInputRef = useRef<HTMLInputElement>(null);
    const publicKeyInputRef = useRef<HTMLInputElement>(null);
    const recipientKeyInputRef = useRef<HTMLInputElement>(null);

    const [manualOpen, setManualOpen] = useState(false);

    const checkKeys = useCallback(async () => {
        try {
            const keys = await window.electronAPI.noKeys();
            setNoKeys(keys)
        } catch (error) {
            console.error('Error checking unique key:', error);
        }
    }, []);

    useEffect(() => {
        if (show) {
            setIsModalVisible(true);
            setManualOpen(true);
        } else if (!manualOpen) {
            if (noKeys) {
                setIsModalVisible(true);
            } else {
                setIsModalVisible(false);
            }
        }

        if (noKeys) {
            setIsChecked(true);
        }
    }, [show, noKeys, manualOpen]);

    useEffect(() => {
        checkKeys();
    }, [checkKeys, manualOpen]);

    useEffect(() => {
        if (!show) setManualOpen(false);
    }, [show]);

    const fetchUserKeys = useCallback(async () => {
        const keys = await getKeys();

        if (keys && Array.isArray(keys) && keys.length > 0) {
            setPrivateKey(keys[0].secret || '');
            setPublicKey(keys[0].public || '');
            setRecipientKey(keys[0].recipient || '');
        } else {
            setPrivateKey('');
            setPublicKey('');
            setRecipientKey('');
        }
    }, []);

    useEffect(() => {
        if (isModalVisible) {
            fetchUserKeys();
            setIsSaveDisabled(true);
        }
    }, [isModalVisible, fetchUserKeys]);

    const handleClose = () => {
        setIsModalVisible(false);
        setManualOpen(false);
        onClose && onClose();
    };

    const handlePrivateKeyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const key = e.target.value;

        setPrivateKey(key);
        setIsSaveDisabled(key.length < 3100);
    };

    const handlePublicKeyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const key = e.target.value;

        setPublicKey(key);
        setIsSaveDisabled(key.length < 1500);
    };

    const handleRecipientKeyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const key = e.target.value;

        setRecipientKey(key);
        setIsSaveDisabled(key.length < 1500);
    };

    const handleGenerateKeyPair = async () => {
        try {
            const paired_keys = await window.electronAPI.kyberKeyPair();
            setIsShowPrivateKey(true);
            setTimeout(() => {
                setIsShowPrivateKey(false);
            }, 3000);
            setPrivateKey(paired_keys.secretKey);
            setPublicKey(paired_keys.publicKey);
        } catch (error) {
            console.error('Error checking unique key:', error);
        }
    }

    useEffect(() => {
        setIsSaveDisabled(publicKey.length < 1500 || privateKey.length < 3100 || recipientKey.length < 1500)
    }, [publicKey, privateKey, recipientKey])

    const handleSaveKeys = async () => {
        try {
            const result = await window.electronAPI.saveKeys(privateKey, publicKey, recipientKey);

            if (result) {
                handleClose();
                toast(1, t('toast.keys_saved_msg'), t('toast.keys_saved_title'));
            }
        } catch (error) {
            console.error('Error saving keys:', error);
        }
    };

    const ModalRef = useRef(null);

    if (!noKeys) {
        useClickOutside(ModalRef, handleClose);
    } else {
        useClickOutside(ModalRef, () => { })
    }

    useEffect(() => {
        setIsChecked(false)
    }, [manualOpen])

    const [isShowPrivateKey, setIsShowPrivateKey] = useState(false);

    return (
        <div className={`modal_box ${isModalVisible ? 'Show' : ''}`} id="settingKeyBox">
            <div className="modal_content large" ref={ModalRef}>
                <div className="modal_top_content_box">
                    <p className='logs_count_box'></p>
                    <p className="modal_header">
                        {noKeys ? t('setup_keys') : t('manage_keys')}
                    </p>
                    <div className="modal_top_btns">
                        {(!noKeys) && (
                            <button className="modal_close_btn re" onClick={handleClose}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>
                            </button>
                        )}
                    </div>
                </div>
                <button
                    className='generate_new_pair re'
                    onClick={handleGenerateKeyPair}
                >
                    <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M216,56v56c0,96-88,120-88,120S40,208,40,112V56a8,8,0,0,1,8-8H208A8,8,0,0,1,216,56Z" opacity="0.2"></path><path d="M80.57,117A8,8,0,0,1,91,112.57l29,11.61V96a8,8,0,0,1,16,0v28.18l29-11.61A8,8,0,1,1,171,127.43l-30.31,12.12L158.4,163.2a8,8,0,1,1-12.8,9.6L128,149.33,110.4,172.8a8,8,0,1,1-12.8-9.6l17.74-23.65L85,127.43A8,8,0,0,1,80.57,117ZM224,56v56c0,52.72-25.52,84.67-46.93,102.19-23.06,18.86-46,25.27-47,25.53a8,8,0,0,1-4.2,0c-1-.26-23.91-6.67-47-25.53C57.52,196.67,32,164.72,32,112V56A16,16,0,0,1,48,40H208A16,16,0,0,1,224,56Zm-16,0L48,56l0,56c0,37.3,13.82,67.51,41.07,89.81A128.25,128.25,0,0,0,128,223.62a129.3,129.3,0,0,0,39.41-22.2C194.34,179.16,208,149.07,208,112Z"></path></svg>
                        {t('create_key_pair')}
                    </span>
                    <span className='badge'>
                        {t('quantum_safe')}
                    </span>
                </button>
                <span className='modal_line' />
                <div className="InputContainer">
                    <label>{t('public_key')}</label>
                    <input
                        ref={publicKeyInputRef}
                        spellCheck="false"
                        type="text"
                        className={`Input padding ${copiedInput === 'public' ? 'Success' : ''}`}
                        minLength={1500}
                        maxLength={1600}
                        value={publicKey}
                        onChange={handlePublicKeyInput}
                    />
                    <button
                        className="input_side_button re"
                        onClick={() => {
                            CopyText(publicKey)
                            setCopiedInput('public');

                            setTimeout(() => {
                                setCopiedInput('')
                            }, 800);
                        }}
                    >
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
                <div className="InputContainer">
                    <button
                        className="input_side_button left re"
                        onClick={() => setIsShowPrivateKey(!isShowPrivateKey)}
                    >
                        {
                            isShowPrivateKey ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 256 256"><path d="M128,56C48,56,16,128,16,128s32,72,112,72,112-72,112-72S208,56,128,56Zm0,112a40,40,0,1,1,40-40A40,40,0,0,1,128,168Z" opacity="0.2"></path><path d="M53.92,34.62A8,8,0,1,0,42.08,45.38L61.32,66.55C25,88.84,9.38,123.2,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208a127.11,127.11,0,0,0,52.07-10.83l22,24.21a8,8,0,1,0,11.84-10.76Zm47.33,75.84,41.67,45.85a32,32,0,0,1-41.67-45.85ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.16,133.16,0,0,1,25,128c4.69-8.79,19.66-33.39,47.35-49.38l18,19.75a48,48,0,0,0,63.66,70l14.73,16.2A112,112,0,0,1,128,192Zm6-95.43a8,8,0,0,1,3-15.72,48.16,48.16,0,0,1,38.77,42.64,8,8,0,0,1-7.22,8.71,6.39,6.39,0,0,1-.75,0,8,8,0,0,1-8-7.26A32.09,32.09,0,0,0,134,96.57Zm113.28,34.69c-.42.94-10.55,23.37-33.36,43.8a8,8,0,1,1-10.67-11.92A132.77,132.77,0,0,0,231.05,128a133.15,133.15,0,0,0-23.12-30.77C185.67,75.19,158.78,64,128,64a118.37,118.37,0,0,0-19.36,1.57A8,8,0,1,1,106,49.79,134,134,0,0,1,128,48c34.88,0,66.57,13.26,91.66,38.35,18.83,18.83,27.3,37.62,27.65,38.41A8,8,0,0,1,247.31,131.26Z"></path></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 256 256"><path d="M128,56C48,56,16,128,16,128s32,72,112,72,112-72,112-72S208,56,128,56Zm0,112a40,40,0,1,1,40-40A40,40,0,0,1,128,168Z" opacity="0.2"></path><path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path></svg>
                            )
                        }
                    </button>
                    <label>{t('private_key')} <span className='badge'>{t('dont_share')}</span></label>
                    <input
                        ref={privateKeyInputRef}
                        spellCheck="false"
                        type={isShowPrivateKey ? 'text' : 'password'}
                        className={`Input padding-2 ${copiedInput === 'private' ? 'Success' : ''}`}
                        minLength={3100}
                        maxLength={3300}
                        value={privateKey}
                        onChange={handlePrivateKeyInput}
                    />
                    <button
                        className="input_side_button re"
                        onClick={() => {
                            CopyText(privateKey)
                            setCopiedInput('private');

                            setTimeout(() => {
                                setCopiedInput('')
                            }, 800);
                        }}
                    >
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
                <span className='modal_line' />
                <div className="InputContainer">
                    <label>{t('recipient_public_key')}</label>
                    <input
                        ref={recipientKeyInputRef}
                        spellCheck="false"
                        type="text"
                        className={`Input padding ${copiedInput === 'recipient' ? 'Success' : ''}`}
                        minLength={1500}
                        maxLength={1600}
                        value={recipientKey}
                        onChange={handleRecipientKeyInput}
                    />
                    <button
                        className="input_side_button re"
                        onClick={() => {
                            CopyText(publicKey)
                            setCopiedInput('recipient');

                            setTimeout(() => {
                                setCopiedInput('')
                            }, 800);
                        }}
                    >
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
                <span className='modal_line' />
                {(!noKeys) && (
                    <div className='agreement_box'>
                        <Checkbox isChecked={isChecked} onToggle={setIsChecked} />
                        <label className='text' onClick={() => setIsChecked(!isChecked)}>
                            {t('apply_agreement_info')}
                        </label>
                    </div>
                )}
                <div className="modal_btns">
                    {(!noKeys) && (
                        <button
                            className="secondary_button re"
                            onClick={handleClose}
                        >
                            {t('cancel')}
                        </button>
                    )}
                    <button
                        className="main_button re"
                        disabled={isSaveDisabled || !isChecked}
                        onClick={handleSaveKeys}
                    >
                        {t('apply')}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default KeysProvider