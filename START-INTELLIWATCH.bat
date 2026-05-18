@echo off
title INTELLIWATCH Launcher
setlocal

REM ── Add Node.js to PATH for this session ─────────────────────────────
set "PATH=C:\Program Files\nodejs;%PATH%"
set "ROOT=%~dp0intelliwatch"

echo.
echo  ============================================
echo   INTELLIWATCH  -  one-click launcher
echo  ============================================
echo   Backend   : http://localhost:3001
echo   Frontend  : http://localhost:5173
echo  ============================================
echo.

REM ── Free ports 3001 / 5173 if previous instance left anything behind ──
for /f "tokens=5" %%p in ('netstat -aon ^| findstr ":3001 " ^| findstr LISTENING') do taskkill /F /PID %%p >nul 2>&1
for /f "tokens=5" %%p in ('netstat -aon ^| findstr ":5173 " ^| findstr LISTENING') do taskkill /F /PID %%p >nul 2>&1

REM ── Start backend in its own console window (Ctrl+C to stop) ─────────
start "INTELLIWATCH . Backend (3001)" cmd /k "cd /d "%ROOT%\backend" && "C:\Program Files\nodejs\npm.cmd" run dev"

REM ── Start frontend in its own console window ─────────────────────────
start "INTELLIWATCH . Frontend (5173)" cmd /k "cd /d "%ROOT%\frontend" && "C:\Program Files\nodejs\npm.cmd" run dev"

echo  Both servers starting...
echo  Opening dashboard in your browser shortly.
echo.

REM ── Wait for the frontend to be ready, then open the browser ─────────
timeout /t 5 /nobreak >nul
start "" "http://localhost:5173"

echo  Dashboard opened. Close the two server windows to stop the app.
timeout /t 3 /nobreak >nul
exit
