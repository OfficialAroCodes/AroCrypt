<div align="left">
    <a href="https://t.me/arocrypt_channel"><img src="https://img.shields.io/static/v1?message=Telegram&logo=telegram&label=&color=2CA5E0&logoColor=white&labelColor=&style=for-the-badge" height="35" alt="Telegram"  /></a>
  <a href="https://discord.gg/uwzRmTuH9n"><img src="https://img.shields.io/static/v1?message=Discord&logo=Discord&label=&color=5662f6&logoColor=white&labelColor=&style=for-the-badge" height="35" alt="Discord"  /></a>
  <a href="mailto:app.arocrypt@gmail.com"><img src="https://img.shields.io/static/v1?message=Gmail&logo=gmail&label=&color=D14836&logoColor=white&labelColor=&style=for-the-badge" height="35" alt="Gmail"  /></a>
    <a href="https://arocrypt.vercel.app"><img src="https://img.shields.io/static/v1?message=website&logo=devbox&label=&color=9a2d0d&logoColor=white&labelColor=&style=for-the-badge" height="35" alt="Official Website"  /></a>
</div>
<img width="1980" height="400" alt="banner_dark" src="https://github.com/user-attachments/assets/edd14108-3336-47b3-90f1-a08780511b6a" />


## AroCrypt Source Code   /    _Читать на [Русском](README.ru.md)_
AroCrypt is a next-gen, cross-platform encryption toolkit built to keep your data locked down with zero friction. Encrypt text, files, and even images using strong, battle-tested cryptography. The interface stays clean, fast, and developer-friendly while the security stays airtight. Whether you're protecting personal notes or building secure workflows, AroCrypt delivers serious protection without the complexity.

<img width="1167" height="726" alt="en_dark" src="https://github.com/user-attachments/assets/60f21303-f84d-4593-9800-fa8e09da55b8" />

---

## 🖥️ OS Compatibility

| Operating System     | 32-Bit | 64-Bit         |
| -------------------- | ------ | -------------- |
| Windows 7            | ❌     | ❌             |
| Windows 8            | ✅     | ✅             |
| Windows 8.1          | ✅     | ✅             |
| Windows 10           | ✅     | ✅             |
| Windows 11           | ✅     | ✅             |
| Linux (Debian-based) | ❌     | ✅             |
| macOS 11+            | ❌     | ✅ and `(arm64)` |

---

## 🚀 Features

- **Text Encryption and Decryption**  
  Secure plain text using strong AES encryption with safe shareable output.

- **File Encryption and Decryption**  
  Encrypt or decrypt any file format with reliable AES encryption. Outputs `.arocrypt` secure containers.

- **Image Steganography**  
  Hide files inside `.png` images with automatic encryption. Only the correct private key can extract the content.

- **Cross-Platform Builds**
  - **Windows** (`x64` and `x32`): `.exe` Setup and Portable
  - **Linux** (`x64`): `.AppImage` and `.deb`
  - **macOS 11+** (`x64` and `arm64`): `.dmg`

- **Modern UI**  
  Clean, responsive design built for fast workflows.

- **Portable Options**  
  No installation needed for Windows Portable or `.AppImage`. Just run and go.

- **KEM-based Key Exchange**  
  AroCrypt includes Key Encapsulation Mechanisms for safer, modern key handling without exposing sensitive data.

- **Improved Encryption Engine**  
  Faster performance, simplified data packaging, cleaner metadata handling, and upgraded security flows.

---

## 💡 How to Use

### 🔏 Encrypting Text
1. Enter your text.
2. Click **Encrypt**.
3. Copy the Base64 Data Package containing public, non-sensitive data.

### 🔓 Decrypting Text
1. Paste the Base64 Data Package.
2. Click **Decrypt** to reveal the original message.

---

### 📁 Encrypting Files
1. Select the file or files.
2. Click **Encrypt File(s)**.
3. A `.arocrypt` file will be generated.

### 🗝️ Decrypting Files
1. Select a `.arocrypt` file.
2. Click **Decrypt File(s)**.
3. Your original file or files will be restored.

---

### 🖼️ Embedding Files into PNG (Steganography)
1. Pick a `.png` container image.
2. Select the files you want to hide.
3. Click **Embed File(s)**.
4. A new `.png` with encrypted embedded data will be created.

### 🧩 Extracting Files from PNG
1. Select the modified `.png` image.
2. Click **Extract File(s)**.
3. You will receive the encrypted embedded files. A decryption key is still required to unlock them.

---

## 🛡️ Security

AroCrypt uses industry-standard algorithms:

- **AES-GCM**  
  - AES-256-GCM  
  - AES-192-GCM  
  - AES-128-GCM  

- **AES-CBC**  
  - AES-256-CBC  
  - AES-192-CBC  
  - AES-128-CBC  

- **AES-CTR**  
  - AES-256-CTR  
  - AES-192-CTR  
  - AES-128-CTR  

Includes key and IV randomization and HMAC-based integrity checks. GCM uses its own authentication tag to prevent tampering.

Your encryption keys are never uploaded, logged, or stored anywhere.

---

## 🧪 Dev Notes

- Built with **Electron.js**, powered by **Node.js** and **React.js**.
- Written entirely in **TypeScript**.
- Encryption logic is fully custom using native Node.js crypto APIs.
- Cross-platform architecture for Windows, Linux, and macOS.

---

## 🛠️ Installing on macOS (Unsigned App)

macOS will warn you when opening apps not signed with an Apple Developer ID.

### To install and open the app:
1. Download the `.dmg`.
2. Open the app once and wait for the warning.
3. Go to `System Preferences` > `Security and Privacy` > `General`.
4. Click **Open Anyway**.
5. Confirm the prompt.

You can also right-click the app and select **Open** to unlock it.

> [!CAUTION]
> This warning protects your system. Only bypass it if you trust the source.

### Why it is unsigned
- Apple Developer ID certificates cost around 99 dollars per year.
- AroCrypt is free and open source.

### Updating
Get updates from GitHub Releases or the official site:
`https://arocrypt.vercel.app/download`

---

## 🐛 Reporting Issues
Found a bug or have a feature request? Open an issue here:
https://github.com/AroCrypt/app/issues

---

🔐 **Protect your files, your secrets, your everything with AroCrypt.**  
👨‍💻Developed by [AroCodes](https://github.com/OfficialAroCodes)