@echo off
title INTELLIWATCH
color 0A
echo.
echo  ==========================================
echo   INTELLIWATCH - Industrial Safety Monitor
echo  ==========================================
echo.
echo  Starting API server on http://localhost:3001
echo  Starting UI  server on http://localhost:5173
echo.
echo  Keep this window open. Press Ctrl+C to stop.
echo.

:: Start backend in a new window
start "INTELLIWATCH API" cmd /k "cd /d %~dp0backend && node src/server.js"

:: Give backend 2 seconds to start
timeout /t 2 /nobreak >nul

:: Start frontend in a new window
start "INTELLIWATCH UI" cmd /k "cd /d %~dp0frontend && npx vite"

:: Open browser
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo  Done! Browser should open automatically.
echo  Close the two black windows to stop the servers.
pause
