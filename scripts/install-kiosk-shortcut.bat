@echo off
rem Creates the "PLAYY Kiosk" shortcut (full-screen Chrome, silent printing, music from the start)
rem on the desktop and in the Startup folder, so it also opens when the PC starts.
rem Keep playy-kiosk.ico in the same folder as this file. Double-click this file on the kiosk PC. To change the site, edit the URL below.

set "URL=https://playy-native.vercel.app/"

set "CHROME="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set "CHROME=%LocalAppData%\Google\Chrome\Application\chrome.exe"

if not defined CHROME (
  echo Google Chrome was not found. Install Chrome first, then run this again.
  pause
  exit /b 1
)

rem The icon is copied to a fixed place so the shortcuts keep working if this folder is moved or deleted
set "ICON=%LocalAppData%\PLAYY\playy-kiosk.ico"
if not exist "%LocalAppData%\PLAYY" mkdir "%LocalAppData%\PLAYY"
if exist "%~dp0playy-kiosk.ico" copy /y "%~dp0playy-kiosk.ico" "%ICON%" >nul

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$shell = New-Object -ComObject WScript.Shell;" ^
  "foreach ($dir in @([Environment]::GetFolderPath('Desktop'), [Environment]::GetFolderPath('Startup'))) {" ^
  "  $link = $shell.CreateShortcut((Join-Path $dir 'PLAYY Kiosk.lnk'));" ^
  "  $link.TargetPath = $env:CHROME;" ^
  "  $link.Arguments = '--kiosk --kiosk-printing --autoplay-policy=no-user-gesture-required ' + $env:URL;" ^
  "  if (Test-Path $env:ICON) { $link.IconLocation = $env:ICON };" ^
  "  $link.Save()" ^
  "}"

if errorlevel 1 (
  echo Could not create the shortcuts.
  pause
  exit /b 1
)

echo.
echo Done. "PLAYY Kiosk" is on the desktop and in the Startup folder.
echo Close every Chrome window, then open the kiosk from the new shortcut. Alt+F4 leaves it.
echo Make sure the right printer is the Windows default printer.
pause
