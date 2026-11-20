from enum import Enum # Import depuis le module Enum predef 

class Modality(str, Enum): # heritge de la classe chaine et celle d'enumeration 

    RGB = "RGB"  
    SAR = "SAR"   
    MR = "MR"     
