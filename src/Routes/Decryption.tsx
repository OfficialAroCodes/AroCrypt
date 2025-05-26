import FileDecryptionForm from '@/Components/FileDecryptionForm';
import { RootState } from '@/store';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { setDecryptionKey, setSecurityKeyS, setDecryptedText } from '@/store/decryptionSlice';
import BottomInfo from '@/Components/BottomInfo';

const Decryption: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [isIncorrectKey, setIsIncorrectKey] = useState(false);
    const { decryption_key, security_key, decrypted_text } = useSelector((state: RootState) => state.decryption);
    const [isFileMode, setIsFileMode] = useState(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);

    const de_method = localStorage.getItem("decryptionMethod") || 'aes-256-cbc';

    const handleDecrypt = async () => {
        try {
            if (!decryption_key || !security_key) {
                setDecryptedText("Enter keys to decrpyt.")
                setIsIncorrectKey(true);
                return;
            }

            const decryptParams = {
                content: decryption_key,
                iv: security_key,
                method: de_method
            };

            const decryptedResult = await window.electronAPI.decrypt(decryptParams as any);

            if (decryptedResult === "invalid") {
                setIsIncorrectKey(true);
                dispatch(setDecryptedText(""))
                return;
            }

            dispatch(setDecryptedText(decryptedResult))
            setIsButtonDisabled(true);
        } catch (error: any) {
            console.error('Decryption error:', error);
            alert(`${t('decryption_failed')}: ${error.message}`);
        }
    };

    const handleTypeDecrpytionKey = (e: any) => {
        dispatch(setDecryptionKey(e.target.value));
        dispatch(setDecryptedText(''));
        setIsIncorrectKey(false);
        setIsButtonDisabled(false);
    }

    const handleTypeSecuirtyKey = (e: any) => {
        dispatch(setSecurityKeyS(e.target.value));
        dispatch(setDecryptedText(''));
        setIsIncorrectKey(false);
        setIsButtonDisabled(false);
    }

    return (
        <>
            <div className="SeparatorBox">
                <span></span>
                <p className="SectionName stable">{isFileMode ? (t('file_decryptor')) : (t('text_decryptor'))}</p>
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
                    <div className={`InputContainer ${isIncorrectKey ? "invalid" : ""}`}>
                        <input
                            spellCheck="false"
                            className={`Input`}
                            type="text"
                            value={decryption_key}
                            onChange={handleTypeDecrpytionKey}
                            placeholder="" />
                        <label>{t("decryption_key")}</label>
                    </div>
                    <div className={`InputContainer ${isIncorrectKey ? "invalid" : ""}`}>
                        <input
                            spellCheck="false"
                            className={`Input`}
                            type="text"
                            value={security_key}
                            onChange={handleTypeSecuirtyKey}
                            placeholder="" />
                        <label>{t("security_key")}</label>
                    </div>
                    <div className={`InputContainer`}>
                        <textarea
                            spellCheck="false"
                            className={`Input Textarea active`}
                            disabled
                            placeholder=""
                            value={decrypted_text}
                        ></textarea>
                        <label>{t("decrypted_text")}</label>
                    </div>
                    <button
                        className="main_button re"
                        disabled={!decryption_key || !security_key || isIncorrectKey || isButtonDisabled}
                        onClick={handleDecrypt}
                    >
                        {t('decrypt')}
                    </button>
                </div>
                <div className={`page_tab ${isFileMode ? 'show' : ''}`}>
                    <FileDecryptionForm />
                </div>
            </div>
            <BottomInfo hideCondition={!isFileMode} />
        </>
    )
}

export default Decryption