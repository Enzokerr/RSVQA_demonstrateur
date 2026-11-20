import React, { useRef } from "react";
import Navbar from "../componants/Navbar";
import Footer from "../componants/Footer";
import Cards from "../componants/Cards";
import grid from "../assets/grids.png";
import Ellipse from "../assets/Ellipse.png";
import shadow from "../assets/shadow.png";
import vectorbas from "../assets/VectorBas.png";
import Card from "../componants/Card";
import DatasetsDownload from "../componants/DatasetsDownload";
import DatasetLR from "../assets/DatasetLR.png";
import DatasetHR from "../assets/DatasetHR.png";
import DocumentRSVQA from "../componants/DocumentRSVQA";
import Doc1 from "../assets/Doc1.png";
import Doc2 from "../assets/Doc2.png";
import Doc3 from "../assets/Doc3.png";

const Documentation = () => {
  const docsRef = useRef(null);
  const datasets = [
    {
      label: "Dataset HR: High Resolution",
      img: DatasetHR,
      file: "https://zenodo.org/api/records/6344367/files-archive",
    },
    {
      label: "Dataset LR: Low Resolution",
      img: DatasetLR,
      file: "https://zenodo.org/api/records/6344334/files-archive",
    },
  ];

  return (
    <div className="bg-blue-950">
      <div className="relative overflow-hidden bg-[#141A2E]">
        {" "}
        {/* le container principale avec la couleur principale
                                                                  et aussi couper les bordures pour que les grides ne depassent pas */}
        {/* Overlay noir rajouté en dessus de la couche de couleur avec une opacité de 20% */}
        <div className="absolute inset-0 z-0 bg-black/20"></div>
        {/* rajouter les Grids dupliques sur la page comme une 3e couche de background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${grid})`,
            backgroundRepeat: "repeat", // {/* l'image des grids disponible dans assets va se repeter sur les x et les y*/}
            backgroundSize: "800px 800px", // {/* La taille de chaque grids ici cest 800 800 pour avoir des carreaux rectengulaires ( simuler les lignes geographiques)*}
            backgroundPosition: "0 0",
            opacity: 0.5,
          }}
        ></div>
        {/* ////////////////////ÉLÉMENTS FLUES (BLUR/SHADOW)\\\\\\\\\\\\\\\\\\\\  */}
        {/* Ces éléments sont en z-0 derrière le contenu et font partie du background */}
        {/* Élément Ellipe coté gauche top - en haut à gauche */}
        <img
          src={Ellipse}
          alt=""
          className="pointer-events-none absolute top-0 left-0 z-0 h-64 w-64"
          style={{ mixBlendMode: "screen" }}
        />
        {/* Élément shadow droite un peu milieu - en haut à droite */}
        <img
          src={shadow}
          alt=""
          className="pointer-events-none absolute top-20 right-0 z-0 h-147 w-265"
          style={{ mixBlendMode: "screen" }}
        />
        {/* Élément shadoz aussi mais celui du coté gauche bas - en bas à gauche */}
        <img
          src={vectorbas}
          alt=""
          className="pointer-events-none absolute top-5/6 left-0 z-0 h-147 w-265"
          style={{ mixBlendMode: "screen" }}
        />
        {/* Contenu de toutes les sections ; la hero section puis les cartes de enzo  */}
        <div className="relative z-10">
          <header className="sticky top-0 z-50 h-20 w-full px-10">
            <Navbar />
          </header>

          {/* Section Hero */}

          <section className="border-primaryBlue bg-primaryBlue/10 mx-10 my-20 gap-5 rounded-xl border-3 p-5 md:mx-20 md:my-50 md:w-2/3">
            <h1 className="text-primaryWhite mb-4 text-5xl md:text-6xl">
              RSVQA ?
            </h1>
            <p className="text-primaryWhite text-2xl md:text-3xl">
              Decouvrir Remote Sensing Visual Question Answering
            </p>
          </section>

          {/* Section Cards */}

          <section className="mx-10 my-20 flex flex-col justify-center gap-5 rounded-xl p-5 md:mx-20 md:my-40 md:flex-row-reverse md:gap-10">
            <div className="flex flex-row gap-2 md:flex-col md:gap-10">
              <Card
                className="w-64 md:w-80 lg:w-100"
                title="Modele RSVQA"
                text="Le modèle RSVQA (Remote Sensing Visual Question Answering) combine vision par ordinateur et traitement du langage naturel pour répondre à des questions sur des images satellitaires. Il analyse conjointement l'image et la question posée afin d'en extraire automatiquement les informations pertinentes, rendant les données de télédétection accessibles sans expertise technique particulière..."
                onButtonClick={() =>
                  docsRef.current?.scrollIntoView({ behavior: "smooth" })
                }
              />
              <Card
                className="w-64 md:w-80 lg:w-100"
                title="Datasets "
                text="Les datasets RSVQA sont des jeux de données composés d'images satellitaires associées à des paires de questions et réponses annotées, utilisés pour entraîner et évaluer les modèles. "
                onButtonClick={() =>
                  docsRef.current?.scrollIntoView({ behavior: "smooth" })
                }
              />
            </div>
            <Card
              className="w-full sm:w-130 lg:w-100"
              title="Remote sensing Visual Question Answering"
              text="La Remote Sensing Visual Question Answering (RSVQA) est une approche innovante permettant d'interroger des images satellitaires en langage naturel. Elle combine les avancées récentes en vision par ordinateur et en traitement automatique du langage pour offrir un accès intuitif aux données de télédétection. Contrairement aux méthodes classiques limitées à une tâche précise, la RSVQA propose une interface générique capable de répondre à une grande variété de questions sur le contenu des images..."
              onButtonClick={() =>
                docsRef.current?.scrollIntoView({ behavior: "smooth" })
              }
            />
          </section>

          {/*section telecharegement dataset */}

          <section
            id="datasets"
            className="mx-10 my-20 rounded-xl p-5 md:mx-20 md:my-40"
          >
            <h2 className="text-primaryWhite mb-4 text-3xl md:text-4xl">
              Telecharger les Datasets
            </h2>
            <div className="mx-auto mt-20 flex max-w-2/3 flex-col gap-4 md:flex-row md:justify-center md:gap-20">
              {datasets.map((dataset, index) => (
                <DatasetsDownload
                  key={index}
                  label={dataset.label}
                  img={dataset.img}
                  file={dataset.file}
                />
              ))}
            </div>
          </section>

          <section
            id="Docs"
            ref={docsRef}
            className="mx-10 my-20 rounded-xl p-5 md:mx-20 md:my-40"
          >
            <h2 className="text-primaryWhite mb-4 text-3xl md:text-4xl">
              Document RSVQA
            </h2>
            <div>
              <DocumentRSVQA
                titre="RSVQA meets BigEarthNet: a new, large-scale, visual question answering dataset
                for remote sensing,"
                text="Sylvain Lobry, Begüm Demir, Devis Tuia,
                International Geoscience and Remote Sensing Symposium (IGARSS) 2021."
                lien="https://rsvqa.sylvainlobry.com/IGARSS21.pdf"
                path={Doc1}
              />
              <DocumentRSVQA
                titre="RSVQA: Visual Question Answering for Remote Sensing Data,"
                text="Sylvain Lobry, Diego Marcos, Jesse Murray, Devis Tuia,
                IEEE Transactions on Geoscience and Remote Sensing, 2020."
                lien="https://arxiv.org/abs/2003.07333"
                path={Doc2}
              />
              <DocumentRSVQA
                titre="Visual Question Answering from Remote Sensing Images,"
                text="Sylvain Lobry, Jesse Murray, Diego Marcos, Devis Tuia,
                International Geoscience and Remote Sensing Symposium (IGARSS) 2019."
                lien="https://ieeexplore.ieee.org/abstract/document/8898891"
                path={Doc3}
              />
            </div>
          </section>

          {/* Toutes choses mise ici serait automatiquement sur le même background */}
        </div>
      </div>

      {/* Section RSVQA */}

      <section>
        <Footer />
      </section>
    </div>
  );
};

export default Documentation;
