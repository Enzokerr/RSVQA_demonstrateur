from datetime import date


class Question:

    def __init__(
        self,
        id: int,
        date_added: date,
        img_id: int,
        people_id: int,
        type: str,
        question: str,
        answers_ids: list[int],
        active: bool,
    ) -> None:
        self.__id: int = id
        self.__date_added: date = date_added
        self.__img_id: int = img_id
        self.__people_id: int = people_id
        self.__type: str = type
        self.__question: str = question
        self.__answers_ids: list[int] = answers_ids
        self.__active: bool = active

    ##########----(Getters)----##########

    @property
    def id(self) -> int:
        return self.__id

    @property
    def date_added(self) -> date:
        return self.__date_added

    @property
    def img_id(self) -> int:
        return self.__img_id

    @property
    def people_id(self) -> int:
        return self.__people_id

    @property
    def type(self) -> str:
        return self.__type

    @property
    def question(self) -> str:
        return self.__question

    @property
    def answers_ids(self) -> list[int]:
        return self.__answers_ids

    @property
    def active(self) -> bool:
        return self.__active

    ##########----(Méthodes)----##########
"""
    @classmethod
    def from_json(cls, data: dict) -> "Question":
        """ 
'Désérialise un objet Question depuis un dictionnaire JSON.  '

"""
        return cls(
            id=data["id"],
            date_added=data["date_added"],
            img_id=data["img_id"],
            people_id=data["people_id"],
            type=data["type"],
            question=data["question"],
            answers_ids=data["answers_ids"],
            active=data["active"],
        )
"""