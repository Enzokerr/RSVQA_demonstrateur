from .Modality import Modality

class Metadata:
    
######################### Attributs #################################
    _name: str
    _imageCount: int   # Stock le nombre d’images du dataset
    _questionCount: int #Stock le nombre total de questions dans dataset
    _size: float        # La taille du dataset
    _modalitiesAvailable: list[Modality]  #La liste des modalités disponiblent
    _modalitiesCount: int
  
######################### Constructeur #################################
  #Il faut travailler sur l'extraction de json ou bien de chaque fichier tout seul
    def __init__(self, 
                 name: str,
                 imageCount : int, 
                 questionCount: int, 
                 size: float, 
                 modalities: list[Modality] =[]
                 ):
        
        self._name = name
        self._imageCount = imageCount
        self._questionCount = questionCount
        self._size = size
        self._modalitiesAvailable = modalities
        self._modalitiesCount = len(modalities)

######################### Setters/Getters #################################
    @property
    def name(self) -> str:
        return self._name

    @property
    def imageCount(self) -> int:
        return self._imageCount
    @property
    def questionCount(self) -> int:
        return self._questionCount
    @property
    def size(self) -> float:
        return self._size

    @property
    def modalitiesAvailable(self) -> list[Modality]:
        return self._modalitiesAvailable

    @property
    def modalitiesCount(self) -> int:
        return self._modalitiesCount
    ##########----(Setters)----##########

    @imageCount.setter
    def image_count(self, value: int) -> None:
        self._imageCount = value

    @questionCount.setter
    def question_count(self, value: int) -> None:
        self._questionCount = value

    @size.setter
    def size(self, value: float) -> None:
        self._size = value
######################### Methodes #################################
    def displayAllMetadata(self) -> dict: #Liste toutes les metadatas
        return self.__dict__
    
    def displaySomeMetadata(self) -> dict: #Liste que les methadatas mises a sa def
        return {
            "name": self._name,
            "question_count": self._questionCount,
            "size": self._size,
            "modalities": self._modalitiesAvailable
        }