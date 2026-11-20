import React from "react";
import Navbar from "../componants/Navbar";
import Footer from "../componants/Footer";
import Cards from "../componants/Cards";
import Button from "../componants/Button";
import grid from "../assets/grids.png";
import Ellipse from "../assets/Ellipse.png";
import shadow from "../assets/shadow.png";
import vectorbas from "../assets/VectorBas.png";

const LandingPage = () => {
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
          className="pointer-events-none absolute top-4/5 left-0 z-0 h-147 w-265"
          style={{ mixBlendMode: "screen" }}
        />
        {/* Contenu de toutes les sections ; la hero section puis les cartes de enzo  */}
        <div className="relative z-10">
          <header className="w-full px-10">
            <Navbar />
          </header>
          <section>
            <div className="border-primaryBlue bg-primaryBlue/10 mx-10 my-20 gap-5 rounded-xl border-3 p-5 md:mx-20 md:mt-40">
              <h1 className="text-primaryWhite text-6xl font-bold">RSVQA</h1>
              <p className="text-primaryWhite mt-4 text-6xl font-bold">
                Explorez vos data, faites travailler votre modele
              </p>
            </div>
            <div className="mx-10 flex justify-end md:mx-20">
              <Button size="lg" href="/demonstrateur">
                Demonstration
              </Button>
              {/*<button className="border-primaryBlue bg-primaryBlue/20 text-primaryWhite hover:bg-primaryBlue/40 cursor-pointer items-end rounded-lg border p-2 text-lg transition-colors md:text-2xl">
                Demonstration
              </button> */}
            </div>
          </section>

          {/* Section Cards */}

          <section>
            <div className="mx-10 my-20 flex flex-col gap-10 md:mx-20 md:my-40">
              <Cards />
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

export default LandingPage;
