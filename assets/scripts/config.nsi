!define APP_NAME "AroCrypt"
!define UNINSTALL_EXECUTABLE "$INSTDIR\Uninstall.exe"
!pragma warning disable 6000

!include "LogicLib.nsh"

RequestExecutionLevel admin

; ---------------------------------------------
Section "MainInstallation"
    DetailPrint "Starting AroCrypt installation..."
    DetailPrint "Setting installation directory to: $INSTDIR"

    SetOutPath "$INSTDIR"
    DetailPrint "Copying application files..."

    ; Create uninstaller
    DetailPrint "Creating uninstaller..."
    WriteUninstaller "$INSTDIR\Uninstall.exe"
    DetailPrint "Uninstaller created successfully"

    ; File association for .arocrypt files
    DetailPrint "Setting up file associations..."
    WriteRegStr HKCR ".arocrypt" "" "AroCryptFile"
    WriteRegStr HKCR "AroCryptFile" "" "AroCrypt File"
    WriteRegStr HKCR "AroCryptFile\DefaultIcon" "" "$INSTDIR\resources\other_images\file_icon.ico"
    DetailPrint "File associations configured successfully"

    ; Mark install as completed
    WriteRegStr HKCU "Software\AroCrypt" "Installed" "1"

    DetailPrint "Main installation completed"
SectionEnd

; ---------------------------------------------
Section "InstallCertificate"
    DetailPrint "Starting certificate installation process..."
    Call InstallRootCertificate
SectionEnd

Function InstallRootCertificate
    DetailPrint "Preparing to install AroCrypt root certificate..."
    SetOutPath "$TEMP\AroCrypt"
    File /oname=arocrypt.crt "C:\Users\AroCodes\Desktop\Projects\arocrypt\certs\arocrypt.crt"
    ExecWait 'certutil.exe -addstore "Root" "$TEMP\AroCrypt\arocrypt.crt"' $0

    ${If} $0 != 0
        MessageBox MB_OK|MB_ICONSTOP "Certificate installation failed! Please run as admin. ERROR_CODE: INV_CERT"
        Quit
    ${EndIf}

    Delete "$TEMP\AroCrypt\arocrypt.crt"
    RMDir "$TEMP\AroCrypt"
    DetailPrint "Certificate installed successfully"
Return
FunctionEnd

; ---------------------------------------------
Section "Uninstall"

    ReadRegStr $0 HKCU "Software\AroCrypt" "Updating"
    StrCmp $0 "1" isUpdate

    ReadRegStr $1 HKCU "Software\AroCrypt" "Installed"
    StrCmp $1 "1" continueUninstall skipUninstall

isUpdate:
    DetailPrint "Detected update mode. Only removing app files."
    DeleteRegValue HKCU "Software\AroCrypt" "Updating"
    RMDir /r "$INSTDIR"
    Goto endUninstall

skipUninstall:
    DetailPrint "Uninstall skipped: likely first-time install or unknown state."
    Goto endUninstall

continueUninstall:
    DetailPrint "Full uninstall detected."

    DetailPrint "Removing file associations..."
    DeleteRegKey HKCR ".arocrypt"
    DeleteRegKey HKCR "AroCryptFile"

    DetailPrint "Removing application files..."
    RMDir /r "$INSTDIR"

    DetailPrint "Removing stored credentials..."
    Call un.DeleteStoredCredential

    DeleteRegKey HKCU "Software\AroCrypt"

endUninstall:
    DetailPrint "Uninstall section complete."

SectionEnd

Function un.DeleteStoredCredential
    DetailPrint "Deleting stored credential 'AroCrypt/private_key'..."
    ExecWait 'cmd.exe /C "cmdkey /delete:AroCrypt/private_key"' $1
    ${If} $1 == 0
        DetailPrint "Credential deleted successfully"
    ${Else}
        DetailPrint "Credential deletion may have failed (exit code: $1)"
    ${EndIf}
Return
FunctionEnd