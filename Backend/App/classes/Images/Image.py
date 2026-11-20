from ..Dataset.Modality import Modality
from ..Model.Question import Question
import json


class Image:

    def __init__(
        self,
        id: int,
        URL :str,
        modalityChosen : Modality = Modality.RGB,
        type: str|None = None,
        taille: float| None = None,
    ) -> None:
        self.__id: int = id
        self.__URL :str = URL
        self.__type: str = type
        self.__taille: float = taille
        self.__modalities: list[Modality] = []
        self.__modalityChosen : Modality = modalityChosen
        self.__questions: list[Question] = []

    ##########----(Getters)----##########

    @property
    def id(self) -> int:
        return self.__id

    @property
    def type(self) -> str:
        return self.__type

    @property
    def taille(self) -> float:
        return self.__taille
    
    @property
    def URL(self) -> str:
        return self.__URL


    @property
    def modalities(self) -> list[Modality]:
        return self.__modalities
    
    @property
    def modalityChosen(self) -> Modality:
        return self.__modalityChosen

    @property
    def questions(self) -> list[Question]:
        return self.__questions

    ##########----(Méthodes)----##########

    def add_questions(self, chemin_json_questions: str) -> None:
        """Charge les questions associées à cette image depuis un fichier JSON."""
        with open(chemin_json_questions) as f:
            data = json.load(f)

        for q in data["questions"]:
            if q["img_id"] == self.__id:
                self.__questions.append(
                    Question(
                        id=q["id"],
                        date_added=q["date_added"],
                        img_id=q["img_id"],
                        people_id=q["people_id"],
                        type=q["type"],
                        question=q["question"],
                        answers_ids=q["answers_ids"],
                        active=q["active"],
                    )
                )

    def getPredefQuestion(self, id: int) -> Question | None:
        """Retourne la question correspondant à l'id donné, ou None si introuvable."""
        for q in self.__questions:
            if q.id == id:
                return q
        return None
    
    def setModalityChosen(self,Modality:Modality) -> None :
        self.__modalityChosen=Modality

    def addModality(self,Modality : Modality) -> None :
        self.__modalities.append(Modality)