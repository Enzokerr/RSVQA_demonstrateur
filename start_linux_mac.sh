#!/usr/bin/env bash
# =============================================================================
#  RSVQA - Lancement (Linux / macOS)
#  Usage : bash start_linux_mac.sh      (Ctrl+C arrête les deux serveurs)
# =============================================================================
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

[[ -x Backend/.venv/bin/python ]] || { echo "Environnement Python introuvable : lancez d'abord install_linux_mac.sh"; exit 1; }
[[ -d Frontend/node_modules ]]    || { echo "Dépendances du frontend absentes : lancez d'abord install_linux_mac.sh"; exit 1; }

cleanup() {
    echo ""
    echo "Arrêt des serveurs..."
    kill "${BACKEND_PID:-}" "${FRONTEND_PID:-}" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

(cd Backend && exec .venv/bin/python -m uvicorn backend:app --host 127.0.0.1 --port 8000) &
BACKEND_PID=$!

(cd Frontend && exec npm run dev) &
FRONTEND_PID=$!

echo ""
echo "  Backend  : http://localhost:8000   (documentation API : /docs)"
echo "  Frontend : http://localhost:5173"
echo ""
echo "  Le backend charge les modèles au démarrage : cela peut prendre"
echo "  plusieurs minutes. Ctrl+C pour tout arrêter."
echo ""

wait
