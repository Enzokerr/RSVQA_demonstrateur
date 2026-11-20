from datetime import datetime
from ..Images.Image import Image
from ..Model.Question import Question
from ..Model.Answer import Answer


class Interaction:

    def __init__(self, question: Question, answer: Answer, image: Image) -> None:
        self.__question: Question = question
        self.__answer: Answer = answer
        self.__image: Image = image
        self.__date: datetime = datetime.now()

    ##########----(Getters)----##########

    @property
    def question(self) -> Question:
        return self.__question

    @property
    def answer(self) -> Answer:
        return self.__answer

    @property
    def image(self) -> Image:
        return self.__image

    @property
    def date(self) -> datetime:
        return self.__date
