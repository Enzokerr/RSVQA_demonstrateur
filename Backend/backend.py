"""
datasets/
└── nom_du_dataset/
    ├── Images/
    │   ├── 0.tif
    │   └── ...
    ├── PREFIX_split_train_images.json
    ├── PREFIX_split_val_images.json
    ├── PREFIX_split_test_images.json
    └── all_questions.json

INSTALLATION
Backend/  -> pip install fastapi uvicorn python-multipart transformers torch pillow
Frontend/ -> npm install

LANCEMENT
Backend/  -> uvicorn backend:app --reload
Frontend/ -> npm run dev
"""
# INSTALLATION
# _________________________________________________________________
# Backend/
#   pip install fastapi uvicorn python-multipart
#   pip install transformers torch pillow sentencepiece protobuf
#
# Frontend/
#   npm install
#
# LANCEMENT
# _________________________________________________________________
# Backend/   ->  uvicorn backend:app --reload
# Frontend/  ->  npm run dev
# ────────────────────────────────────────────────────────────────
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, File, UploadFile, Form,HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.types import Receive, Scope, Send
from PIL import Image
from transformers import BlipProcessor, BlipForQuestionAnswering
from rsvqa_model import rsvqa_inference
import torch
import io
import os
import json
from routes import router, DOSSIER_DATASETS, CACHE_DATASETS,get_chemin_images

"""
chargement des modèles au lancement de l'app
lors de la première requete de l'utilisateur le modèle répond alors directement
ce qui évite un temps d'attente lors du premier message au RSVQA
"""


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Chargement de HR avant que le serveur se lance et RSVQA LR en arrière plan pendant que le serveur tourne"""

    #chargement de HR directement
    print("Chargement du modèle RSVQA HR.....")
    image_load = Image.new('RGB', (224, 224))   # image factice 
    rsvqa_inference(image_load, "test", resolution="hr") #pour activer HR
    print("Modèle HR chargé prêt à être utilisé.")
    
    #chargement de LR en arrière plan pour éviter une attente de lancement de serveur trop longue
    async def preload_lr():
        print("Chargement du modèle RSVQA LR en background.....")
        await asyncio.sleep(2)  # Attente de 2 secondes pour éviter une surcharge du CPU
        rsvqa_inference(image_load, "test", resolution="lr")    #même principe que HR
        print("Modèle LR chargé en background.")
    
    asyncio.create_task(preload_lr())  # permet de lancer la tache en arrière plan (le site est utilisable même si l'un des 2 modèle n'est pas encore chargé)
    
    yield
    
    print("Fin d'utilisation des modèles")



app = FastAPI(lifespan=lifespan)    # Lance la fonction ci dessus avant le démarrage du serveur

BASE_URL = "http://localhost:8000"

# ── Import du router AVANT les middlewares ────────────────────────────────
from routes import router, DOSSIER_DATASETS, get_chemin_images
app.include_router(router)

# ── CORS appliqué après le router ─────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          #  on ouvre à tout pour le dev
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=False,      #  False obligatoire avec allow_origins=["*"]
)

# Fonction qui appel le modèle BLIP (Fonction provenant du site hugginFace)

def generer_reponse(image_pil: Image.Image, question: str):
    """Génère une réponse texte à partir d'une image PIL + une question."""
    inputs = processor(image_pil, question, return_tensors="pt")
    with torch.no_grad():
        sortie = modele.generate(**inputs)
    reponse = processor.decode(sortie[0], skip_special_tokens=True)
    return reponse 

# ── StaticFiles avec header CORS injecté ─────────────────────────────────
class CORSStaticFiles(StaticFiles):
    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        async def send_with_cors(message):
            if message["type"] == "http.response.start":
                headers = list(message.get("headers", []))
                headers.append((b"access-control-allow-origin", b"*"))
                message["headers"] = headers
            await send(message)
        await super().__call__(scope, receive, send_with_cors)


# ── Mount statique par dataset ─────────────────────────────────────────────
if os.path.exists(DOSSIER_DATASETS):
    for nom_dataset in sorted(os.listdir(DOSSIER_DATASETS)):
        chemin_dataset = os.path.join(DOSSIER_DATASETS, nom_dataset)
        if not os.path.isdir(chemin_dataset):
            continue
        chemin_images = get_chemin_images(chemin_dataset)
        if chemin_images:
            print(f"[STATIC] /static/{nom_dataset} → {chemin_images}")
            app.mount(
                f"/static/{nom_dataset}",
                CORSStaticFiles(directory=os.path.normpath(chemin_images)),
                name=f"static_{nom_dataset}"
            )

# ── Modèle BLIP ───────────────────────────────────────────────────────────
processor = BlipProcessor.from_pretrained("Salesforce/blip-vqa-base")
modele    = BlipForQuestionAnswering.from_pretrained("Salesforce/blip-vqa-base")
print("Modèle BLIP Prêt à répondre")


BASE_DIR               = os.path.dirname(os.path.abspath(__file__))
DOSSIER_DATASETS_LOCAL = os.path.join(BASE_DIR, "datasets")


@app.get("/datasets/{nom}/metadata/{image_nom}")
def metadata_image(nom: str, image_nom: str):
    dossier = os.path.join(DOSSIER_DATASETS_LOCAL, nom)
    with open(os.path.join(dossier, "questions.json")) as f:
        questions = json.load(f)
    with open(os.path.join(dossier, "reponses.json")) as f:
        reponses = json.load(f)
    image_id        = int(os.path.splitext(image_nom)[0])
    questions_image = [q for q in questions if q["image_id"] == image_id]
    reponses_image  = [r for r in reponses if r["question_id"] in [q["id"] for q in questions_image]]
    return {"questions": questions_image, "reponses": reponses_image}


    

# Dans la suite du code, il existe 2 routes par modèles, une récuperant un Fichier (image chargé par l'user) et l'autre un URL (image provenant d'un Dataset)

#___________________________________________________________________________________________________________________________
#1/ modèle BLIP


@app.post("/blip")     # POUR LES IMAGES PROVENANT DE LA MACHINE USER

async def machine_chat(                          # async car on utilise un await
    fichier_image: UploadFile = File(...),       # image envoyé par React recuperer sous forme de File
    question: str     = Form(...),               # question envoyée par React
    indice_img: int     = Form(...),             # question envoyée par React
    indice_qu: int     = Form(...),               # question envoyée par React
    image_url_machine: str  = Form(...)           # url de l'image provenant de la machine      
):
    
    print(str(indice_img)+" et "+str(indice_qu) + image_url_machine)    # affiche dans le terminal les url (utilisé pour des tests)

    # on lit le contenu binaire de l'image
    contenu_image = await fichier_image.read()
 
    # on convertit les bytes en image PIL (format que le modèle comprend)
    image_pil = Image.open(io.BytesIO(contenu_image)).convert("RGB")
 
    # le processor prépare l'image et la question pour le modèle
    inputs = processor(image_pil, question, return_tensors="pt")
 
    # le modèle génère une réponse
    reponse = generer_reponse(image_pil, question)         #appel à la fonction qui genere la réponse du modèle BLIP
 
    return {"reponse": "Reponse du modèle BLIP : "+reponse}         # Reponse envoyé à React

   # POUR LES IMAGES PROVENANT D'UN DATASET 
#même principe que celle provenant de la machine sauf qu'ici on récupère l'url de l'image et on la charge directement dans le backend
#On récupère donc un url et non un fichier
@app.post("/blip_url")
async def machine_chat_from_url(
    image_url: str = Form(...),
    question: str = Form(...),
    indice_img: int = Form(...),    #indices utilisés pour les tests
    indice_qu: int = Form(...),
):
    if not image_url.startswith(f"{BASE_URL}/image-file/"):
        raise HTTPException(status_code=400, detail="URL d'image invalide")

    # image_url = "http://localhost:8000/image-file/nom_dataset/42"
    chemin_relatif = image_url.replace(f"{BASE_URL}/image-file/", "")
    # chemin_relatif = "nom_dataset/42"

    parties = chemin_relatif.split("/")
    if len(parties) < 2:
        raise HTTPException(status_code=400, detail="URL mal formée")

    nom_dataset = parties[0]
    image_id    = parties[1]

    # Récupère le chemin du dossier Images/ via le cache (comme la route /image-file/)
    chemins = CACHE_DATASETS.get(f"_chemins_{nom_dataset}")
    if chemins is None:
        raise HTTPException(status_code=404, detail=f"Dataset '{nom_dataset}' non trouvé dans le cache")

    chemin_images = chemins["images"]

    # Cherche le fichier avec n'importe quelle extension (0.tif, 0.jpg, etc.)
    chemin_absolu = None
    for fichier in os.listdir(chemin_images):
        nom, ext = os.path.splitext(fichier)
        if nom == image_id:
            chemin_absolu = os.path.join(chemin_images, fichier)
            break

    if chemin_absolu is None or not os.path.exists(chemin_absolu):
        raise HTTPException(status_code=404, detail=f"Image '{image_id}' introuvable dans '{chemin_images}'")

    image_pil = Image.open(chemin_absolu).convert("RGB")
    reponse = generer_reponse(image_pil, question)
    return {"reponse": "Reponse du modèle BLIP : " + reponse}

 
#___________________________________________________________________________________________________________________________
#2/ modèle rsvqa HR
#meme principe que pour le modèle BLIP sauf qu'ici la fonction generant une réponse se trouve dans le fichier rsvqa_model.py : fonction provenant de hugginface.

@app.post("/rsvqa_hr")
async def rsvqa_hr_upload(
    fichier_image: UploadFile = File(...),
    question: str  = Form(...),
    indice_img: int = Form(...),
    indice_qu: int  = Form(...),
    image_url_machine: str = Form(...),
):
    print(f"[HR] img={indice_img} qu={indice_qu} url={image_url_machine}")
    contenu = await fichier_image.read()
    image   = Image.open(io.BytesIO(contenu)).convert("RGB")
    reponse = rsvqa_inference(image, question, resolution="hr")
    return {"reponse": "Réponse du modèle RSVQA-HR : " + reponse}



@app.post("/rsvqa_hr_url")
async def rsvqa_hr_url(
    image_url: str  = Form(...),
    question: str   = Form(...),
    indice_img: int = Form(...),
    indice_qu: int  = Form(...),
):
    if not image_url.startswith(f"{BASE_URL}/image-file/"):
        raise HTTPException(status_code=400, detail="URL d'image invalide")

    chemin_relatif = image_url.replace(f"{BASE_URL}/image-file/", "")
    parties = chemin_relatif.split("/")
    if len(parties) < 2:
        raise HTTPException(status_code=400, detail="URL mal formée")

    nom_dataset = parties[0]
    image_id    = parties[1]

    chemins = CACHE_DATASETS.get(f"_chemins_{nom_dataset}")
    if chemins is None:
        raise HTTPException(status_code=404, detail=f"Dataset '{nom_dataset}' non trouvé dans le cache")

    chemin_images = chemins["images"]

    chemin_absolu = None
    for fichier in os.listdir(chemin_images):
        nom, ext = os.path.splitext(fichier)
        if nom == image_id:
            chemin_absolu = os.path.join(chemin_images, fichier)
            break

    if chemin_absolu is None:
        raise HTTPException(status_code=404, detail=f"Image '{image_id}' introuvable")

    image   = Image.open(chemin_absolu).convert("RGB")
    reponse = rsvqa_inference(image, question, resolution="hr")
    return {"reponse": "Réponse du modèle RSVQA-HR : " + reponse}


#___________________________________________________________________________________________________________________________
#3/ modèle rsvqa LR

@app.post("/rsvqa_lr")
async def rsvqa_lr_upload(
    fichier_image: UploadFile = File(...),
    question: str  = Form(...),
    indice_img: int = Form(...),
    indice_qu: int  = Form(...),
    image_url_machine: str = Form(...),
):
    print(f"[LR] img={indice_img} qu={indice_qu} url={image_url_machine}")
    contenu = await fichier_image.read()
    image   = Image.open(io.BytesIO(contenu)).convert("RGB")
    reponse = rsvqa_inference(image, question, resolution="lr")
    return {"reponse": "Réponse du modèle RSVQA-LR : " + reponse}


@app.post("/rsvqa_lr_url")
async def rsvqa_lr_url(
    image_url: str  = Form(...),
    question: str   = Form(...),
    indice_img: int = Form(...),
    indice_qu: int  = Form(...),
):
    if not image_url.startswith(f"{BASE_URL}/image-file/"):
        raise HTTPException(status_code=400, detail="URL d'image invalide")

    chemin_relatif = image_url.replace(f"{BASE_URL}/image-file/", "")
    parties = chemin_relatif.split("/")
    if len(parties) < 2:
        raise HTTPException(status_code=400, detail="URL mal formée")

    nom_dataset = parties[0]
    image_id    = parties[1]

    chemins = CACHE_DATASETS.get(f"_chemins_{nom_dataset}")
    if chemins is None:
        raise HTTPException(status_code=404, detail=f"Dataset '{nom_dataset}' non trouvé dans le cache")

    chemin_images = chemins["images"]

    chemin_absolu = None
    for fichier in os.listdir(chemin_images):
        nom, ext = os.path.splitext(fichier)
        if nom == image_id:
            chemin_absolu = os.path.join(chemin_images, fichier)
            break

    if chemin_absolu is None:
        raise HTTPException(status_code=404, detail=f"Image '{image_id}' introuvable")

    image   = Image.open(chemin_absolu).convert("RGB")
    reponse = rsvqa_inference(image, question, resolution="lr")
    return {"reponse": "Réponse du modèle RSVQA-LR : " + reponse}