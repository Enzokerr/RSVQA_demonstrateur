from typing import List
from .Dataset import Dataset

class DatasetManager:

######################### Attributs #########################

    _listDataset: List[Dataset] # Pour stocker les datasets disponibles
    _indexCurrentDataset: int | None # L'indice du dataset choisi par l'utilisateur 

######################### Constructeur #########################

    def __init__(self):
        self._listDataset: List[Dataset]=[]
        self._indexCurrentDataset= None # Quand la liste des datasets est vides aucun dataset ne peut etre selectionne

######################### Getters/Setters #########################

    @property #pour avoir le getter on l'appel sans parenthese comme si cetait publique
    def listDataset(self) -> List[Dataset]:
        "return the list of datasets available in the RSVQA demonstrator"
        return self._listDataset
#---------------------------------------------------------------------------------------------------------------------
    @property
    def indexCurrentDataset(self)-> int | None:
        "return the index of the current dataset selected by the user, None if none is selected " 
        return self._indexCurrentDataset
#--------------------------------------------------------------------------------------------------------------------- 
    @property
    def currentDataset(self):
        "return the current dataset we are working on or None if no dataset is selected"
        if self._indexCurrentDataset is None:
            return None 
        return self._listDataset[self._indexCurrentDataset]
    
######################### Methodes #########################

    def selectDataset(self, index : int):
        "Selects the dataset situated in the index+1 rank in the liste of dataset, return null if the i"
       
        if not self._listDataset: 
            print("Aucun dataset n'est introduit")
            return None
        
        if index < 0 or index >= len(self._listDataset):
            print("indice out of range")
            return None

        self._indexCurrentDataset=index
        return self._listDataset[index]
    # ici le front dois renvoyer l'index du dataset selectionné par l'utilisateur pour qu'il soit selectionné

#---------------------------------------------------------------------------------------------------------------------

  #  def addDatasetFromUser(self, idDataset: int ,datasetName: str): 
  #      "Add the dataset given in arguments in the liste of availables Datasets"
        
   #     dataset = charger_dataset(idDataset, datasetName)
        #La fonction charger dataset charge le dataset son nom et id qui se presente dans le fichier des dataset
        # Il faut parcourir la liste des images et grace a extract qu'on cree les entitées images 
        # et les mettre dans la liste images dans l'attribut dataset 
   #     self.addDatasetToList(dataset)

#---------------------------------------------------------------------------------------------------------------------
    def addDatasetToList(self, dataset: Dataset):
        "Add a created dataset to the list of available datasets"
        self._listDataset.append(dataset)

#---------------------------------------------------------------------------------------------------------------------

    def removeDataset(self, dataset : Dataset):
        "Delete a given dataset"
        #ici on aurait pu utiliser l'index qui serait envoyé par le front pour la supression
        # ou choisir de passer en parametre le dataset en soi 

        if dataset in self._listDataset:
            index = self._listDataset.index(dataset) # Pour ne pas avoir indice faux
            self._listDataset.remove(dataset) # avec l'index on utilisera la methode pop(index)

            if self._indexCurrentDataset == index:
                self._indexCurrentDataset= None
            elif self._indexCurrentDataset > index:
                self._indexCurrentDataset= self._indexCurrentDataset-1
            return True
        
        return False
