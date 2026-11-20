from ..Images.Image import Image
from .Modality import Modality
from .Metadata import Metadata
import json
import os
 
############################## Attention !!!!!!!!!!! cette classe n'est pas encore prete il reste des modifiactions a aporter ################################

class Dataset:

######################### Attributs #########################
    __id: int
    __name: str
    __metadata: Metadata 
        # Chaque split a sa propre liste d'images.
        # loadImages() sait dans quelle liste écrire selon
        # le choix_fichier passé en paramètre (1=test, 2=train, 3=val).
        # Cela permet de charger les 3 splits en une seule instance
        # et de switcher entre eux sans relire le disque.
    __images_train: list[Image] 
    __images_val:   list[Image] 
    __images_test:  list[Image]

######################### Constructeur #########################
    def __init__(self, id: int, name: str) -> None:
        self.__id: int = id
        self.__name: str = name
        self.__metadata: Metadata = Metadata(name, 0, 0, 0)
        # Chaque split a sa propre liste d'images.
        # loadImages() sait dans quelle liste écrire selon
        # le choix_fichier passé en paramètre (1=test, 2=train, 3=val).
        # Cela permet de charger les 3 splits en une seule instance
        # et de switcher entre eux sans relire le disque.
        self.__images_train: list[Image] = []
        self.__images_val:   list[Image] = []
        self.__images_test:  list[Image] = []


######################### Getters/Setters #########################
    @property
    def id(self) -> int:
        return self.__id
#---------------------------------------------------------------------------------------------------------------------
    @property
    def name(self) -> str:
        return self.__name
#---------------------------------------------------------------------------------------------------------------------
    @property
    def metadata(self) -> Metadata:
        return self.__metadata
#---------------------------------------------------------------------------------------------------------------------
    # Les 3 getters ci-dessous permettent à routes.py de récupérer
    # la liste d'images du bon split sans recharger quoi que ce soit.
    # routes.py utilise SPLIT_GETTER[split](dataset) qui appelle
    # l'un de ces 3 getters selon le split demandé par React.

    @property
    def images_train(self) -> list[Image]:
        return self.__images_train
#---------------------------------------------------------------------------------------------------------------------
    @property
    def images_val(self) -> list[Image]:
        return self.__images_val
#---------------------------------------------------------------------------------------------------------------------
    @property
    def images_test(self) -> list[Image]:
        return self.__images_test


######################### Metgodes #########################
    
    def getPredefImage(self, img_id: int) -> Image | None:
        """
        Cherche une image dans les 3 listes et retourne la première trouvée.
        On cherche dans les 3 car on ne connaît pas le split de l'image
        sans information supplémentaire.
        """
        for liste in (self.__images_train, self.__images_val, self.__images_test):
            for img in liste:
                if img.id == img_id:
                    return img
        return None
#---------------------------------------------------------------------------------------------------------------------
    @staticmethod
    def get_taille_dossier(chemin: str) -> float:
        """Calcule la taille totale (en octets) d'un dossier et de ses sous-dossiers."""
        total: float = 0.0
        for repertoire, _, fichiers in os.walk(chemin):
            for fichier in fichiers:
                chemin_fichier: str = os.path.join(repertoire, fichier)
                total += os.path.getsize(chemin_fichier)
        return total
 #---------------------------------------------------------------------------------------------------------------------   
    ################# loadImages va etre modifiée car on devra charger une des 3 liste a la place de tout charger dans la liste images ############

    def loadImages(
        self,
        chemin_json_test: str,
        chemin_json_train: str,
        chemin_json_val: str,
        chemin_dossier_images: str,
        chemin_json_questions: str,
        m: int,
        n: int,
        choix_fichier: int
    ) -> None:
        """
        Charge exactement (n - m) images ACTIVES depuis le fichier JSON
        correspondant au choix_fichier et les place dans la liste du bon split.

        Avant : on prenait data["images"][m:n] → tranche fixe.
        Si les objets de cette tranche avaient tous active=False, la liste
        restait vide et le scroll ne chargeait rien.

        Maintenant : on parcourt le JSON en comptant uniquement les images
        actives. On saute les inactives sans les compter.
        On s'arrête quand on a collecté (n - m) images actives en partant
        du rang m (en ne comptant que les actives).

        Exemple avec m=12, n=24, PAGE_SIZE=12 :
          - On ignore les inactives sans les compter
          - On saute les 12 premières actives (rang 0 à 11)
          - On collecte les 12 suivantes actives (rang 12 à 23)
          - On s'arrête dès qu'on en a 12
        """

        fichier_json = [chemin_json_test, chemin_json_train, chemin_json_val]

        if choix_fichier not in [1, 2, 3]:
            raise ValueError("Choix invalide : entrez 1 (test), 2 (train) ou 3 (val)")

        chemin_json_Images = fichier_json[choix_fichier - 1]

        # On choisit la liste cible selon le split demandé
        if choix_fichier == 1:
            liste_cible = self.__images_test
        elif choix_fichier == 2:
            liste_cible = self.__images_train
        else:
            liste_cible = self.__images_val

        with open(chemin_json_Images) as f:
            data = json.load(f)

        # Nombre d'images actives à collecter pour cette page
        nb_a_collecter = n - m

        # Compteur d'images actives rencontrées depuis le début du JSON.
        # Sert à savoir où on en est dans la pagination en ne comptant
        # que les actives (les inactives sont ignorées sans être comptées).
        compteur_actives = 0

        # Nombre d'images actives effectivement ajoutées à liste_cible
        # durant cet appel. On s'arrête quand il atteint nb_a_collecter.
        nb_collectees = 0

        for img in data["images"]:

            # On ignore les images inactives sans les compter
            # elles ne font pas partie de la pagination
            if not img.get("active", False):
                continue

            # On a une image active : on vérifie si elle fait partie
            # de la page demandée (entre le rang m et n en ne comptant
            # que les actives)
            if compteur_actives < m:
                # Cette image active est avant la page demandée → on la saute
                compteur_actives += 1
                continue

            # Cette image active est dans la page demandée → on la charge
            img_id: int       = img["id"]
            img_path: str | None = None
            extension: str | None = None

            for fichier in os.listdir(chemin_dossier_images):
                nom, ext = os.path.splitext(fichier)
                if nom == str(img_id):
                    img_path  = os.path.join(chemin_dossier_images, fichier)
                    extension = ext.lstrip(".")
                    break

            if img_path is None:
                # On log mais on ne plante pas : on passe à l'image suivante
                print(f"[WARN] Aucun fichier trouvé pour l'image id={img_id}, ignorée")
                compteur_actives += 1
                continue

            taille: float   = os.path.getsize(img_path)
            type_raw: str   = img.get("type", "RGB")
            modalities_list = [Modality(mod.strip()) for mod in type_raw.split(",")]

            image: Image = Image(
                id=img_id,
                type=extension,
                taille=taille,
                URL=img_path,
                modalityChosen=Modality("RGB")
            )
            for mod in modalities_list:
                image.addModality(mod)

            image.add_questions(chemin_json_questions=chemin_json_questions)

            liste_cible.append(image)
            #self.__metadata.image_count    += 1
            #elf.__metadata.question_count += len(image.questions)

            compteur_actives += 1
            nb_collectees    += 1

            # On a collecté les (n - m) images actives demandées → on s'arrête
            if nb_collectees >= nb_a_collecter:
                break
#--------------------------------------------------------------------------------------------------------------------- 

    def compute_metadata_from_disk(
        self,
        chemin_dataset: str,
        chemin_images: str,
        chemin_questions: str
    ) -> None:
        """
        Calcule les metadata du dataset sans charger les images en mémoire.
        """

        # -------------------------
        # 1. Compter les images
        # -------------------------
        nb_images = 0

        for fichier in os.listdir(chemin_images):
            if fichier.lower().endswith((".jpg", ".jpeg", ".png", ".tif", ".tiff")):
                nb_images += 1

        # -------------------------
        # 2. Compter les questions
        # -------------------------
        nb_questions = 0

        try:
            with open(chemin_questions, "r", encoding="utf-8") as f:
                data = json.load(f)

            # Cas classique : {"questions": [...]}
            if isinstance(data, dict) and "questions" in data:
                nb_questions = len(data["questions"])

            # Cas alternatif : liste directe
            elif isinstance(data, list):
                nb_questions = len(data)

            else:
                print("[WARN] Format JSON inattendu pour les questions")

        except Exception as e:
            print(f"[WARN] Erreur lecture questions : {e}")

        # -------------------------
        # 3. Taille du dataset
        # -------------------------
        taille = Dataset.get_taille_dossier(chemin_dataset)

        # -------------------------
        # 4. Mise à jour metadata
        # -------------------------
        self.__metadata.image_count = nb_images
        self.__metadata.question_count = nb_questions
        self.__metadata.size = taille

#---------------------------------------------------------------------------------------------------------------------
#---------------------------------------------------------------------------------------------------------------------

            ##### ancienne version #########
"""
    def load_images(
        self,
        chemin_dataset: str,
        chemin_dossier_images: str,
        chemin_json_questions: str,
    ) -> None:
        """ 'Charge toutes les images du dossier et leurs questions associées. ' """
        for nom_fichier in os.listdir(chemin_dossier_images):
            img_id: int = int(os.path.splitext(nom_fichier)[0])
            img_type: str = nom_fichier.split(".")[-1]

            chemin_complet: str = os.path.join(chemin_dossier_images, nom_fichier)
            img_taille: float = os.path.getsize(chemin_complet)

            img: Image = Image(img_id, img_type, img_taille, None)
            img.add_questions(chemin_json_questions)

            self.__images.append(img)
            self.__metadata.image_count += 1
            self.__metadata.question_count += len(img.questions)

        self.__metadata.size = Dataset.get_taille_dossier(chemin_dataset)
     """
    
