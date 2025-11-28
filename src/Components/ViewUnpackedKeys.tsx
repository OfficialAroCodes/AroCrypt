import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import CopyText from "@/Utils/copyText";
import InlineMessageBox from "./InlineMessageBox";
import { useClickOutside } from "react-haiku";

interface DecodedKeys {
    content?: string;
    iv?: string;
    salt?: string;
    hmac?: string;
    authTag? : string;
    kemCiphertext?: string;
}

interface ViewUnpackedKeysProps {
    isShown: boolean;
    packedKeys: string;
    onClose: Function;
}

const ViewUnpackedKeys: React.FC<ViewUnpackedKeysProps> = ({
    isShown,
    packedKeys,
    onClose
}) => {
    const { t } = useTranslation();
    const [copySuccess, setCopySuccess] = useState<string>("");
    const [decodedKeys, setDecodedKeys] = useState<DecodedKeys>({});
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const decodePackedKeys = useCallback((packedKeys: string): DecodedKeys => {
        try {
            if (!packedKeys.trim()) {
                throw new Error("No packed keys provided");
            }

            const decoded = atob(packedKeys);
            const parsed = JSON.parse(decoded);

            // Validate the expected structure
            if (typeof parsed !== 'object' || parsed === null) {
                throw new Error("Invalid key structure");
            }

            return {
                content: parsed.content || "",
                iv: parsed.iv || "",
                salt: parsed.salt || "",
                hmac: parsed.hmac || "",
                authTag: parsed.authTag || "",
                kemCiphertext: parsed.kemCiphertext || ""
            };
        } catch (error) {
            console.error('Error decoding packed keys:', error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            setError(`Failed to decode keys: ${errorMessage}`);
            return {};
        }
    }, []);

    useEffect(() => {
        if (isShown && packedKeys) {
            setIsLoading(true);
            setError("");

            try {
                const decoded = decodePackedKeys(packedKeys);
                setDecodedKeys(decoded);
            } finally {
                setIsLoading(false);
            }
        }
    }, [isShown, packedKeys, decodePackedKeys]);

    const handleCopy = useCallback(async (text: string, field: string) => {
        if (!text) return;

        try {
            const result = await CopyText(text);
            if (result === "success") {
                setCopySuccess(field);
                setTimeout(() => setCopySuccess(""), 2000);
            }
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    }, []);

    const renderInputField = useCallback((
        label: string,
        value: string,
        field: string,
        showCopyButton: boolean = false
    ) => (
        <div className="InputContainer">
            <label>{label}</label>
            <input
                readOnly
                className={`Input active ${copySuccess === field ? 'Success' : ''}`}
                value={value || ""}
                type="text"
                placeholder={isLoading ? "Loading..." : "No data"}
            />
            {showCopyButton && value && (
                <button
                    className={`input_side_button re`}
                    onClick={() => handleCopy(value, field)}
                    disabled={isLoading}
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
            )}
        </div>
    ), [copySuccess, handleCopy, isLoading]);

    const ModalRef = useRef(null);

    const handleClose = () => {
        onClose(false);
    }

    useClickOutside(ModalRef, handleClose)

    return (
        <div className={`modal_box ${isShown ? "Show" : ""}`}>
            <div className="modal_content large" ref={ModalRef}>
                <p className="modal_header">{t("unpacked_package")}</p>
                <button
                    className="modal_close_btn re"
                    onClick={() => onClose(false)}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="currentColor"
                        viewBox="0 0 256 256"
                    >
                        <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
                    </svg>
                </button>

                <InlineMessageBox
                    message={t('safe_to_share')}
                    type={1}
                />

                {error && (
                    <InlineMessageBox
                        message={error}
                        type={3}
                    />
                )}

                {renderInputField("Content", decodedKeys.content || "", "content", true)}
                {renderInputField("IV", decodedKeys.iv || "", "iv", true)}
                {renderInputField("SALT", decodedKeys.salt || "", "salt", true)}
                {decodedKeys.hmac && renderInputField("HMAC", decodedKeys.hmac || "", "hmac", true)}
                {decodedKeys.authTag && renderInputField("Auth Tag", decodedKeys.authTag || "", "authTag", true)}
                {renderInputField("KEM Ciphertext", decodedKeys.kemCiphertext || "", "kemCiphertext", true)}
            </div>
        </div>
    );
};

export default ViewUnpackedKeys;