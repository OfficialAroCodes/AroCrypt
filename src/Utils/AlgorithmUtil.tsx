const Algorithm = () => {
    const encryption_algorithm = localStorage.getItem("encryptionMethod")
    const decryption_algorithm = localStorage.getItem("decryptionMethod")
    if (!encryption_algorithm) localStorage.setItem("encryptionMethod", "aes-256-cbc")
    if (!decryption_algorithm) localStorage.setItem("decryptionMethod", "aes-256-cbc")
    return '';
}

export default Algorithm