import { useState } from "react";
import ImageSlot from "../componants/ImageSlot";
import Navbar from "../componants/Navbar";
import Footer from "../componants/Footer";
import Chat from "../componants/Chat";
import grid from "../assets/grids.png";
import Ellipse from "../assets/Ellipse.png";
import shadow from "../assets/shadow.png";
import vectorbas from "../assets/VectorBas.png";
import ImagesGrid from "../componants/ImagesGrid";
import ImagesSection from "../componants/ImagesSection";

const Demonstrateur = () => {
  const [imageActive, setImageActive] = useState(null); // image confirmée pour le chat
  const [imageSlot, setImageSlot] = useState(null); // image dans le slot (prévisualisation)

  return (
    <div className="">
      {/* Navbar*/}

      <div className="relative overflow-hidden bg-[#141A2E]">
        <div className="absolute inset-0 z-0 bg-black/20"></div>
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${grid})`,
            backgroundRepeat: "repeat",
            backgroundSize: "800px 800px",
            backgroundPosition: "0 0",
            opacity: 0.5,
          }}
        ></div>
        <img
          src={Ellipse}
          alt=""
          className="pointer-events-none absolute top-0 left-0 z-0 h-64 w-64"
          style={{ mixBlendMode: "screen" }}
        />
        <img
          src={shadow}
          alt=""
          className="pointer-events-none absolute top-20 right-0 z-0 h-147 w-265"
          style={{ mixBlendMode: "screen" }}
        />
        <img
          src={vectorbas}
          alt=""
          className="pointer-events-none absolute top-4/5 left-0 z-0 h-147 w-265"
          style={{ mixBlendMode: "screen" }}
        />

        <div className="relative z-10">
          <header className="relative z-50 h-16 w-full px-10 py-5">
            <Navbar />
          </header>

          <section className="mx-10 mt-5 flex items-center justify-center gap-5 px-6 pt-28 pb-20">
            <ImagesSection
              onImageSelectee={(url, id, datasetId) =>
                setImageSlot({ url, id, datasetId })
              } // l'image selectionnée va dans le slot
            />
          </section>

          {/* Slot entre imageSection et chat */}
          <div className="flex w-full flex-row justify-center gap-4">
            {" "}
            {/* centré */}
            <ImageSlot
              imageUrl={imageSlot?.url}
              imageId={imageSlot?.id}
              isSelected={
                imageActive?.id === imageSlot?.id && imageSlot !== null
              }
              onSelect={(url, id) =>
                setImageActive({
                  url,
                  id,
                  datasetId: imageSlot?.datasetId,
                  t: Date.now(),
                })
              }
            />
            {/* Recupere l'url et l'id de l'image pour pouvoir l'afficher */}
          </div>

          <section className="flex flex-col items-center px-10 pt-28 pb-20">
            {/* Titre de la page Demonstrateur */}
            <h1 className="mb-2 text-center text-4xl font-bold text-[#4DA3FF] md:text-5xl">
              Démonstrateur et Datasets
            </h1>
            <p className="text-primaryWhite/60 mb-10 text-center text-sm">
              Poser une question en anglais en chargeant une image
            </p>

            <Chat imageExterne={imageActive} />
          </section>
        </div>
      </div>

      {/* Footer*/}
      <Footer />
    </div>
  );
};

export default Demonstrateur;
