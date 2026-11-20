from datetime import date #Pour set date added de question pour les questions non predef 
from typing import Any #pour le type file
from typing import List
from .ModelManager import ModelManager
from ..Dataset.DatasetManager import DatasetManager
from ..Dataset.Modality import Modality
from ..Images.Image import Image
from ..Model.Question import Question
from ..Model.Answer import Answer
from ..Model.Interaction import Interaction



class ChatInterface:

######################### Attributs #########################
    _questionInput: Question     # La question de l'utilisateur a envoyer au model
    _answerOutput: Answer        # La reponse recu du model concerant currentImage et Question
    _currentImage: Image         # L'image choisie par l'utilisateur 

    _history: List[Interaction]  # L'historique pour gerder les interactions dans le backend
    
    _datasetManager: DatasetManager # Le datasetManager qui stock la liste des datasets et l'indice du dataset choisie 
    #Le modele charge dans l'interaction 
    _modelManager: ModelManager # Contenant la liste des modeles et le modele choisi pour cette interaction 


######################### Constructeur ######################### 

    def __init__(self,
                 datasetmanager: DatasetManager,
                 modelmanager : ModelManager, 
                 question: Question| None =None , 
                 answer: Answer | None =None, 
                 image:Image | None =None,):

        self._questionInput=question
        self._answerOutput=answer
        self._currentImage=image
        self._history=[]
        self._datasetManager=datasetmanager
        self._modelManager=modelmanager
   
######################### Getters/Setters #########################
    @property
    def history(self)->List[Interaction]: # de base avec @property on met directement history 
        """Return the history of interactions of the user during the session"""
        return self._history
    
    @property
    def answerOutput (self):
        return self._answerOutput
    
    @property
    def questionInput(self):
        return self._questionInput
    @property
    def currentImage(self):
        return self._currentImage
    
   

    def setQuestionInput(self, text : str, idQuestion: int ): # On recupere le id et le text de la question du front

        if not self._currentImage: # si currentImage est a None (pas set)
            print ("Vous initialisez le question en entrée sans image")
            return None 
        
        if idQuestion <0 :
            # Dans le cas ou  la question n'est pas predef, la question est personnalisée
                # On recupere le id de l'image en question et on est sur qu'elle serait pas None car 
                # Aucune question ne traine sans image, d'abord on choisi l'image puis on pose la question

            question = Question(idQuestion, 
                                date.today(), 
                                self._currentImage.id, 
                                question=text) # <-- La creation de l'instance Question
        else: 
            # La question est une question predef 
            question = self._currentImage.getPredefQuestion(idQuestion) 
            # Vu que on a l'image on fetch dans ses questions predef et recupere l'instance grace a getPredefQuestion

        self._questionInput = question

        

    def setCurrentImage(self, 
                        id : int , 
                        url: str, 
                        chosenModality: Modality = Modality.RGB):
        """
        To set the image to be sent to the model after receiving it from the user
        Arguments:
            id : the id of the image chosen ( <0 : if the image came from the user's machine
                                                >0: if the image is selected from a chosen dataset )
            url : URL of the image ( required to save the images in the history - creat the entities )
            modalityChosen : the modality chosen to send the image with to the model ( Default = RGB )
        """

        #=========>>> Verifier si le modele est bien selectionné
        if not self._modelManager or self._modelManager.currentModel is None:
            print("Aucun modele n'est selectionne")
            return None
        
        #=========>>>Recuperer le modele courant
        currentModel= self._modelManager.currentModel

        #=========>>> Verfie si la modality est disponible pour le model choisi
        if not self.checkModalityInModel(chosenModality):
            print (f"Modalité {chosenModality} est non disponible dans ce model")
            return None
        
        #=========>>> Creation de l'image 
        currentImage = None
        currentDataset = None
        if id< 0:
            #Le cas 01 ==> l'image n'est pas predef dans le dataset 
            currentImage= Image(
                id=id, 
                URL=url,
                modality = chosenModality,
                type= None,      #  A determiner automatiquement si besion avec une methode dans image getImageSizeFromUrl(url)
                taille = None,   # A determiner automatiquement si besion 
                )
            
        else:
            #Le cas 02 ==> l'image envoyée est predef dans le dataset choisi
            print(f"Recherche de limage predefinie (ID_dataset: {self._datasetManager.currentDataset.id} / ID_image: {id})")
            #la cherche dans le dataset courant avec une methode deja def dans dataset
            currentDataset = self._datasetManager.currentDataset
            currentImage= currentDataset.getPredefImage(id)

            if currentImage is None:
                print(f"Image {id} non retrouvée dans le dataset ID= {self._datasetManager.currentDataset.id}")
                return None
            
            # Mettre a jour la current Modality

            currentImage.modality = chosenModality
            print (f"Image Predefinie trouvée")
        
                    
        self._currentImage=currentImage
        print(f"Image courante definie: ID={currentImage.id}, Modality={chosenModality}")
        if currentDataset is not None:
            print(f"Dataset: ID={currentDataset.id}")
        else:
            print("Image personnelle sans dataset")

######################### Methodes #########################

#Pour verifier si la modalité choisi par l'utilisateur est acceptee ( supported ) par le model 
    def checkModalityInModel(self, chosenModality : Modality)-> bool:
        """Check if the modality sent is supported by the current model running"""
        currentModel= self._modelManager.currentModel

        if currentModel is None:
            print("Aucun modele n'est selectionné")
            return False
        if chosenModality not in currentModel.currentModality:
            print(f" Modalité {chosenModality} non trouvée")
            return False
        return True


    def sendQuestion(self, 
                    question : Question|None = None, 
                    image: Image|None = None, 
                    imageStream: Any =None #Need to check avec le front ce qu'il envoie exacte if it is bytes or what
                    )-> Answer| None :
        """
        Send the question to the current AIModel ( Send Either the currentImage and questionInput 
                                                    Already defined in the class and set before or 
                                                    The Question and Image passed in arguments) 
        Arguments:
            question : Question to ask to the model ( Optional , if None we will send the questionInput set in the class ChatInterface)
            image : Image to analyse by the model ( Optional, if None we will send the currentImage set in the class ChatInterface)
            imageStream : Stream (flux) of the image to be sent to the model

        returns:
            Answer: the answer of the model or None if ERROR                                            
        """

    # Dans le cas ou StreamImage est None soit une erreur ou l'image est predefinie 
    # Dans le cas l'image est predefinie ou ouvre son stream a l'envoyer ici ou dans la fonction askQuestion dans AIModel 



    # On peut soit: mettre une image dans cette fonction ou bien 
    # poser la question avec l'image qui est dans _currentImage
    
    #====> Determiner l'image a envoyer
        if image :
            imageToSend= image
        else:
            imageToSend= self._currentImage


    # On peut soit: mettre une question de type Question dans cette fonction ou bien 
    # poser la question  qui est dans deja dans l'instance _questionInput

    #====> Determiner la question a envoyer
        if question :
            questionToSend= question 
        else:
            questionToSend= self._questionInput

        if not imageToSend: 
            print(" Aucune image n'a ete soumise")
            return None
    
        if not questionToSend:
            print (" Aucune question n'a ete soumise")
            return None
        
        if  self._modelManager.currentModel is None: 
            print (" Aucun model n'est selectionné dans le ChatInderface")
            return None
        
    #====> Definir la modalité
        modality = self._currentImage.modality
        if modality is None:
            print("Modalité non definie, l'image serait envoyée par defaut avec RGB ")
            modality = "RGB"

    #====> Envoyer la question et l'image au modele choisi
        answer= self._modelManager.currentModel.askQuestion(question= questionToSend, 
                                                            image = imageToSend,
                                                            modality= modality,
                                                            ImageStream = imageStream)
        if not answer:
            print( " Aucune reponse n'a ete generee \n")
            return None
        
    #====> Mettre a jour les question/Image/Answer de ChatInterface

        self._answerOutput=answer

        # Dans le cas ou on a mis l'image et la question dans les arguments
        # il est important de les mettres dans les elements courant du Chat
        if image is not None :
            self._currentImage=image
        if question is not None:
            self._questionInput=question
        
    #====> Archiver l'interaction 
        self.ArchiveInteraction()

        return answer

                 
    #def displayAnswer(self):  #Display as in print not a getter 
     #   if self._answerOutput: #Non vide
      #      print(self._answerOutput)

    def ArchiveInteraction(self)->None:
        """Archive the current interaction ( Question / Image / Answer / Model) in history"""

        if self._currentImage and self._questionInput and self._answerOutput:
            currentInteraction= Interaction(question=self._questionInput, 
                                        answer=self._answerOutput,
                                        image= self._currentImage,
                                        model= self._modelManager.currentModel)
            self._history.append(currentInteraction)
            print (f"Interaction archivée (total: {len(self._history)})")
    
    def clearChat(self):
        """Clear all the history of the session"""
        self._history.clear()
        
    def resetQuestionImageAnswer(self)->None:
        """Clean all the content of Question Image and Answer"""
        self._currentImage = None
        self._questionInput = None
        self._answerOutput = None
