@echo off
REM ====================================================================
REM  Beyond the Fort — Cross-City Cloudflare Quick Tunnel Launcher
REM  Allows friends in Agra / other cities to access the local app
REM ====================================================================

title Beyond the Fort - Cross-City Cloudflare Tunnel (Morna to Agra)
cd /d "%~dp0\.."

node scripts\start-cross-city-tunnel.js
pause
