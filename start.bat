@echo off
chcp 65001 >nul 2>nul

:: Auto-open browser after 5 seconds
start "" cmd /c "ping -n 6 127.0.0.1 >nul & start http://localhost:3000"

:: Start dev server - use %%~dp0 to reference this bat's directory
cd /d "%~dp0"
call npm run dev
