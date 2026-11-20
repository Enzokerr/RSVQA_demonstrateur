from datetime import date


class Answer:

    def __init__(
        self,
        id: int,
        date_added: date,
        question_id: int,
        people_id: int,
        answer: str,
        active: bool,
    ) -> None:
        self.__id: int = id
        self.__date_added: date = date_added
        self.__question_id: int = question_id
        self.__people_id: int = people_id
        self.__answer: str = answer
        self.__active: bool = active

    ##########----(Getters)----##########

    @property
    def id(self) -> int:
        return self.__id

    @property
    def date_added(self) -> date:
        return self.__date_added

    @property
    def question_id(self) -> int:
        return self.__question_id

    @property
    def people_id(self) -> int:
        return self.__people_id

    @property
    def answer(self) -> str:
        return self.__answer

    @property
    def active(self) -> bool:
        return self.__active

    ##########----(Méthodes)----##########

    @classmethod
    def from_json(cls, data: dict) -> "Answer":
        """Désérialise un objet Answer depuis un dictionnaire JSON."""
        return cls(
            id=data["id"],
            date_added=data["date_added"],
            question_id=data["question_id"],
            people_id=data["people_id"],
            answer=data["answer"],
            active=data["active"],
        )
