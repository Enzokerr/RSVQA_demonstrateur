# 🛰️ Démonstrateur RSVQA

> Interrogez la Terre depuis l'espace, un pixel à la fois.

Application web qui permet de poser des questions en langage naturel sur des
images satellites et d'obtenir une réponse générée par un modèle d'IA :
c'est le **Remote Sensing Visual Question Answering** (RSVQA).
*« Y a-t-il de l'eau sur cette image ? »*, *« Combien de bâtiments voit-on ? »*,
*« La zone est-elle rurale ou urbaine ? »*

Projet réalisé en équipe dans le cadre de la **Licence 2 Informatique** (2025-2026).

<!-- Ajoutez une capture d'écran : docs/screenshots/demonstrateur.png -->
<!-- ![Aperçu du démonstrateur](docs/screenshots/demonstrateur.png) -->

---

## Fonctionnalités

- **Trois modèles au choix** :
  - `PaliGemma RSVQA-HR` : images haute résolution ;
  - `PaliGemma RSVQA-LR` : images basse résolution (Sentinel-2) ;
  - `BLIP VQA` : modèle généraliste, pour comparer.
- **Navigation dans les jeux de données RSVQA** : grille d'images paginée,
  découpage train / val / test, questions et réponses de référence par image.
- **Import d'images** depuis votre machine (y compris au format TIFF) et
  **import de jeux de données** au format RSVQA.
- **Interface de chat** pour enchaîner les questions sur une image.
- **Page de documentation** sur la RSVQA, avec liens vers les jeux de données et les articles.

## Architecture

```
┌──────────────────────────┐   HTTP / JSON    ┌───────────────────────────────┐
│  Frontend (React + Vite) │ ───────────────▶ │  Backend (FastAPI)            │
│  localhost:5173          │ ◀─────────────── │  localhost:8000               │
│  - pages, chat, grille   │                  │  - routes datasets / images   │
│  - affichage TIFF (utif) │                  │  - inférence PaliGemma / BLIP │
└──────────────────────────┘                  └──────────────┬────────────────┘
                                                             │
                                            Hugging Face Transformers + PyTorch
```

| Partie | Technologies |
|---|---|
| Frontend | React 19, React Router 7, Vite, Tailwind CSS 4, UTIF (TIFF) |
| Backend | Python 3.12, FastAPI, Uvicorn, Pydantic |
| IA | PyTorch, Hugging Face Transformers, PaliGemma 3B (fine-tuné RSVQA), BLIP |

## Installation

### Prérequis

- **Python 3.10 à 3.13** (3.12 conseillé) et **Node.js 18+**
- Environ **15 Go d'espace disque** pour les modèles.
- Mémoire : les deux modèles PaliGemma sont chargés au démarrage. Avec un GPU
  NVIDIA, prévoyez environ 12 Go de mémoire vidéo. Sans GPU, le calcul se fait
  sur CPU (plus lent) et demande environ 32 Go de RAM.
- Un **compte Hugging Face** :
  1. acceptez la licence de [paligemma-3b-ft-rsvqa-hr-224](https://huggingface.co/google/paligemma-3b-ft-rsvqa-hr-224)
     et de [paligemma-3b-ft-rsvqa-lr-224](https://huggingface.co/google/paligemma-3b-ft-rsvqa-lr-224) ;
  2. créez un token en lecture sur <https://huggingface.co/settings/tokens>.

### Installation automatique

Le script crée un environnement virtuel Python (`Backend/.venv`), installe les
dépendances, vous demande votre token Hugging Face, télécharge les modèles
(environ 14 Go) puis installe le frontend. Aucun droit administrateur n'est nécessaire.

| Système | Installation | Lancement |
|---|---|---|
| Windows | `install_windows.bat` | `start_windows.bat` |
| Linux / macOS | `bash install_linux_mac.sh` | `bash start_linux_mac.sh` |

Ajoutez `--skip-models` à l'installation pour ne pas télécharger les modèles
tout de suite : ils le seront au premier lancement du backend.

Ouvrez ensuite <http://localhost:5173>. Au premier démarrage, le backend charge
les modèles en mémoire, ce qui peut prendre plusieurs minutes.

### Installation manuelle

```bash
# 1. Backend
cd Backend
python -m venv .venv
source .venv/bin/activate            # Windows : .venv\Scripts\activate
pip install -r requirements.txt
hf auth login                        # collez votre token Hugging Face
python ../download_models.py         # optionnel : pré-télécharge les modèles
python -m uvicorn backend:app --port 8000

# 2. Frontend (dans un second terminal)
cd Frontend
npm install
npm run dev
```

La documentation interactive de l'API est disponible sur <http://localhost:8000/docs>.

### Token Hugging Face

Aucun token n'est inclus dans ce dépôt. Le plus simple est de vous connecter
avec `hf auth login` (les scripts d'installation le font pour vous) : le token
est alors enregistré sur votre machine et utilisé automatiquement.

Vous pouvez aussi le renseigner directement dans le code, dans la constante
`HF_TOKEN` de [`Backend/rsvqa_model.py`](Backend/rsvqa_model.py) et
`HF_TOKEN_DEFAULT` de [`download_models.py`](download_models.py), ou dans la
variable d'environnement `HF_TOKEN`. **Ne publiez jamais un fichier contenant votre token.**

## Jeux de données

Les images ne sont **pas incluses dans le dépôt** à cause de leur taille.
Téléchargez les jeux de données RSVQA de Sylvain Lobry *et al.* sur Zenodo :

- RSVQA **LR** (basse résolution) : <https://zenodo.org/records/6344334>
- RSVQA **HR** (haute résolution) : <https://zenodo.org/records/6344367>

Puis placez chaque jeu de données dans son propre dossier sous `Backend/datasets/` :

```
Backend/datasets/
└── data_LR/
    ├── Images/                      # 0.tif, 1.tif, …
    ├── LR_split_train_images.json
    ├── LR_split_train_questions.json
    ├── LR_split_train_answers.json
    ├── LR_split_val_*.json
    ├── LR_split_test_*.json
    ├── all_questions.json
    └── all_answers.json
```

Le préfixe des fichiers (`LR`, `HR`, …) est détecté automatiquement, et le
dossier d'images est trouvé quel que soit son nom. Un jeu de données peut aussi
être importé depuis l'interface.

## API principale

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/datasets` | Liste des jeux de données disponibles |
| `GET` | `/datasets/{id}` | Détail d'un jeu de données |
| `POST` | `/datasets/upload` | Import d'un jeu de données |
| `GET` | `/image-file/{dataset}/{image_id}` | Fichier image |
| `GET` | `/datasets/{id}/image/{image_id}/questions` | Questions/réponses de référence |
| `POST` | `/rsvqa_hr`, `/rsvqa_lr`, `/blip` | Question sur une image envoyée par l'utilisateur |
| `POST` | `/rsvqa_hr_url`, `/rsvqa_lr_url`, `/blip_url` | Question sur une image d'un jeu de données |

L'adresse du backend utilisée par le frontend se règle dans
`Frontend/src/componants/config.js` (`BASE_URL`).

## Structure du projet

```
RSVQA/
├── Backend/
│   ├── backend.py           # application FastAPI, routes des modèles
│   ├── routes.py            # routes datasets / images
│   ├── rsvqa_model.py       # chargement et inférence PaliGemma RSVQA
│   ├── shemas.py            # schémas Pydantic
│   ├── App/                 # classes métier (Dataset, Image, Model…) et services
│   ├── datasets/            # jeux de données (non versionnés)
│   └── requirements.txt
├── Frontend/
│   └── src/
│       ├── pages/           # Accueil, Démonstrateur, Documentation
│       └── componants/      # composants React (Chat, ImagesGrid, TifImage…)
├── download_models.py       # téléchargement des modèles Hugging Face
├── install_windows.bat      # installation Windows
├── install_linux_mac.sh     # installation Linux / macOS
├── start_windows.bat        # lancement Windows
└── start_linux_mac.sh       # lancement Linux / macOS
```

## Dépannage

- **`401` / `403` lors du téléchargement des modèles** : vérifiez votre token
  et que la licence PaliGemma est bien acceptée sur les deux pages des modèles.
- **Windows : `DLL load failed` à l'import de torch** : installez les
  [redistribuables Visual C++](https://aka.ms/vs/17/release/vc_redist.x64.exe).
- **Windows : Python du Microsoft Store** : préférez l'installateur de
  [python.org](https://www.python.org/downloads/).
- **Réponses lentes** : sans GPU, chaque réponse prend plusieurs secondes sur CPU, c'est normal.

## Équipe

<!-- Complétez avec les membres de l'équipe et le rôle de chacun -->

| Membre |
|---|
| [Kerroumi Enzo](https://github.com/Enzokerr) |
| [Sekhri Massin](https://github.com/...) |
| [Ouaret Anis](https://github.com/...) |
| [Izerkhef Rayan](https://github.com/...) |
| … |

Encadrement : …

## Licence

Le code source est distribué sous licence [MIT](LICENSE).

Les modèles et les données ne sont pas inclus et gardent leurs propres conditions :

- PaliGemma RSVQA (Google) : [Gemma Terms of Use](https://ai.google.dev/gemma/terms) ;
- BLIP (Salesforce) : BSD-3-Clause ;
- jeux de données RSVQA : voir les conditions indiquées sur Zenodo.

## Références

- S. Lobry, D. Marcos, J. Murray, D. Tuia, *RSVQA: Visual Question Answering for
  Remote Sensing Data*, IEEE TGRS, 2020.
- S. Lobry, B. Demir, D. Tuia, *RSVQA meets BigEarthNet: a new, large-scale, visual
  question answering dataset for remote sensing*, IGARSS 2021.
- [PaliGemma](https://ai.google.dev/gemma/docs/paligemma), Google.
