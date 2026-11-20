@echo off
:: =============================================================================
::  RSVQA - Lancement (Windows)
::  Ouvre deux fenetres : le backend (port 8000) et le frontend (port 5173).
::  Pour arreter l'application, fermez ces deux fenetres.
:: =============================================================================
setlocal
cd /d "%~dp0"
title RSVQA - Lancement

if not exist "Backend\.venv\Scripts\python.exe" (
    echo [ERREUR] Environnement Python introuvable. Lancez d'abord install_windows.bat
    pause
    exit /b 1
)
if not exist "Frontend\node_modules" (
    echo [ERREUR] Dependances du frontend absentes. Lancez d'abord install_windows.bat
    pause
    exit /b 1
)

echo.
echo   Backend  : http://localhost:8000   (documentation API : /docs)
echo   Frontend : http://localhost:5173
echo.
echo   Le backend charge les modeles au demarrage : cela peut prendre
echo   plusieurs minutes avant que le site reponde aux questions.
echo.

start "RSVQA - Backend" /d "%~dp0Backend" cmd /k ".venv\Scripts\python.exe -m uvicorn backend:app --host 127.0.0.1 --port 8000"
start "RSVQA - Frontend" /d "%~dp0Frontend" cmd /k "npm run dev"

:: Ouvre le navigateur une fois le frontend demarre
timeout /t 5 /nobreak >nul
start "" "http://localhost:5173"
