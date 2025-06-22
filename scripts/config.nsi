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
    DetailPrint "Registering .arocrypt file extension..."
    WriteRegStr HKCR ".arocrypt" "" "AroCryptFile"
    WriteRegStr HKCR "AroCryptFile" "" "AroCrypt File"
    WriteRegStr HKCR "AroCryptFile\DefaultIcon" "" "$INSTDIR\resources\other_images\file_icon.ico"
    DetailPrint "File associations configured successfully"
    
    DetailPrint "Main installation completed"
SectionEnd

; ---------------------------------------------
Section "InstallCertificate"
    DetailPrint "Starting certificate installation process..."
    Call InstallRootCertificate
SectionEnd

Function InstallRootCertificate
    DetailPrint "Preparing to install AroCrypt root certificate..."
    DetailPrint "Creating temporary directory for certificate..."

    SetOutPath "$TEMP\AroCrypt"
    DetailPrint "Extracting certificate file..."
    File /oname=arocrypt.crt "C:\Users\AroCodes\Desktop\Main Codes\arocrypt\certs\arocrypt.crt"
    DetailPrint "Certificate file extraction completed"
    
    DetailPrint "Certificate file extracted, proceeding with installation..."
    DetailPrint "Installing certificate to Windows certificate store..."
    
    ; Use ExecWait with proper error checking
    ExecWait 'certutil.exe -addstore "Root" "$TEMP\AroCrypt\arocrypt.crt"' $0
    
    ${If} $0 != 0
        DetailPrint "Certificate installation failed with error code: $0"
        DetailPrint "Certificate installation is critical for AroCrypt to function properly."
        MessageBox MB_OK|MB_ICONSTOP "Certificate installation failed! AroCrypt requires the root certificate to be installed. Please try running the setup as an administrator. If the issue persists, contact the developer at arocodes@gmail.com for further assistance. ERROR_CODE: INV_CERT"
        Quit
    ${Else}
        DetailPrint "Certificate installed successfully to Windows certificate store"
    ${EndIf}
    
    DetailPrint "Cleaning up temporary certificate file..."
    Delete "$TEMP\AroCrypt\arocrypt.crt"
    RMDir "$TEMP\AroCrypt"
    DetailPrint "Certificate installation process completed successfully"
    DetailPrint "Proceeding with installation..."

Return
FunctionEnd

; ---------------------------------------------
Section "Uninstall"
    DetailPrint "Starting AroCrypt uninstallation..."
    DetailPrint "Removing stored credentials..."

    Call un.DeleteStoredCredential

    DetailPrint "Removing file associations..."
    DeleteRegKey HKCR ".arocrypt"
    DeleteRegKey HKCR "AroCryptFile"
    DetailPrint "File associations removed"

    DetailPrint "Removing application files..."
    RMDir /r "$INSTDIR"
    DetailPrint "Application files removed"
    DetailPrint "Uninstallation completed successfully"
SectionEnd

Function un.DeleteStoredCredential
    DetailPrint "Deleting stored credential 'AroCrypt/private_key'..."
    ExecWait 'cmd.exe /C "cmdkey /delete:AroCrypt/private_key"' $1
    DetailPrint "Credential deletion command completed with exit code: $1"
    ${If} $1 == 0
        DetailPrint "Credential deleted successfully"
    ${Else}
        DetailPrint "Credential deletion may have failed (exit code: $1)"
    ${EndIf}
Return
FunctionEnd