import FileEncryptionComponent from '@/Components/FileEncryptionForm';
import CopyText from '@/Utils/copyText';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setOutputText, setIvText, setEncryptText } from '../store/encryptionSlice';
import BottomInfo from '@/Components/BottomInfo';

const Encryption: React.FC = () => {
    const { t } = useTranslation();
    const [inputText, setInputText] = useState('');
    const dispatch = useDispatch();
    const { outputText, ivText, encryptText } = useSelector((state: RootState) => state.encryption);
    const [isFileMode, setIsFileMode] = useState(false);
    const en_method = localStorage.getItem("encryptionMethod") || "aes-256-cbc";

    const handleEncrypt = async () => {
        if (!inputText) {
            alert('Please enter text to encrypt');
            return;
        }

        try {
            const data = await window.electronAPI.encrypt({
                text: inputText,
                method: en_method
            });

            dispatch(setOutputText(data.content));
            dispatch(setIvText(data.iv));
            dispatch(setEncryptText(inputText));
        } catch (error: any) {
            console.error('Encryption error:', error);
            alert(`Encryption failed: ${error.message}`);
        }
    };

    const [isCopiedEn, setIsCopiedEn] = useState(false);
    const [isCopiedSe, setIsCopiedSe] = useState(false);

    const handleCopyTextEn = async () => {
        const copyData = await CopyText(outputText);

        if (copyData === "success") {
            setIsCopiedEn(true);
            setTimeout(() => {
                setIsCopiedEn(false);
            }, 1000);
        }
    };

    const handleCopyTextSe = async () => {
        const copyData = await CopyText(ivText);

        if (copyData === "success") {
            setIsCopiedSe(true);
            setTimeout(() => {
                setIsCopiedSe(false);
            }, 1000);
        }
    };

    const { theme } = useSelector((state: any) => state.global);

    const handleTypeTextToEncrpyt = (e: any) => {
        setInputText(e.target.value);
        dispatch(setEncryptText(e.target.value));

        dispatch(setOutputText(''));
        dispatch(setIvText(''));
    }

    return (
        <>
            {theme}
            <div className="SeparatorBox">
                <span></span>
                <p className="SectionName stable">{isFileMode ? (t('file_encryptor')) : (t('text_encryptor'))}</p>
                <span></span>
                <div className="settings_tab_box">
                    <button className={`setting_tab re ${isFileMode ? '' : 'Active'}`} onClick={() => setIsFileMode(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M16.5 15h3" /><path d="M5 12v-7a2 2 0 0 1 2 -2h7l5 5v4" /><path d="M4.5 15h3" /><path d="M6 15v6" /><path d="M18 15v6" /><path d="M10 15l4 6" /><path d="M10 21l4 -6" /></svg>
                        {t('text')}
                    </button>
                    <button className={`setting_tab re ${isFileMode ? 'Active' : ''}`} onClick={() => setIsFileMode(true)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /><path d="M9 17h6" /><path d="M9 13h6" /></svg>
                        {t('file')}
                    </button>
                </div>
                <span id="SettingsLastLine"></span>
            </div>
            <div className='page_content'>
                <div className={`page_tab ${isFileMode ? '' : 'show'}`}>
                    <div className="InputContainer">
                        <textarea
                            spellCheck="false"
                            className="Input Textarea"
                            placeholder=""
                            id="inputText"
                            value={inputText || encryptText}
                            onChange={handleTypeTextToEncrpyt}
                        ></textarea>
                        <label>{t('text_to_encrypt')}</label>
                    </div>
                    <div className="InputContainer">
                        <input
                            spellCheck="false"
                            id="outputText"
                            className={`Input active ${isCopiedEn ? 'Success' : ''}`}
                            type="text"
                            value={outputText}
                            readOnly
                            placeholder=""
                        />
                        <label>{t('encryption_key')}</label>
                        <button className="InputCopyBTN re" onClick={handleCopyTextEn}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24">
                                <g id="copy_line" fill="none">
                                    <path d="M24 0v24H0V0zM12.593 23.258l-.011.002-.071.035-.02.004-.014-.004-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01-.017.428.005.02.01.013.104.074.015.004.012-.004.104-.074.012-.016.004-.017-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113-.013.002-.185.093-.01.01-.003.011.018.43.005.012.008.007.201.093c.012.004.023 0 .029-.008l.004-.014-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014-.034.614c0 .012.007.02.017.024l.015-.002.201-.093.01-.008.004-.011.017-.43-.003-.012-.01-.01z" />
                                    <path fill="currentColor" d="M19 2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2V4a2 2 0 0 1 2-2zm-4 6H5v12h10zm-5 7a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2zm9-11H9v2h6a2 2 0 0 1 2 2v8h2zm-7 7a1 1 0 0 1 .117 1.993L12 13H8a1 1 0 0 1-.117-1.993L8 11z" />
                                </g>
                            </svg>
                        </button>
                    </div>
                    <div className="InputContainer">
                        <input
                            spellCheck="false"
                            className={`Input active ${isCopiedSe ? 'Success' : ''}`}
                            type="text"
                            value={ivText}
                            readOnly
                            placeholder=""
                        />
                        <label>{t('security_key')}</label>
                        <button className="InputCopyBTN re" onClick={handleCopyTextSe}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24">
                                <g id="copy_line" fill="none">
                                    <path d="M24 0v24H0V0zM12.593 23.258l-.011.002-.071.035-.02.004-.014-.004-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01-.017.428.005.02.01.013.104.074.015.004.012-.004.104-.074.012-.016.004-.017-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113-.013.002-.185.093-.01.01-.003.011.018.43.005.012.008.007.201.093c.012.004.023 0 .029-.008l.004-.014-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014-.034.614c0 .012.007.02.017.024l.015-.002.201-.093.01-.008.004-.011.017-.43-.003-.012-.01-.01z" />
                                    <path fill="currentColor" d="M19 2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2V4a2 2 0 0 1 2-2zm-4 6H5v12h10zm-5 7a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2zm9-11H9v2h6a2 2 0 0 1 2 2v8h2zm-7 7a1 1 0 0 1 .117 1.993L12 13H8a1 1 0 0 1-.117-1.993L8 11z" />
                                </g>
                            </svg>
                        </button>
                    </div>
                    <button
                        className="main_button re"
                        disabled={!inputText}
                        onClick={handleEncrypt}
                    >
                        {t('encrypt')}
                    </button>
                </div>
                <div className={`page_tab ${isFileMode ? 'show' : ''}`}>
                    <FileEncryptionComponent />
                </div>
            </div>
            <BottomInfo hideCondition={!isFileMode} />
        </>
    )
}

export default Encryption