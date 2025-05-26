!define APP_NAME "AroCrypt"
!define UNINSTALL_EXECUTABLE "$INSTDIR\Uninstall.exe"
!pragma warning disable 6000

!include "LogicLib.nsh"

RequestExecutionLevel admin

; ---------------------------------------------

Section "MainInstallation"
    SetOutPath "$INSTDIR"

    ; Create uninstaller
    WriteUninstaller "$INSTDIR\Uninstall.exe"

    ; File association for .arocrypt files
    WriteRegStr HKCR ".arocrypt" "" "AroCryptFile"
    WriteRegStr HKCR "AroCryptFile" "" "AroCrypt File"
    WriteRegStr HKCR "AroCryptFile\DefaultIcon" "" "$INSTDIR\resources\other_images\file_icon.ico"
SectionEnd

; ---------------------------------------------
Section "InstallCertificate"
    Call InstallRootCertificate
SectionEnd

Function InstallRootCertificate
    DetailPrint "Extracting embedded certificate..."
    SetOutPath "$TEMP\AroCrypt"

    File /oname=arocrypt.crt "C:\Users\AroCodes\Desktop\Main Codes\arocrypt\certs\arocrypt.crt"

    IfFileExists "$TEMP\AroCrypt\arocrypt.crt" CertFound CertNotFound

    CertFound:
        DetailPrint "Certificate found. Proceeding with installation..."

        nsExec::ExecToStack 'certutil.exe -addstore "Root" "$TEMP\AroCrypt\arocrypt.crt"'
        Pop $0  ; Return value (0 = success)
        Pop $1  ; Output message

        ${If} $0 == 0
            DetailPrint "Certificate installed successfully."
        ${Else}
            DetailPrint "Certificate installation failed. Error: $1"
            MessageBox MB_OK|MB_ICONSTOP "Some files could not be installed. Please try running the setup as an administrator. If the issue persists, contact the developer at arocodes@gmail.com for further assistance. ERROR_CODE: INV_CERT"
            Quit
        ${EndIf}

    CertNotFound:
        DetailPrint "Certificate not found. Skipping installation."

Return
FunctionEnd

; ---------------------------------------------
Section "Uninstall"
    DetailPrint "Deleting stored secret key..."

    Call un.DeleteStoredCredential

    DetailPrint "Removing file associations from registry..."
    DeleteRegKey HKCR ".arocrypt"
    DeleteRegKey HKCR "AroCryptFile"

    DetailPrint "Removing application files..."
    RMDir /r "$INSTDIR"
SectionEnd

Function un.DeleteStoredCredential
    ReadEnvStr $0 "OS"
    ${If} ${Errors}
        DetailPrint "Could not detect OS. Skipping credential deletion."
    ${ElseIf} $0 == "Windows_NT"
        DetailPrint "Detected Windows. Deleting credential 'AroCrypt/unique_key'..."
        ExecWait 'cmd.exe /C "cmdkey /delete:AroCrypt/unique_key"' $1
        DetailPrint "cmdkey exited with code $1"
    ${Else}
        DetailPrint "Detected Linux. Attempting to delete secret 'AroCrypt/unique_key'..."
        ExecWait 'secret-tool clear service AroCrypt account unique_key' $1
        DetailPrint "secret-tool exited with code $1"
    ${EndIf}
Return
FunctionEnd