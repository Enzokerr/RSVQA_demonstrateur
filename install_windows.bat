@echo off
:: =============================================================================
::  RSVQA - Installation (Windows)
::
::  Usage : double-clic, ou dans un terminal :
::            install_windows.bat                 installation complete
::            install_windows.bat --skip-models   sans telecharger les modeles
::
::  Prerequis : Python 3.10 a 3.13 (3.12 conseille) et Node.js 18+
::  Aucun droit administrateur n'est necessaire : les dependances Python sont
::  installees dans un environnement virtuel (Backend\.venv).
:: =============================================================================
setlocal
cd /d "%~dp0"
title RSVQA - Installation

set "VENV=Backend\.venv"
set "VPY=%VENV%\Scripts\python.exe"

echo.
echo ============================================================
echo   RSVQA - Installation
echo ============================================================

:: --- 1. Python ----------------------------------------------------------------
echo.
echo [1/5] Recherche de Python...
set "PY="
py -3.12 --version >nul 2>&1 && set "PY=py -3.12"
if not defined PY py -3 --version >nul 2>&1 && set "PY=py -3"
if not defined PY python --version >nul 2>&1 && set "PY=python"
if not defined PY (
    echo   [ERREUR] Python est introuvable.
    echo   Installez Python 3.12 depuis https://www.python.org/downloads/
    echo   en cochant "Add python.exe to PATH", puis relancez ce script.
    goto :fail
)
%PY% -c "import sys; sys.exit(0 if (3, 10) <= sys.version_info[:2] < (3, 14) else 1)"
if errorlevel 1 (
    echo   [ERREUR] Version de Python non supportee : il faut Python 3.10 a 3.13.
    %PY% --version
    goto :fail
)
for /f "tokens=2" %%v in ('%PY% --version') do echo   Python %%v - OK

:: --- 2. Node.js ---------------------------------------------------------------
echo.
echo [2/5] Recherche de Node.js...
where npm >nul 2>&1
if errorlevel 1 (
    echo   [ERREUR] Node.js est introuvable.
    echo   Installez Node.js LTS depuis https://nodejs.org puis relancez ce script.
    goto :fail
)
for /f %%v in ('node --version') do echo   Node.js %%v - OK

:: --- 3. Dependances Python ----------------------------------------------------
echo.
echo [3/5] Installation des dependances Python dans %VENV%...
if not exist "%VPY%" (
    %PY% -m venv "%VENV%"
    if errorlevel 1 goto :fail
)
"%VPY%" -m pip install --upgrade pip --quiet
"%VPY%" -m pip install -r Backend\requirements.txt
if errorlevel 1 (
    echo   [ERREUR] L'installation des dependances Python a echoue.
    goto :fail
)
echo   Dependances Python installees.

:: --- 4. Hugging Face et modeles -----------------------------------------------
echo.
echo [4/5] Connexion Hugging Face et telechargement des modeles...
"%VPY%" -c "import sys; from huggingface_hub import get_token; sys.exit(0 if get_token() else 1)"
if errorlevel 1 (
    echo   Les modeles PaliGemma necessitent un token Hugging Face :
    echo     1. acceptez la licence sur huggingface.co/google/paligemma-3b-ft-rsvqa-hr-224
    echo        et sur huggingface.co/google/paligemma-3b-ft-rsvqa-lr-224
    echo     2. creez un token en lecture sur https://huggingface.co/settings/tokens
    echo     3. collez-le ci-dessous : il sera enregistre sur cette machine uniquement.
    echo.
    "%VPY%" -c "from huggingface_hub import login; login()"
    if errorlevel 1 goto :fail
) else (
    echo   Token Hugging Face deja enregistre - OK
)
if /i "%~1"=="--skip-models" (
    echo   Telechargement ignore ^(--skip-models^). Les modeles seront
    echo   telecharges au premier lancement du backend.
) else (
    echo   Telechargement d'environ 14 Go : cela peut prendre du temps.
    "%VPY%" download_models.py
    if errorlevel 1 goto :fail
)

:: --- 5. Frontend --------------------------------------------------------------
echo.
echo [5/5] Installation des dependances du frontend...
pushd Frontend
call npm install
if errorlevel 1 (
    popd
    echo   [ERREUR] npm install a echoue.
    goto :fail
)
popd
echo   Dependances du frontend installees.

echo.
echo ============================================================
echo   Installation terminee.
echo   Lancez l'application avec start_windows.bat
echo ============================================================
echo.
pause
exit /b 0

:fail
echo.
echo   Installation interrompue. Corrigez l'erreur ci-dessus puis relancez.
echo.
pause
exit /b 1
