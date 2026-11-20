from pydantic import BaseModel
from enum import Enum
from datetime import date



class Modality(str, Enum):
    rgb = "RGB"
    sar = "SAR"
    mr = "MR"

class Question(BaseModel):
    id: int
    date_added: date
    img_id: int
    people_id: int
    question: str
    type: str
    question: str
    answers_ids: list[int]
    active: bool
    model_config = {"from_attributes": True}  #permet de dire que les champs de la classe sont les mêmes que les champs du json, donc pas besoin de faire des dictionnaires pour faire le lien entre les champs du json et les champs de la classe.


class MetaData(BaseModel):
    name: str
    imageCount: int
    questionCount: int
    size: float
    modalitiesAvailable: list[Modality]
    modalitiesCount: int
    model_config = {"from_attributes": True}  
    
class Image(BaseModel):
    id: int
    type: str
    taille: float
    URL: str
    modalityChosen: Modality
    modalities: list[Modality]
    model_config = {"from_attributes": True}  


class Dataset(BaseModel):
    id: int
    name: str
    metadata: MetaData
    images: list[Image]
    model_config = {"from_attributes": True} 

class DatasetManager(BaseModel):
    listDataset: list[Dataset]
    indexCurrentDataset: int
    model_config = {"from_attributes": True}



