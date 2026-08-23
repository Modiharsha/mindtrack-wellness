@echo off
title MindTrack Live Server
echo ================================================================
echo   🌿 MindTrack Student Mental Health & Wellness Live Server
echo ================================================================
echo.
echo Starting backend + frontend server...
start /B npm run start
timeout /t 3 /nobreak >nul
echo.
echo ================================================================
echo   🚀 Connecting your Live Public HTTPS URL...
echo ================================================================
echo.
ssh -R 80:localhost:5000 -o StrictHostKeyChecking=no -o ServerAliveInterval=30 nokey@localhost.run
pause
