@echo off
title AURORA Skin Studio - Build EXE
cd /d "%~dp0"
echo ==========================================
echo       AURORA SKIN STUDIO - EXE BUILDER
echo ==========================================
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is missing. Install Node.js LTS from https://nodejs.org/
  pause
  exit /b 1
)
echo.
echo Installing app dependencies. This needs internet on first run...
call npm install
if errorlevel 1 (
  echo Dependency installation failed.
  pause
  exit /b 1
)
echo.
echo Building Windows installer...
call npm run build
if errorlevel 1 (
  echo Build failed. Check the messages above.
  pause
  exit /b 1
)
echo.
echo DONE! Your installer is in the dist folder.
pause
