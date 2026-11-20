import React from "react";
import Card from "./Card";
const Cards = () => {
  return (
    <div className="mx-2 my-10 flex flex-wrap justify-center gap-10 lg:mx-35 lg:gap-15">
      <a href="/demonstrateur">
        <Card
          title="Visualiser son image"
          text="Explorez vos images satellitaires en haute résolution directement dans l'interface. Zoomez, naviguez et analysez chaque détail de vos données de télédétection pour une meilleure compréhension du terrain étudié."
          className="w-40 md:w-60 lg:w-80"
        />
      </a>

      <a href="/demonstrateur">
        <Card
          title="Charger son dataset"
          text="Importez facilement vos datasets de télédétection depuis votre machine. Notre interface accepte les formats standards et prend en charge des datasets de grande taille pour une analyse complète et flexible."
          className="w-40 md:w-60 lg:w-80"
        />
      </a>

      <a href="/demonstrateur">
        <Card
          title="Choisir son dataset"
          text="Sélectionnez parmi une collection de datasets de télédétection préchargés et validés. Parcourez les jeux de données disponibles et choisissez celui qui correspond le mieux à votre zone d'étude ou à votre thématique."
          className="w-40 md:w-60 lg:w-80"
        />
      </a>

      <a href="/demonstrateur">
        <Card
          title="Réponse en langage naturel"
          text="Le modèle RSVQA analyse l'image satellitaire et génère une réponse claire et compréhensible à votre question. Obtenez des informations précises sur le contenu de l'image sans aucune expertise technique requise."
          className="w-40 md:w-60 lg:w-80"
        />
      </a>

      <a href="/demonstrateur">
        <Card
          title="Questions personnalisées"
          text="Formulez librement vos propres questions sur l'image satellitaire affichée. Le modèle interprète votre requête en langage naturel et extrait les informations pertinentes directement depuis les données de télédétection."
          className="w-40 md:w-60 lg:w-80"
        />
      </a>

      <a href="/demonstrateur">
        <Card
          title="Questions prédéfinis"
          text="Accédez à une sélection de questions types associées à chaque dataset pour explorer rapidement ses informations clés. Idéal pour découvrir les capacités du modèle RSVQA sans avoir à formuler vos propres requêtes."
          className="w-40 md:w-60 lg:w-80"
        />
      </a>
    </div>
  );
};

export default Cards;
