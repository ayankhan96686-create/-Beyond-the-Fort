@echo off
REM ====================================================================
REM  Beyond the Fort — Local Area Network (LAN) Startup Script
REM  Runs unified server on 0.0.0.0:5173 for multi-device Wi-Fi testing
REM ====================================================================

title Beyond the Fort - LAN Server (Port 5173)
cd /d "%~dp0\.."

set HOST=0.0.0.0
set PORT=5173

node scripts\start-lan.js
pause
