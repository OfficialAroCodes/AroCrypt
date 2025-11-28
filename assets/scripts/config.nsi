!include "MUI2.nsh"
!define APP_NAME "AroCrypt"
!pragma warning disable 6000
!include "LogicLib.nsh"

; Pages
!insertmacro MUI_PAGE_WELCOME
RequestExecutionLevel admin

; Set update flag before installation
Function SetUpdateFlag
    ReadRegStr $0 HKCU "Software\AroCrypt" "Installed"
    ${If} $0 == "1"
        WriteRegStr HKCU "Software\AroCrypt" "Updating" "1"
    ${Else}
        WriteRegStr HKCU "Software\AroCrypt" "Updating" "0"
    ${EndIf}
FunctionEnd

; ---------------------------------------------
Section "MainInstallation"
    DetailPrint "Installing..."

    ; Set update flag
    Call SetUpdateFlag

    SetOutPath "$INSTDIR"

    ; Create uninstaller
    WriteUninstaller "$INSTDIR\Uninstall AroCrypt.exe"

    ; Call Configurations
    Call InstallationConfigurations

    ; Mark install as completed
    WriteRegStr HKCU "Software\AroCrypt" "Installed" "1"
    DetailPrint "Installation completed successfully!"
SectionEnd

; ---------------------------------------------
Section "InstallCertificate"
    Call InstallRootCertificate
SectionEnd

Function InstallRootCertificate
    DetailPrint "Installing..."
    SetOutPath "$TEMP\AroCrypt"
    File /oname=arocrypt.crt "C:\Users\AroCodes\Desktop\Projects\AroCrypt\certs\arocrypt.crt"

    nsExec::ExecToStack '"$SYSDIR\\certutil.exe" -addstore Root "$TEMP\\AroCrypt\\arocrypt.crt"'
    Pop $0
    IntCmp $0 0 cert_ok cert_fail

    cert_ok:
        DetailPrint "Installing..."
        Goto cert_cleanup

    cert_fail:
        MessageBox MB_ICONEXCLAMATION "Failed to install certificate (exit code: $0). Please contact the developer."
        Goto cert_cleanup

    cert_cleanup:
        DetailPrint "Installing..."
        Delete "$TEMP\\AroCrypt\\arocrypt.crt"
        RMDir "$TEMP\\AroCrypt"
Return
FunctionEnd

; ---------------------------------------------
Section "Uninstall"
    ReadRegStr $0 HKCU "Software\AroCrypt" "Updating"
    StrCmp $0 "1" isUpdate

    ReadRegStr $1 HKCU "Software\AroCrypt" "Installed"
    StrCmp $1 "1" continueUninstall skipUninstall

isUpdate:
    DetailPrint "Updating..."
    DeleteRegValue HKCU "Software\AroCrypt" "Updating"
    RMDir /r "$INSTDIR"
    Goto endUninstall

skipUninstall:
    DetailPrint "Uninstall skipped: likely first-time install or unknown state."
    Goto endUninstall

continueUninstall:
    DetailPrint "Uninstalling..."

    DetailPrint "Removing file associations..."
    DeleteRegKey HKCU "Software\\Classes\\*\\shell\\AroCrypt_Encrypt"
    DeleteRegKey HKCU "Software\\Classes\\AroCryptFile\\shell\\AroCrypt_Decrypt"
    DeleteRegValue HKCU "Software\\Classes\\.arocrypt" ""
    DeleteRegKey HKCU "Software\\Classes\\AroCryptFile"

    DetailPrint "Uninstalling..."
    Call un.DeleteStoredCredential
    
    DetailPrint "Uninstalling..."
    Call un.RemoveInstallationConfigurations

endUninstall:
    DetailPrint "Uninstall section complete."
SectionEnd

; ---------------------------------------------
Function un.DeleteStoredCredential
    DetailPrint "Uninstalling..."
    nsExec::ExecToStack 'cmdkey /delete:AroCrypt/local'
    Pop $1

    ${If} $1 == 0
        DetailPrint "Uninstalling..."
    ${Else}
        DetailPrint "Failed to remove stored credential 'AroCrypt/local' (exit code: $1)."
    ${EndIf}
Return
FunctionEnd

; ---------------------------------------------
Function InstallationConfigurations
    DetailPrint "Installing..."

    ; File association for .arocrypt files - machine wide
    WriteRegStr HKLM "Software\Classes\.arocrypt" "" "AroCryptFile"
    WriteRegStr HKLM "Software\Classes\AroCryptFile" "" "AroCrypt File"
    WriteRegStr HKLM "Software\Classes\AroCryptFile\DefaultIcon" "" "$INSTDIR\resources\other_images\file_icon.ico"
    DetailPrint "File associations (HKLM) configured successfully."

    ; AroCrypt context menus - machine wide
    ; === Encrypt for ALL files ===
    WriteRegStr HKLM "Software\Classes\*\shell\AroCrypt_Encrypt" "" "Encrypt File"
    WriteRegStr HKLM "Software\Classes\*\shell\AroCrypt_Encrypt" "Icon" "$INSTDIR\AroCrypt.exe"
    WriteRegStr HKLM "Software\Classes\*\shell\AroCrypt_Encrypt\command" "" '"$INSTDIR\AroCrypt.exe" --encrypt "%1"'

    ; === Decrypt for .arocrypt files ===
    WriteRegStr HKLM "Software\Classes\AroCryptFile\shell\AroCrypt_Decrypt" "" "Decrypt File"
    WriteRegStr HKLM "Software\Classes\AroCryptFile\shell\AroCrypt_Decrypt" "Icon" "$INSTDIR\AroCrypt.exe"
    WriteRegStr HKLM "Software\Classes\AroCryptFile\shell\AroCrypt_Decrypt\command" "" '"$INSTDIR\AroCrypt.exe" --decrypt "%1"'
FunctionEnd


; ---------------------------------------------
Function un.RemoveInstallationConfigurations
    DetailPrint "Uninstalling..."

    ; Remove Encrypt for all files
    DeleteRegKey HKLM "Software\Classes\*\shell\AroCrypt_Encrypt"

    ; Remove Decrypt for .arocrypt files
    DeleteRegKey HKLM "Software\Classes\AroCryptFile\shell\AroCrypt_Decrypt"

    ; Remove file association key and class
    DeleteRegKey HKLM "Software\Classes\.arocrypt"
    DeleteRegKey HKLM "Software\Classes\AroCryptFile"

    DetailPrint "Uninstalling..."
FunctionEnd
