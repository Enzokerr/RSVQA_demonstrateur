import os, sys,json
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "App"))

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from shemas import Dataset, Image, MetaData
from App.services.datasetLoader import (
    DOSSIER_DATASETS,
    SPLIT_GETTER,
    PAGE_SIZE,
    get_chemin_images,
    initialiser_dataset,
    charger_page,
    get_dossiers_datasets,
    get_dataset_par_id,
    get_images_page,
    CACHE_DATASETS,
)

router = APIRouter()


def images_to_pydantic(images: list, nom_dataset: str) -> list[Image]:
    return [
        Image(
            id=img.id,
            type=img.type,
            taille=img.taille,
            URL=f"/image-file/{nom_dataset}/{img.id}",  # ← route API avec CORS
            modalityChosen=img.modalityChosen,
            modalities=img.modalities
        )
        for img in images
    ]

# ─────────────────────────────────────────────────────────────────────────────
# ROUTE : GET /image-file/{nom_dataset}/{image_id}
# Sert le fichier image directement via une route API couverte par le CORS.
# Remplace le mount statique qui ne supportait pas le CORS.
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/image-file/{nom_dataset}/{image_id}")
def servir_image(nom_dataset: str, image_id: str):
    chemins = CACHE_DATASETS.get(f"_chemins_{nom_dataset}")
    if chemins is None:
        raise HTTPException(status_code=404, detail="Dataset non trouvé")

    chemin_images = chemins["images"]

    for fichier in os.listdir(chemin_images):
        nom, ext = os.path.splitext(fichier)
        if nom == image_id:
            return FileResponse(
                os.path.join(chemin_images, fichier),
                media_type="image/tiff"
            )

    raise HTTPException(status_code=404, detail="Image non trouvée")


# ─────────────────────────────────────────────────────────────────────────────
# ROUTE : GET /datasets
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/datasets")
def liste_datasets():
    dossiers = get_dossiers_datasets()
    datasets = []

    for dataset_id, nom_dataset in enumerate(dossiers):
        try:
            dataset = initialiser_dataset(dataset_id, nom_dataset)
            charger_page(nom_dataset, "train", page=0)
            images_train = SPLIT_GETTER["train"](dataset)

            datasets.append(Dataset(
                id=dataset.id,
                name=dataset.name,
                metadata=MetaData(
                    name=dataset.metadata.name,
                    imageCount=dataset.metadata.imageCount,
                    questionCount=dataset.metadata.questionCount,
                    size=dataset.metadata.size,
                    modalitiesAvailable=dataset.metadata.modalitiesAvailable,
                    modalitiesCount=dataset.metadata.modalitiesCount
                ),
                images=images_to_pydantic(images_train[:1], nom_dataset)
            ))
        except Exception as e:
            print(f"[WARN] Dataset '{nom_dataset}' ignoré : {e}")

    return datasets


# ─────────────────────────────────────────────────────────────────────────────
# ROUTE : GET /images?dataset_id=0&split=train&page=0
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/images", response_model=list[Image])
def get_images(dataset_id: int, split: str = "train", page: int = 0):
    if split not in SPLIT_GETTER:
        raise HTTPException(status_code=400, detail=f"Split invalide : '{split}'")

    images, nom_dataset = get_images_page(dataset_id, split, page)
    return images_to_pydantic(images, nom_dataset)


# ─────────────────────────────────────────────────────────────────────────────
# ROUTE : GET /datasets/{dataset_id}
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/datasets/{dataset_id}")
def get_dataset(dataset_id: int):
    dataset, nom_dataset = get_dataset_par_id(dataset_id)
    charger_page(nom_dataset, "train", page=0)
    images_train = SPLIT_GETTER["train"](dataset)

    return Dataset(
        id=dataset.id,
        name=dataset.name,
        metadata=MetaData(
            name=dataset.metadata.name,
            imageCount=dataset.metadata.imageCount,
            questionCount=dataset.metadata.questionCount,
            size=dataset.metadata.size,
            modalitiesAvailable=dataset.metadata.modalitiesAvailable,
            modalitiesCount=dataset.metadata.modalitiesCount
        ),
        images=images_to_pydantic(images_train[:1], nom_dataset)
    )


# ─────────────────────────────────────────────────────────────────────────────
# ROUTE : GET /images/{image_id}/questions
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/images/{image_id}/questions")
def get_questions(image_id: int, dataset_id: int, split: str = "train"):
    dataset, _ = get_dataset_par_id(dataset_id)
    img = dataset.getPredefImage(image_id)
    if img is None:
        raise HTTPException(status_code=404, detail="Image non trouvée")
    return {"questions": img.questions}


# ─────────────────────────────────────────────────────────────────────────────
# ROUTE : DELETE /datasets/{dataset_id}
# ─────────────────────────────────────────────────────────────────────────────
@router.delete("/datasets/{dataset_id}")
def delete_dataset(dataset_id: int):
    dataset, nom_dataset = get_dataset_par_id(dataset_id)
    CACHE_DATASETS.pop(nom_dataset, None)
    CACHE_DATASETS.pop(f"_chemins_{nom_dataset}", None)
    return {"message": f"Dataset '{nom_dataset}' supprimé du cache."}


# ─────────────────────────────────────────────────────────────────────────────
# ROUTE : POST /datasets/upload
# ─────────────────────────────────────────────────────────────────────────────
import zipfile
import shutil
import tempfile
from fastapi import UploadFile, File

@router.post("/datasets/upload")
async def upload_dataset(fichier: UploadFile = File(...)):

    if not fichier.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="Le fichier doit être un .zip")

    contenu = await fichier.read()

    with tempfile.TemporaryDirectory() as tmp_dir:
        chemin_zip = os.path.join(tmp_dir, fichier.filename)

        with open(chemin_zip, "wb") as f:
            f.write(contenu)

        with zipfile.ZipFile(chemin_zip, "r") as zip_ref:
            zip_ref.extractall(tmp_dir)

        # ── Trouver le dossier racine du dataset dans le zip ──────────────
        dossier_dataset = None
        for racine, dossiers, fichiers in os.walk(tmp_dir):
            if "Images" in dossiers:
                a_train     = any(f.endswith("_split_train_images.json") for f in fichiers)
                a_val       = any(f.endswith("_split_val_images.json")   for f in fichiers)
                a_test      = any(f.endswith("_split_test_images.json")  for f in fichiers)
                a_questions = "all_questions.json" in fichiers
                if a_train and a_val and a_test and a_questions:
                    dossier_dataset = racine
                    break

        if dossier_dataset is None:
            raise HTTPException(
                status_code=422,
                detail=(
                    "Structure invalide. Le zip doit contenir : "
                    "Images/, PREFIX_split_train_images.json, "
                    "PREFIX_split_val_images.json, "
                    "PREFIX_split_test_images.json, all_questions.json"
                )
            )

        nom_dataset        = os.path.basename(dossier_dataset)
        chemin_destination = os.path.join(DOSSIER_DATASETS, nom_dataset)

        # ── Renommage automatique si le dataset existe déjà ───────────────
        compteur = 1
        while os.path.exists(chemin_destination):
            nom_dataset        = f"{os.path.basename(dossier_dataset)}_{compteur}"
            chemin_destination = os.path.join(DOSSIER_DATASETS, nom_dataset)
            compteur += 1

        shutil.copytree(dossier_dataset, chemin_destination)

    # ── Initialisation dans le cache ──────────────────────────────────────
    dataset_id = len(get_dossiers_datasets()) - 1
    dataset    = initialiser_dataset(dataset_id, nom_dataset)
    charger_page(nom_dataset, "train", page=0)

    # ── Mount statique du nouveau dataset ─────────────────────────────────
    chemin_images = get_chemin_images(chemin_destination)
    if chemin_images:
        from backend import app, CORSStaticFiles
        app.mount(
            f"/static/{nom_dataset}",
            CORSStaticFiles(directory=os.path.normpath(chemin_images)),
            name=f"static_{nom_dataset}"
        )

    images_train = SPLIT_GETTER["train"](dataset)

    return {
        "message": f"Dataset '{nom_dataset}' ajouté avec succès.",
        "dataset": {
            "id":     dataset.id,
            "name":   dataset.name,
            "images": images_to_pydantic(images_train[:1], nom_dataset)
        }
    }


#_______________________________________________________________________
#route recuperant questions et réponses depuis les json all_questions et all_answers se trouvant dans un dataset

@router.get("/datasets/{dataset_id}/image/{image_id}/questions")
def get_questions_image(dataset_id: int, image_id: int):
    _, nom_dataset = get_dataset_par_id(dataset_id)
    
    chemin_dataset = os.path.join(DOSSIER_DATASETS, nom_dataset)
    chemin_questions = os.path.join(chemin_dataset, "all_questions.json")
    chemin_answers   = os.path.join(chemin_dataset, "all_answers.json")

    if not os.path.exists(chemin_questions) or not os.path.exists(chemin_answers):
        raise HTTPException(status_code=404, detail="Fichiers questions/answers introuvables")

    with open(chemin_questions, encoding="utf-8") as f:
        toutes_questions = json.load(f)["questions"]

    with open(chemin_answers, encoding="utf-8") as f:
        toutes_answers = json.load(f)["answers"]

    # Filtre les questions de cette image
    questions_image = [q for q in toutes_questions if q["img_id"] == image_id and q["active"]]

    # Construit un dict id -> answer pour accès rapide
    answers_par_id = {a["id"]: a["answer"] for a in toutes_answers}

    # Assemble questions + réponse
    resultat = []
    for q in questions_image:
        answer_id = q["answers_ids"][0] if q["answers_ids"] else None
        resultat.append({
            "id":       q["id"],
            "question": q["question"],
            "type":     q["type"],
            "answer":   answers_par_id.get(answer_id, "") if answer_id is not None else ""
        })

    return {"questions": resultat}