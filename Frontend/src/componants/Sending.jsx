// communication avec le backend, permet d'envoyer la question et l'image chargé.

//_______________________________________________________________________________________________________

import { BASE_URL } from "./config";
/*
Pour chaque modèle il y a 2 fonctions, une qui envoie l'url et l'autre le fichier.
Une optimisation évidente du nombre de ligne de code et de nombre de fonction est possible 
Par manque de temps je laisse cettre structure qui marche parfaitement. Elle pourra être optimisé par la suite si le projet reprend.
*/

//_______________________________________________________________________________________________________

export const envoyer_blip = async (
  question,
  indiceQuestion,
  fichierImage,
  indiceImage,
  urlImage,
) => {
  const formulaire = new FormData();

  formulaire.append("fichier_image", fichierImage);
  formulaire.append("question", question);
  formulaire.append("indice_img", indiceImage.toString());
  formulaire.append("indice_qu", indiceQuestion.toString());
  formulaire.append("image_url_machine", urlImage);

  const res = await fetch(`${BASE_URL}/blip`, {
    method: "POST",
    body: formulaire,
  });

  const data = await res.json();
  return data.reponse;
};

//_______________________________________________________________________________________________________

export const envoyer_blip_url = async (
  question,
  indiceQuestion,
  url_img_dataset,
  indiceImage,
) => {
  const formulaire = new FormData();
  formulaire.append("image_url", url_img_dataset);
  formulaire.append("question", question);
  formulaire.append("indice_img", indiceImage.toString());
  formulaire.append("indice_qu", indiceQuestion.toString());

  const res = await fetch(`${BASE_URL}/blip_url`, {
    method: "POST",
    body: formulaire,
  });

  const data = await res.json();
  return data.reponse;
};

//_______________________________________________________________________________________________________

export const envoyer_rsvqa_hr = async (
  question,
  indiceQuestion,
  fichierImage,
  indiceImage,
  urlImage,
) => {
  const formulaire = new FormData();

  formulaire.append("fichier_image", fichierImage);
  formulaire.append("question", question);
  formulaire.append("indice_img", indiceImage);
  formulaire.append("indice_qu", indiceQuestion);
  formulaire.append("image_url_machine", urlImage);

  const res = await fetch(`${BASE_URL}/rsvqa_hr`, {
    method: "POST",
    body: formulaire,
  });

  const data = await res.json();
  return data.reponse;
};

//_______________________________________________________________________________________________________

export const envoyer_rsvqa_hr_url = async (
  question,
  indiceQuestion,
  url_img_dataset,
  indiceImage,
) => {
  const formulaire = new FormData();

  formulaire.append("image_url", url_img_dataset);
  formulaire.append("question", question);
  formulaire.append("indice_img", indiceImage);
  formulaire.append("indice_qu", indiceQuestion);

  const res = await fetch(`${BASE_URL}/rsvqa_hr_url`, {
    method: "POST",
    body: formulaire,
  });

  const data = await res.json();
  return data.reponse;
};

//_______________________________________________________________________________________________________

export const envoyer_rsvqa_lr = async (
  question,
  indiceQuestion,
  fichierImage,
  indiceImage,
  urlImage,
) => {
  const formulaire = new FormData();

  formulaire.append("fichier_image", fichierImage);
  formulaire.append("question", question);
  formulaire.append("indice_img", indiceImage);
  formulaire.append("indice_qu", indiceQuestion);
  formulaire.append("image_url_machine", urlImage);

  const res = await fetch(`${BASE_URL}/rsvqa_lr`, {
    method: "POST",
    body: formulaire,
  });

  const data = await res.json();
  return data.reponse;
};

//_______________________________________________________________________________________________________

export const envoyer_rsvqa_lr_url = async (
  question,
  indiceQuestion,
  url_img_dataset,
  indiceImage,
) => {
  const formulaire = new FormData();

  formulaire.append("image_url", url_img_dataset);
  formulaire.append("question", question);
  formulaire.append("indice_img", indiceImage);
  formulaire.append("indice_qu", indiceQuestion);

  const res = await fetch(`${BASE_URL}/rsvqa_lr_url`, {
    method: "POST",
    body: formulaire,
  });

  const data = await res.json();
  return data.reponse;
};
