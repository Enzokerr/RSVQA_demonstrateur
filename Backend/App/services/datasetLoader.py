import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../"))

from fastapi import HTTPException
from App.classes.Dataset.Dataset import Dataset as DatasetClass

BASE_DIR         = os.path.dirname(os.path.abspath(__file__))
DOSSIER_DATASETS = os.path.normpath(os.path.join(BASE_DIR, "../../datasets"))
PAGE_SIZE        = 12

SPLIT_GETTER = {
    "train": lambda ds: ds.images_train,
    "val":   lambda ds: ds.images_val,
    "test":  lambda ds: ds.images_test,
}

SPLIT_CHOIX = {"train": 2, "val": 3, "test": 1}

CACHE_DATASETS: dict[str, DatasetClass] = {}
CACHE_PAGES: dict[tuple, set]           = {}


"""
la fonction get_chemin_images() sert a extraire le chemin vers les images 
en utilisant la fonction os.walk le system scan le dossier et s'arrete des qu'il a trouvée le un fichier image dans le dossier et renvoie le chemain vers ce dossier 
"""
def get_chemin_images(chemin_dataset: str) -> str | None:
    for racine, dossiers, fichiers in os.walk(chemin_dataset):
        for fichier in fichiers:
            if fichier.lower().endswith((".tif", ".jpg", ".jpeg", ".png")):
                return os.path.normpath(racine)
    return None


"""
cette fonction extrait le prefixe du nom des fichiers json 
"""
def detecter_prefixe(chemin_dataset: str) -> str | None:
    for fichier in os.listdir(chemin_dataset):
        if fichier.endswith("_split_train_images.json"):
            return fichier.replace("_split_train_images.json", "")
    return None

"""
Role : initialiser un dataset et preparer les chemains vers les fichiers json puis les stockée dans le dictionnaire en cache 
"""
def initialiser_dataset(dataset_id: int, nom_dataset: str) -> DatasetClass:
    if nom_dataset in CACHE_DATASETS: #verifie si le dataset est deja en cache 
        return CACHE_DATASETS[nom_dataset]

    chemin_dataset = os.path.join(DOSSIER_DATASETS, nom_dataset)# le chemin vers le dataset 
    chemin_images  = get_chemin_images(chemin_dataset)# utilise la fonction chemin images pour extraire le chemain vers les images 

    if chemin_images is None: 
        raise HTTPException(status_code=404, detail=f"Aucun dossier Images trouvé dans {nom_dataset}")

    prefixe = detecter_prefixe(chemin_dataset) #sors le prefixe des fichiers json en utilisant detecter prefixe 
    if prefixe is None:
        raise HTTPException(status_code=404, detail=f"Aucun fichier JSON trouvé dans {nom_dataset}")

    dataset = DatasetClass(dataset_id, nom_dataset) # creation de l'objet dataset 
    dataset.compute_metadata_from_disk( chemin_dataset=chemin_dataset,
                                        chemin_images=chemin_images, # ajout des metadata dans le dataset 
                                        chemin_questions=os.path.join(chemin_dataset, "all_questions.json"))
    
    CACHE_DATASETS[nom_dataset] = dataset # ajout de l'objet dans le dictionnaire 
    CACHE_DATASETS[f"_chemins_{nom_dataset}"] = {
        "train":     os.path.join(chemin_dataset, f"{prefixe}_split_train_images.json"),
        "test":      os.path.join(chemin_dataset, f"{prefixe}_split_test_images.json"),  #remplire le dictionnaire avec les chemins (la fonction join fait la liaison des attributs des chemain selon le system d'exploitation)
        "val":       os.path.join(chemin_dataset, f"{prefixe}_split_val_images.json"),
        "questions": os.path.join(chemin_dataset, "all_questions.json"),
        "images":    chemin_images,
    }

    return dataset


def charger_page(nom_dataset: str, split: str, page: int) -> None:
    cle_cache = (nom_dataset, split)
    if cle_cache not in CACHE_PAGES:
        CACHE_PAGES[cle_cache] = set()

    if page in CACHE_PAGES[cle_cache]:
        return

    chemins = CACHE_DATASETS.get(f"_chemins_{nom_dataset}")
    if chemins is None:
        raise HTTPException(status_code=500, detail=f"Chemins introuvables pour {nom_dataset}")

    dataset = CACHE_DATASETS[nom_dataset]
    m = page * PAGE_SIZE
    n = (page + 1) * PAGE_SIZE

    try:
        dataset.loadImages(
            chemin_json_test      = chemins["test"],
            chemin_json_train     = chemins["train"],
            chemin_json_val       = chemins["val"],
            chemin_dossier_images = chemins["images"],
            chemin_json_questions = chemins["questions"],
            m=m,
            n=n,
            choix_fichier=SPLIT_CHOIX[split]
        )
        CACHE_PAGES[cle_cache].add(page)
    except Exception as e:
        print(f"[WARN] Page {page} split '{split}' non chargée pour '{nom_dataset}' : {e}")


def get_dossiers_datasets() -> list[str]:
    """Retourne la liste triée des noms de dossiers datasets."""
    if not os.path.exists(DOSSIER_DATASETS):
        raise HTTPException(status_code=404, detail="Dossier datasets introuvable")
    return sorted([
        d for d in os.listdir(DOSSIER_DATASETS)
        if os.path.isdir(os.path.join(DOSSIER_DATASETS, d))
    ])


def get_dataset_par_id(dataset_id: int) -> tuple[DatasetClass, str]:
    """Retourne (instance DatasetClass, nom_dataset) pour un dataset_id donné."""
    dossiers = get_dossiers_datasets()
    if dataset_id < 0 or dataset_id >= len(dossiers):
        raise HTTPException(status_code=404, detail="Dataset non trouvé")
    nom_dataset = dossiers[dataset_id]
    dataset     = initialiser_dataset(dataset_id, nom_dataset)
    return dataset, nom_dataset


def get_images_page(dataset_id: int, split: str, page: int) -> tuple[list, str]:
    """Charge et retourne la tranche d'images pour une page donnée + le nom du dataset."""
    dataset, nom_dataset = get_dataset_par_id(dataset_id)
    charger_page(nom_dataset, split, page)
    toutes = SPLIT_GETTER[split](dataset)
    debut  = page * PAGE_SIZE
    return toutes[debut:debut + PAGE_SIZE], nom_dataset