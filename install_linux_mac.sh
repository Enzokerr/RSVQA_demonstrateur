#!/usr/bin/env bash
# =============================================================================
#  RSVQA - Installation (Linux / macOS)
#
#  Usage : bash install_linux_mac.sh                 installation complète
#          bash install_linux_mac.sh --skip-models   sans télécharger les modèles
#
#  Prérequis : Python 3.10 à 3.13 (3.12 conseillé) et Node.js 18+
#  Les dépendances Python sont installées dans un environnement virtuel
#  (Backend/.venv) : rien n'est installé au niveau du système, pas de sudo.
# =============================================================================
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"
VENV="Backend/.venv"
SKIP_MODELS=false
[[ "${1:-}" == "--skip-models" ]] && SKIP_MODELS=true

step() { printf '\n\033[0;34m%s\033[0m\n' "$1"; }
ok()   { printf '\033[0;32m  ✔ %s\033[0m\n' "$1"; }
fail() { printf '\033[0;31m  ✖ %s\033[0m\n' "$1"; exit 1; }

echo "============================================================"
echo "  RSVQA - Installation"
echo "============================================================"

# --- 1. Python ----------------------------------------------------------------
step "[1/5] Recherche de Python..."
PY=""
for candidate in python3.12 python3.13 python3.11 python3.10 python3; do
    if command -v "$candidate" >/dev/null 2>&1 && \
       "$candidate" -c "import sys; sys.exit(0 if (3, 10) <= sys.version_info[:2] < (3, 14) else 1)"; then
        PY="$candidate"
        break
    fi
done
[[ -n "$PY" ]] || fail "Python 3.10 à 3.13 introuvable. Installez-le (apt, dnf, brew, python.org) puis relancez."
ok "$("$PY" --version)"

# --- 2. Node.js ---------------------------------------------------------------
step "[2/5] Recherche de Node.js..."
command -v npm >/dev/null 2>&1 || fail "Node.js introuvable. Installez Node.js 18+ (https://nodejs.org) puis relancez."
NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
(( NODE_MAJOR >= 18 )) || fail "Node.js $(node --version) trop ancien : la version 18 minimum est requise."
ok "Node.js $(node --version)"

# --- 3. Dépendances Python ----------------------------------------------------
step "[3/5] Installation des dépendances Python dans $VENV..."
[[ -x "$VENV/bin/python" ]] || "$PY" -m venv "$VENV"
"$VENV/bin/python" -m pip install --upgrade pip --quiet
"$VENV/bin/python" -m pip install -r Backend/requirements.txt
ok "Dépendances Python installées"

# --- 4. Hugging Face et modèles -----------------------------------------------
step "[4/5] Connexion Hugging Face et téléchargement des modèles..."
if "$VENV/bin/python" -c "import sys; from huggingface_hub import get_token; sys.exit(0 if get_token() else 1)"; then
    ok "Token Hugging Face déjà enregistré"
else
    echo "  Les modèles PaliGemma nécessitent un token Hugging Face :"
    echo "    1. acceptez la licence sur huggingface.co/google/paligemma-3b-ft-rsvqa-hr-224"
    echo "       et sur huggingface.co/google/paligemma-3b-ft-rsvqa-lr-224"
    echo "    2. créez un token en lecture sur https://huggingface.co/settings/tokens"
    echo "    3. collez-le ci-dessous : il sera enregistré sur cette machine uniquement."
    echo ""
    "$VENV/bin/python" -c "from huggingface_hub import login; login()"
fi
if $SKIP_MODELS; then
    echo "  Téléchargement ignoré (--skip-models) : les modèles seront"
    echo "  téléchargés au premier lancement du backend."
else
    echo "  Téléchargement d'environ 14 Go : cela peut prendre du temps."
    "$VENV/bin/python" download_models.py
fi

# --- 5. Frontend --------------------------------------------------------------
step "[5/5] Installation des dépendances du frontend..."
(cd Frontend && npm install)
ok "Dépendances du frontend installées"

echo ""
echo "============================================================"
echo "  Installation terminée."
echo "  Lancez l'application avec : bash start_linux_mac.sh"
echo "============================================================"
