# 🔐 AroCrypt

> 🌐 Читать на [Русском](README.ru.md)

**AroCrypt** is a modern, cross-platform encryption tool designed to protect your sensitive data—whether it's text, files, or even embedded within images. With a clean interface and military-grade encryption, AroCrypt makes powerful data protection easy for everyone.

![en_img](https://github.com/user-attachments/assets/4df4dd31-ce1a-4091-b83c-3988eef6812d)

---

## 🖥️ OS Compatibility

| Operating System     | 32-Bit | 64-Bit         |
| -------------------- | ------ | -------------- |
| Windows 7            | ❌     | ❌             |
| Windows 8            | ✅     | ✅             |
| Windows 8.1          | ✅     | ✅             |
| Windows 10           | ✅     | ✅             |
| Windows 11           | ✅     | ✅             |
| Linux (Debian-based) | ✅     | ✅             |
| macOS 11+            | ❌     | ✅ & `(arm64)` |

---

## 🚀 Features

- **Text Encryption & Decryption**  
  Secure plain text using strong AES-based encryption and safely share results with packed public key output.

- **File Encryption & Decryption**  
  Encrypt or decrypt files of any type with reliable AES encryption, outputting `.arocrypt` formatted secure files.

- **Image Steganography** _(New)_  
  Hide files inside `.png` images with automatic encryption. Only the correct key can extract the original content. Perfect for ultra-discreet file sharing.

- **Secure Key Generation & Management**  
  Automatically generates secure random keys for every operation. Your keys never leave your device.

- **Cross-Platform Support**

  - **Windows** (`x64` & `x32`) — `.exe` Setup & Portable
  - **Linux** (`x64` & `x32`) — `.AppImage` & `.deb`
  - **macOS 11+** (`x64` & `arm64`) — `.app` & `.dmg`

- **Modern UI**  
  Sleek, intuitive design built for modern systems and workflows.

- **Compact & Portable**  
  No installation required for `.AppImage` or Windows Portable versions — just run and go.

---

## 💡 How to Use

### 🔏 Encrypting Text

1. Enter your text in the input field.
2. Click **Encrypt**.
3. Copy the result — it's a Base64-encoded string containing _only_ the public keys, safe to share.

### 🔓 Decrypting Text

1. Paste the Base64 public key string.
2. Click **Decrypt** to reveal the original message.

### 📁 Encrypting Files

1. Select the file(s) you want to encrypt.
2. Click **Encrypt File(s)**.
3. You'll get a `.arocrypt` file with embedded encrypted content.

### 🗝️ Decrypting Files

1. Select a `.arocrypt` file.
2. Click **Decrypt File(s)**.
3. Your original file(s) will be restored.

### 🖼️ Embedding Files into PNG (Steganography)

1. Select a `.png` image (used as a container).
2. Upload the file(s) you want to hide.
3. Click **Embed File(s)**.
4. You’ll get a `.png` image that secretly contains your encrypted data.

### 🧩 Extracting Files from PNG

1. Select the `.png` image that has embedded data.
2. Click **Extract File(s)**.
3. You'll receive the original encrypted files (you’ll still need the correct decryption key to unlock them).

---

## 🛡️ Security

AroCrypt uses industry-standard encryption algorithms such as:

- **AES-256-CBC**
- **AES-192-CBC**
- **AES-128-CBC**

With key/IV randomization and optional HMAC protection for integrity. We’re committed to expanding our supported algorithms in future releases. Your encryption keys are never uploaded or stored.

---

## 🧪 Dev Notes

- Built with **Electron.js**, powered by **Node.js** and **React.js**.
- Entirely written in **TypeScript** for type safety and maintainability.
- Encryption logic is fully custom, using Node.js crypto APIs — no third-party libraries for core encryption.
- Portable architecture: runs on Windows, Linux and macOS.

---

## 🛠️ How to Install on macOS (Unsigned App Warning)

Since this app isn’t signed with an official Apple Developer ID, macOS will warn you during installation or launch.

### To install and run the app:

1. Download the `.dmg` or `.app` file.
2. Open the app — macOS will block it and show a warning like:
   “App can’t be opened because it is from an unidentified developer.”
3. To bypass this:

- Open `System Preferences` > `Security` & `Privacy` > `General tab`.
- You’ll see a message about the blocked app with an “Open Anyway” button. Click it.
- Confirm when prompted.

4. Alternatively, you can right-click (or `Control` + click) the app and choose Open, then confirm the warning.

> [!CAUTION]
> **This warning is a macOS security feature to protect your system. Only bypass if you trust the source.**

### Why no official signing?

- Official Apple Developer ID certificates cost money **(~$99/year)**.
- This app is **free** and **open source**, so we rely on you to verify and trust the app yourself.

### For future updates

Check [GitHub releases](https://github.com/OfficialAroCodes/arocrypt/releases/latest) or the [official website](https://arocrypt.vercel.app/download) to download new versions manually.

---

## 🐛 Reporting Issues

Found a bug or have a suggestion? [Open an issue here](https://github.com/OfficialAroCodes/AroCrypt/issues) and help improve AroCrypt.

---

🔐 **Secure your files, your secrets, your everything—with AroCrypt.**  
Made by [AroCodes](https://github.com/OfficialAroCodes) 💻
