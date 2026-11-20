from typing import List
from .AIModel import AIModel

class ModelManager:

######################### Attributs #############################
    _listeModels: List[AIModel]    # Liste des modeles disponibles dans le site
    _indexChosenModel: int | None  # L'indice du model choisi pour cette interaction 
    
    def __init__(self):
        self._listeModels=[]
        self._indexChosenModel = None
######################### Getters/Setters #############################

    @property
    def listeModels(self)-> List[AIModel]:
        return self._listeModels
    
    @property
    def indexChosenModel(self)-> int|None:
        return self._indexChosenModel
    
    @property
    def currentModel(self)->AIModel | None:
        """ returns the current model chosen by the user"""

        if  self._indexChosenModel is None:
            print("Le modele n'a pas ete initialisé")
            return None
        
        if self._indexChosenModel >= len(self._listeModels):
            print("L'indices du model choisi est out of range")
            return None
            
        return self._listeModels[self._indexChosenModel]
    
######################### Methodes #############################
    def selectModel(self, index: int):

        if index <0 or index >= len(self.listeModels):
            return None 
        
        self._indexChosenModel = index
        return self._listeModels[index]
    
    def addModel(self, model: AIModel):
        self._listeModels.append(model)

    def deleteModel(self, model: AIModel):
        self._listeModels.remove(model)
    # Dans le cas ou on veut acceder au model a supprimer 
    # avec son index dans la liste on pourrait utiliser 
    # la methode removeAt(index) 