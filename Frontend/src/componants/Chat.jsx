/*
Page Chat.

Les fonctions envoie peuvent être optimiséé en nombre de ligne de code
Par manque de temps je laisse cette structure qui marche parfaitement et qui est solide.
Si le projet reprend une Optimisation serai attendu pour alléger les fichiers.

*/
import { BASE_URL } from "./config";
import React, { useState, useRef, useEffect } from "react";
import {
  envoyer_blip,
  envoyer_blip_url,
  envoyer_rsvqa_hr,
  envoyer_rsvqa_hr_url,
  envoyer_rsvqa_lr,
  envoyer_rsvqa_lr_url,
} from "./Sending";
import "../App.css";
import TifImage from "./TifImage";
import { memo, useMemo, useCallback } from "react";
//______________________________________________________________________________________________________________________________________

const Chat = ({ imageExterne, onImageSelectee }) => {
  const [questionsImage, setQuestionsImage] = useState([]); // Tableau qui contient les questions prédef en fonction du choix d'image
  const [input, setInput] = useState(""); //question ecrite user
  const [historique, setHistorique] = useState([]); //tableau des interactions
  const [urlImage, setImage] = useState(null); // URL pour afficher l'image chargé localement que ce soit du dataset ou de la machine locale
  const [fichierImage, setFichierImage] = useState(null); // Pour les images de la machine local impossible d'envoyer une url donc on envoie le fichier brut au back
  const [indiceQuestion, setIndiceQuestion] = useState(0); // Variable de l'indice de la question écrite qui est par défaut à -80 pour les questions user
  const [indiceImage, setIndiceImage] = useState(0); // pareil pour les images qui ne proviennent pas d'un dataset (cela permet de différencier les images lors du traitement backend)
  const [role_image, setRoleImage] = useState(""); // permet de différencier une image qui provient soit de la machine soit d'un dataset
  const [modeleSelectionne, setModeleSelectionne] = useState("blip"); // choix du modèle
  const chatRef = useRef(null); //permet de rendre le chat dynamique avec la barre de scroll

  //Fonction permettant de mélanger les questions afin d'en avoir toujours des différentes. Il y a toujours 4 questions affichées
  const questionsAffichees = useMemo(() => {
    const melangees = [...questionsImage].sort(() => Math.random() - 0.5);
    return melangees.slice(0, 4);
  }, [questionsImage]); //   que si questionsImage change donc si une nouvelle image est selectionné
  //______________________________________________________________________________________________________________________________________

  // permet d'éviter de scroll vers le bas (dès qu'une question est posée redirection vers le bas du chat (pour voir la réponse du modèle))
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [historique]); // quand historique change on lance le code au dessus

  // Recupere les questions à chaque nouvelle image dataset
  useEffect(() => {
    if (!imageExterne?.id || imageExterne?.datasetId === undefined) return;

    fetch(
      `${BASE_URL}/datasets/${imageExterne.datasetId}/image/${imageExterne.id}/questions`,
    )
      .then((res) => res.json())
      .then((data) => setQuestionsImage(data.questions ?? []))
      .catch(() => setQuestionsImage([]));
  }, [imageExterne]); // se modifie seulement quand une nouvelle image est envoyé dans le chat.

  /*
    // Charge automatiquement l'image dataset au démarrage    //Test affichage image back + envoie au modèle
  useEffect(() => {
    setImage(DATASET_TEST_URL);
    setRoleImage("dataset");
  }, []); // [] = dès que le composant chat se lance
*/

  // permet de set les attributs de l'image dataset
  useEffect(() => {
    if (imageExterne) {
      setImage(imageExterne.url);
      setRoleImage("dataset");
      setIndiceImage(imageExterne.id);
    }
  }, [imageExterne]); // se modifie seulement quand une nouvelle image est envoyé dans le chat.

  //______________________________________________________________________________________________________________________________________

  /*
La fonction Envoie est divisé en 2 fonction, Une fonction Envoie et une autre fonction Envoie_question.
Un test de regroupement des 2 fonctions a été effectué mais le temps de savoir si une question était prédéfinis ou non ralentissait l'application.
Pour garder une fluidité Nous gardons alors 2 fonctions.
*/

  // Envoie des infos au backend avec une question non prédéfinie
  const Envoie = async () => {
    if (!input.trim()) return; // empêche message vide .trim() supprime les espaces les tab etc...
    if (!fichierImage && !urlImage) return; // empêche d'envoyer sans image (image de dataset ou image chargée depuis la machine locale)

    const messageUtilisateur = { role: "user", texte: input };
    setHistorique((precedent) => [...precedent, messageUtilisateur]); // On modifie le tableau en rajoutant le message de l'user
    setInput(""); // on remet l'input vide pour les prochains mss

    if (!urlImage) {
      //set l'id d'une image provenant de la machine a -80 pour éviter toute confusion avec les datasets
      setIndiceQuestion(-80);
      setIndiceImage(-80);
    } // sinon mettre l'id de l'image

    let res2; // si choix d'utilisation des 2 modèles
    let res;

    // envoyer la question aux 2 modèles
    if (modeleSelectionne === "both") {
      if (role_image === "machine") {
        res = await envoyer_rsvqa_hr(
          input,
          indiceQuestion,
          fichierImage,
          indiceImage,
          urlImage,
        ); // <- version BLIP
        res2 = await envoyer_rsvqa_lr(
          input,
          indiceQuestion,
          fichierImage,
          indiceImage,
          urlImage,
        ); // <- RSVQA
      } else {
        res = await envoyer_rsvqa_hr_url(
          input,
          indiceQuestion,
          urlImage,
          indiceImage,
        ); // <- version BLIP
        res2 = await envoyer_rsvqa_lr_url(
          input,
          indiceQuestion,
          urlImage,
          indiceImage,
        ); // <- RSVQA
      }
    }

    //envoie au modèle BLIP
    if (modeleSelectionne === "blip") {
      if (role_image === "machine") {
        res = await envoyer_blip(
          input,
          indiceQuestion,
          fichierImage,
          indiceImage,
          urlImage,
        ); // <- version BLIP
      } else {
        res = await envoyer_blip_url(
          input,
          indiceQuestion,
          urlImage,
          indiceImage,
        ); // <- version BLIP
      }
    }

    //envoie au modèle RSVQA-HR
    if (modeleSelectionne === "rsvqa_hr") {
      if (role_image === "machine") {
        res = await envoyer_rsvqa_hr(
          input,
          indiceQuestion,
          fichierImage,
          indiceImage,
          urlImage,
        ); // <- RSVQA-HR
      } else {
        res = await envoyer_rsvqa_hr_url(
          input,
          indiceQuestion,
          urlImage,
          indiceImage,
        ); // <- RSVQA-HR
      }
    }

    //envoie au modèle RSVQA-LR
    if (modeleSelectionne === "rsvqa_lr") {
      if (role_image === "machine") {
        res = await envoyer_rsvqa_lr(
          input,
          indiceQuestion,
          fichierImage,
          indiceImage,
          urlImage,
        ); // <- RSVQA-LR
      } else {
        res = await envoyer_rsvqa_lr_url(
          input,
          indiceQuestion,
          urlImage,
          indiceImage,
        ); // <- RSVQA-LR
      }
    }

    // modification de l'historique en y ajoutant les réponses du modèle.
    if (modeleSelectionne === "both") {
      const reponse_modele = { role: "modele_VQA", texte: res };
      const reponse_modele2 = { role: "modele_VQA", texte: res2 };
      setHistorique((precedent) => [
        ...precedent,
        reponse_modele,
        reponse_modele2,
      ]);
    } else {
      // si question à un seul modèle.
      const reponse_modele = { role: "modele_VQA", texte: res };
      setHistorique((precedent) => [...precedent, reponse_modele]);
    }
  };

  // Envoie des infos au backend avec une question prédéfinie   (meme fonction que Envoie mais pour les question prédef)  // cela permet d'éviter la latence lors de l'envoie de la question dans le chat
  const Envoie_Question = async (texte, reponse, idQuestion) => {
    if (!texte) return;
    if (!fichierImage && !urlImage) return;

    const messageUtilisateur = { role: "user", texte: texte };
    setHistorique((precedent) => [...precedent, messageUtilisateur]);

    if (role_image !== "machine") {
      if (reponse) {
        const reponsePredef = {
          role: "predef",
          texte: "Réponse attendue : " + reponse,
        };
        setHistorique((precedent) => [...precedent, reponsePredef]);
      }
    }

    const indiceQ = urlImage ? idQuestion : -80;
    const indiceI = urlImage ? indiceImage : -80;

    let res2;
    let res;

    if (modeleSelectionne === "both") {
      if (role_image === "machine") {
        res = await envoyer_rsvqa_hr(texte, indiceQ, fichierImage, indiceI); // <- version BLIP
        res2 = await envoyer_rsvqa_lr(texte, indiceQ, fichierImage, indiceI); // <- RSVQA
      } else {
        res = await envoyer_rsvqa_hr_url(texte, indiceQ, urlImage, indiceI); // <- version BLIP
        res2 = await envoyer_rsvqa_lr_url(texte, indiceQ, urlImage, indiceI); // <- RSVQA
      }
    }

    if (modeleSelectionne === "blip") {
      if (role_image === "machine") {
        res = await envoyer_blip(texte, indiceQ, fichierImage, indiceI); // <- version BLIP
      } else {
        res = await envoyer_blip_url(texte, indiceQ, urlImage, indiceI); // <- version BLIP
      }
    }

    //envoie au modèle RSVQA-HR
    if (modeleSelectionne === "rsvqa_hr") {
      if (role_image === "machine") {
        res = await envoyer_rsvqa_hr(
          texte,
          indiceQ,
          fichierImage,
          indiceI,
          urlImage,
        ); // <- RSVQA-HR
      } else {
        res = await envoyer_rsvqa_hr_url(texte, indiceQ, urlImage, indiceI); // <- RSVQA-HR
      }
    }

    //envoie au modèle RSVQA-LR
    if (modeleSelectionne === "rsvqa_lr") {
      if (role_image === "machine") {
        res = await envoyer_rsvqa_lr(
          texte,
          indiceQ,
          fichierImage,
          indiceI,
          urlImage,
        ); // <- RSVQA-LR
      } else {
        res = await envoyer_rsvqa_lr_url(texte, indiceQ, urlImage, indiceI); // <- RSVQA-LR
      }
    }

    if (modeleSelectionne === "both") {
      const reponse_modele = { role: "modele_VQA", texte: res };
      const reponse_modele2 = { role: "modele_VQA", texte: res2 };
      setHistorique((precedent) => [
        ...precedent,
        reponse_modele,
        reponse_modele2,
      ]);
    } else {
      const reponse_modele = { role: "modele_VQA", texte: res };
      setHistorique((precedent) => [...precedent, reponse_modele]);
    }
  };

  //______________________________________________________________________________________________________________________________________

  // permet d'envoyer un message en appuyant sur la touche Entrée.
  function gererTouche(evenement) {
    if (evenement.key === "Enter") {
      Envoie(); // on lance la fonction Envoie
    }
  }

  //______________________________________________________________________________________________________________________________________

  // l'user aura le choix entre choisir une image d'un dataset ou une image depuis sa machine.

  function chargerImageMachine(evenement) {
    const fichier = evenement.target.files[0];
    if (fichier) {
      const urlImage = URL.createObjectURL(fichier); // URL pour afficher l'image dans le navigateur
      setImage(urlImage); // pour l'affichage
      setFichierImage(fichier); // fichier brut qui sera envoyé au Backend car l'image ne se trouve pas dans le back on doit donc l'envoyer comme ca
      setRoleImage("machine");
    }
  }

  //______________________________________________________________________________________________________________________________________

  return (
    <div className="flex w-full max-w-full flex-col gap-6 p-4 md:flex-row md:p-10">
      {/*  Colonne CHAT  */}
      <div className="border-primaryBlue/30 backdrop-sm flex flex-1 flex-col rounded-2xl border bg-[#D3D3D3]/20 p-5">
        <h2 className="text-primaryBlue mb-4 text-lg font-semibold">Chat</h2>

        {/* Historique des messages */}
        <div
          ref={chatRef}
          className="scroll-custom mb-4 flex h-190 flex-col gap-3 overflow-y-auto" /* taille chat */
        >
          {historique.length === 0 && (
            <p className="text-primaryWhite/30 mt-10 text-center text-sm">
              Chargez une image et posez vos questions en anglais
            </p>
          )}

          {/* Ici on remet du code Js permettant de classer les message ( User ou modèle) afin de simplifier l'affichage*/}
          {historique.map((msg, index) => {
            //On trie les messages en fonction de leur rôle (user ou modèle ou reponse predef)
            let classeMessage =
              "max-w-[70%] p-3 rounded-xl break-words text-sm";

            if (msg.role === "user") {
              classeMessage += " self-end bg-primaryBlue/80 text-white";
            } else if (msg.role === "predef") {
              classeMessage +=
                " self-start bg-emerald-500/30 text-emerald-200 border border-emerald-400/40";
            } else {
              classeMessage += " self-start bg-white/10 text-primaryWhite";
            }

            return (
              // On return le message en fonction de sa classe (Gris à gauche pour le modèle et Bleu à droite pour l'user et vert a gauche pour la réponse predef) (on l'ajoute à historique)
              <p key={index} className={classeMessage}>
                {msg.texte}
              </p>
            );
          })}
          {/* si pas d'image chargée */}
          {!fichierImage && !urlImage && (
            <p className="mt-10 mb-2 text-center text-xs font-bold text-orange-400">
              Chargez une image avant d'envoyer une question !!!
            </p>
          )}
        </div>

        {/* Zone de saisie */}
        <div className="mt-auto flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={gererTouche}
            placeholder="Écrire un message..."
            className="border-primaryBlue/30 focus:border-primaryBlue flex-1 rounded-xl border bg-white/10 p-2 text-white outline-none placeholder:text-white/30"
          />
          <button
            onClick={Envoie}
            className="border-primaryBlue hover:bg-primaryBlue/80 hover:shadow-primaryBlue/40 rounded-xl border-2 bg-[#142F9F]/60 px-4 py-2 text-white transition-all duration-300 hover:cursor-pointer hover:shadow-lg"
          >
            Envoyer
          </button>
        </div>
      </div>

      {/* Colonne IMAGE  */}
      <div className="border-primaryBlue/30 backdrop-sm flex w-full flex-col items-center gap-4 rounded-2xl border bg-[#3B76F7]/20 p-5 md:w-[320px]">
        <h2 className="text-primaryBlue text-lg font-semibold">
          Choix du modèle
        </h2>

        {/* Boutons de sélection de modèle */}
        <div className="mt-4 flex flex-col gap-2">
          <button
            className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-all hover:cursor-pointer ${
              modeleSelectionne === "blip"
                ? "bg-primaryBlue/80 text-white"
                : "border-primaryBlue/60 bg-white/10 text-white"
            }`}
            onClick={() => setModeleSelectionne("blip")}
          >
            Utiliser BLIP
          </button>

          <button
            className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-all hover:cursor-pointer ${
              modeleSelectionne === "rsvqa_hr"
                ? "bg-primaryBlue/80 text-white"
                : "border-primaryBlue/60 bg-white/10 text-white"
            }`}
            onClick={() => setModeleSelectionne("rsvqa_hr")}
          >
            Utiliser RSVQA-HR
          </button>

          <button
            className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-all hover:cursor-pointer ${
              modeleSelectionne === "rsvqa_lr"
                ? "bg-primaryBlue/80 text-white"
                : "border-primaryBlue/60 bg-white/10 text-white"
            }`}
            onClick={() => setModeleSelectionne("rsvqa_lr")}
          >
            Utiliser RSVQA-LR
          </button>

          <button
            className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-all hover:cursor-pointer ${
              modeleSelectionne === "both"
                ? "bg-primaryBlue/80 text-white"
                : "border-primaryBlue/60 bg-white/10 text-white"
            }`}
            onClick={() => setModeleSelectionne("both")}
          >
            Utiliser Les 2 modèles
          </button>
        </div>

        {/* Explication du modèle actif */}
        <div className="text-primaryWhite/70 ml-4 hidden w-48 text-xs md:block">
          {modeleSelectionne === "blip" && (
            <p>
              <span className="font-bold">BLIP</span> : modèle VQA spécialisé
              dans les images classiques (non satellitetaire). <br />
              <span className="text-red-500">
                <a
                  href="https://huggingface.co/Salesforce/blip-vqa-base"
                  target="_blank"
                >
                  En savoir plus...
                </a>{" "}
              </span>
            </p>
          )}

          {modeleSelectionne === "both" && (
            <p>
              <span className="font-bold">DUO</span> : Utilisation des modèles
              RSVQA LR et RSVQA HR en simultané.
            </p>
          )}
          {modeleSelectionne === "rsvqa_hr" && (
            <p>
              <span className="font-bold">RSVQA-HR</span> : modèle VQA
              spécialisé sur les images satellites haute résolution. <br />
              <span className="text-red-500">
                <a
                  href="https://huggingface.co/google/paligemma-3b-ft-rsvqa-lr-224-jax"
                  target="_blank"
                >
                  En savoir plus...
                </a>{" "}
              </span>
            </p>
          )}
          {modeleSelectionne === "rsvqa_lr" && (
            <p>
              <span className="font-bold">RSVQA-LR</span> : modèle VQA
              spécialisé sur les images satellites basse résolution. <br />
              <span className="text-red-500">
                <a
                  href="https://huggingface.co/google/paligemma-3b-ft-rsvqa-hr-224-jax"
                  target="_blank"
                >
                  En savoir plus...
                </a>{" "}
              </span>
            </p>
          )}
        </div>

        {/* bouton pour charger une image depuis la machine */}
        <label className="border-primaryBlue hover:bg-primaryBlue/80 hover:shadow-primaryBlue/40 inline-block cursor-pointer rounded-[20px] border-2 bg-[#142F9F]/60 px-3 py-3 text-center text-base font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg">
          Charger une image
          <input
            type="file"
            accept="image/*"
            onChange={chargerImageMachine}
            className="hidden"
          />
        </label>

        {/* zone d'affichage de l'image */}
        {urlImage ? (
          role_image === "machine" ? (
            <img
              src={urlImage}
              alt="image satellite chargée"
              className="border-primaryBlue/30 max-h-100 w-full rounded-xl border object-contain"
            />
          ) : (
            <TifImage url={urlImage} /> // TifImage utilisée pour affiché les images du dataset
          )
        ) : (
          <div className="border-primaryBlue/40 text-primaryWhite/40 flex min-h-62.5 w-full flex-1 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed">
            <span className="text-sm">Aucune image sélectionnée</span>
          </div>
        )}

        {/* tableau des questions prédéf */}
        <div className="w-full overflow-hidden rounded-xl border border-[#3B76F7]/40">
          <div className="border-b border-[#3B76F7]/40 bg-[#142F9F]/60 px-4 py-2">
            <h3 className="text-sm font-semibold tracking-wide text-[#4DA3FF]">
              Questions prédéfinies
            </h3>
          </div>
          <div className="flex flex-col">
            {questionsImage.length === 0 ? (
              <p className="px-4 py-3 text-center text-xs text-white/40 italic">
                Sélectionnez une image depuis un dataset pour voir ses questions
              </p>
            ) : role_image !== "machine" ? (
              questionsAffichees.map((q) => (
                <button
                  key={q.id}
                  onClick={() => Envoie_Question(q.question, q.answer, q.id)}
                  className="group border-b border-[#3B76F7]/20 px-4 py-3 text-left text-sm text-white/80 transition-all duration-200 last:border-b-0 hover:bg-[#3B76F7]/30 hover:text-white"
                >
                  <span className="mr-2 text-[#4DA3FF] transition-colors group-hover:text-white">
                    ~
                  </span>
                  {q.question}
                </button>
              ))
            ) : (
              <p className="px-4 py-3 text-center text-xs text-white/40 italic">
                Cette image ne possède pas de questions prédéfinies car elle ne
                provient pas d'un dataset.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
