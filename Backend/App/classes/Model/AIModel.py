from typing import List
from typing import Any
from ..Dataset.Modality import Modality
from ..Images.Image import Image
from ..Model.Question import Question
from ..Model.Answer import Answer


class AIModel:

######################### Attributs #########################
    _apiUrl: str  #L'@ du serveur hebergeant 
    _currentModality: List [Modality]  #Les modalités selectionnees par l(user) pour les envoyer au model

######################### Constructeur #########################
    def __init__(self, apiUrl: str ):
        self._apiUrl= apiUrl
        self._currentModality= []

######################### Getters/Setters #########################
    @property
    def apiUrl(self)-> str:
        return self._apiUrl
    
    @property 
    def currentModality(self)->List[Modality]:
        return self._currentModality
       

######################### Methodes #########################
    def getAvailableModalities(self, image: Image) -> List[Modality]:
        return self._currentModality # pour avoir les modalites supported par le model
                               
    
    def selectModalities(self, modalities: List[Modality]):
        self._currentModality = modalities # Les modalitées que le user a selectionné 
                                           # pour envoye au model
        
    def askQuestion(self, 
                    question: Question, 
                    image: Image, 
                    modality: Modality = Modality.RGB,
                    StreamImage: Any = None) -> Answer | None:
        answer : Answer =None
        # 'il faut construire la requete et l'envoyer ici 
        print (f"Question envoyée vers le modele")
        return answer