import React, { useEffect, useState } from "react";
import ImagesGrid from "./ImagesGrid";
import { BASE_URL } from "./config";

const SPLITS = [
  { id: "train", label: "Train" },
  { id: "val", label: "Validation" },
  { id: "test", label: "Test" },
];

function ModalAjoutDataset({ onFermer, onDatasetAjoute }) {
  const [fichier, setFichier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [succes, setSucces] = useState(null);

  const handleUpload = async () => {
    if (!fichier) return;
    setLoading(true);
    setErreur(null);
    setSucces(null);
    const formData = new FormData();
    formData.append("fichier", fichier);
    try {
      const res = await fetch(`${BASE_URL}/datasets/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setErreur(data.detail || "Erreur lors de l'upload.");
      } else {
        setSucces(data.message);
        onDatasetAjoute(data.dataset);
      }
    } catch {
      setErreur("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onFermer}
    >
      <div
        className="relative flex w-full max-w-lg flex-col gap-5 rounded-2xl p-6"
        style={{
          background: "rgba(31, 42, 68, 0.97)",
          border: "1px solid rgba(77, 163, 255, 0.25)",
          backdropFilter: "blur(16px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-primaryWhite text-lg font-bold">
            Ajouter un dataset
          </h2>
          <button
            onClick={onFermer}
            className="text-primaryGray hover:text-primaryWhite text-xl font-light transition-colors"
          >
            ✕
          </button>
        </div>

        <div
          className="rounded-xl p-4 text-sm"
          style={{
            background: "rgba(77, 163, 255, 0.08)",
            border: "1px solid rgba(77, 163, 255, 0.2)",
          }}
        >
          <p className="text-primaryBlue mb-2 font-semibold">
            Structure requise du zip :
          </p>
          <pre className="text-primaryGray text-xs leading-relaxed">{`nom_du_dataset/
├── Images/
│   ├── 0.tif
│   ├── 1.tif
│   └── ...
├── PREFIX_split_train_images.json
├── PREFIX_split_val_images.json
├── PREFIX_split_test_images.json
└── all_questions.json`}</pre>
          <p className="text-primaryGray/70 mt-3 text-xs">
            Si un dataset du même nom existe déjà, il sera renommé
            automatiquement.
          </p>
        </div>

        <div
          className="border-primaryDarkBlue hover:border-primaryBlue/50 flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-4 transition-colors"
          onClick={() => document.getElementById("input-zip").click()}
        >
          <span className="text-primaryGray text-3xl">📁</span>
          <p className="text-primaryGray text-center text-sm">
            {fichier ? (
              <span className="text-primaryBlue font-semibold">
                {fichier.name}
              </span>
            ) : (
              "Cliquez pour sélectionner un fichier .zip"
            )}
          </p>
          <input
            id="input-zip"
            type="file"
            accept=".zip"
            className="hidden"
            onChange={(e) => {
              setFichier(e.target.files[0]);
              setErreur(null);
              setSucces(null);
            }}
          />
        </div>

        {erreur && (
          <div
            className="rounded-xl px-4 py-3 text-sm text-red-400"
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
            }}
          >
            ⚠ {erreur}
          </div>
        )}
        {succes && (
          <div
            className="rounded-xl px-4 py-3 text-sm text-green-400"
            style={{
              background: "rgba(34, 197, 94, 0.1)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
            }}
          >
            ✓ {succes}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onFermer}
            className="text-primaryGray border-primaryDarkBlue hover:border-primaryBlue/50 rounded-xl border px-4 py-2 text-sm transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleUpload}
            disabled={!fichier || loading}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${!fichier || loading ? "bg-primaryDarkBlue text-primaryGray cursor-not-allowed" : "bg-primaryBlue text-white hover:brightness-110"}`}
          >
            {loading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {loading ? "Upload en cours..." : "Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );
}

const ImagesSection = ({ onImageSelectee }) => {
  //onImageSelect contient l'url de l'image id du dataset et de l'image

  // Liste complète des datasets retournés par GET /datasets
  // Chaque dataset contient : { id, name, metadata, images[] }
  const [datasets, setDatasets] = useState([]);

  // Id du dataset actuellement sélectionné par l'utilisateur.
  // null = aucun sélectionné (état initial pendant le chargement)
  const [selectedDatasetId, setSelectedDatasetId] = useState(null);

  // Split actuellement sélectionné : "train", "val" ou "test"
  // Par défaut on charge le split train au démarrage
  const [splitActif, setSplitActif] = useState("train");

  const [modalOuvert, setModalOuvert] = useState(false);

  useEffect(() => {
    fetch(`${BASE_URL}/datasets`)
      .then((res) => res.json())
      .then((data) => {
        setDatasets(data);
        if (data.length > 0) setSelectedDatasetId(data[0].id);
      });
  }, []);

  const handleDatasetAjoute = (nouveauDataset) => {
    setDatasets((prev) => [...prev, nouveauDataset]);
    setSelectedDatasetId(nouveauDataset.id);
    setSplitActif("train");
    setModalOuvert(false);
  };

  const datasetActif = datasets.find((d) => d.id === selectedDatasetId);

  return (
    <>
      {modalOuvert && (
        <ModalAjoutDataset
          onFermer={() => setModalOuvert(false)}
          onDatasetAjoute={handleDatasetAjoute}
        />
      )}

      {/* items-stretch → les deux colonnes prennent la hauteur du plus grand */}
      <div className="flex w-full max-w-6xl items-stretch gap-6">
        {/* ══ COLONNE GAUCHE ══
            Largeur fixe qui rétrécit par paliers selon la taille d'écran */}
        <div
          className="flex w-24 shrink-0 flex-col gap-3 rounded-2xl p-4 sm:w-44 md:w-56 lg:w-72"
          style={{
            background: "rgba(31, 42, 68, 0.55)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(77, 163, 255, 0.15)",
          }}
        >
          <p className="text-primaryGray shrink-0 px-1 text-xs font-semibold tracking-widest uppercase">
            Datasets disponibles
          </p>

          <div
            className="scroll-custom flex flex-col gap-3 overflow-y-auto pr-1"
            style={{
              flex: "1 1 0",
              minHeight: 0,
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(18, 92, 172, 0.4) transparent",
            }}
          >
            {datasets.map((dataset) => {
              const estActif = selectedDatasetId === dataset.id;
              return (
                <button
                  key={dataset.id}
                  onClick={() => {
                    setSelectedDatasetId(dataset.id);
                    setSplitActif("train");
                  }}
                  className={`relative flex aspect-square w-full shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border-2 transition-all duration-200 ${
                    estActif
                      ? "border-primaryBlue shadow-primaryBlue/30 bg-primaryBlue/20 shadow-lg"
                      : "border-primaryDarkBlue hover:border-primaryBlue/50 bg-primaryDarkBlue/80"
                  }`}
                >
                  {/* Nom centré, avec retour à la ligne si trop long */}
                  <p className="text-primaryWhite wrap-break-words w-full px-2 text-center text-xs leading-snug font-semibold">
                    {dataset.name}
                  </p>

                  {estActif && (
                    <div className="bg-primaryBlue absolute top-0 left-0 h-full w-1 rounded-l-2xl" />
                  )}
                </button>
              );
            })}

            {/* Bouton ajout — même taille carré que les cartes */}
            <button
              onClick={() => setModalOuvert(true)}
              className="border-primaryDarkBlue hover:border-primaryBlue/50 group flex aspect-square w-full shrink-0 items-center justify-center rounded-2xl border-2 border-dashed transition-colors duration-200"
            >
              <span className="text-primaryGray group-hover:text-primaryBlue text-4xl font-light transition-colors duration-200">
                +
              </span>
            </button>
          </div>
        </div>

        {/* ══ COLONNE DROITE ══ */}
        <div
          className="flex min-w-0 flex-1 flex-col gap-5 rounded-2xl p-5"
          style={{
            background: "rgba(31, 42, 68, 0.55)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(77, 163, 255, 0.15)",
          }}
        >
          <div className="bg-primaryBlue/20 border-primaryBlue/30 rounded-2xl border p-5">
            <h1 className="text-primaryWhite mb-3 text-lg font-bold">
              {datasetActif?.name ?? "Chargement..."}
            </h1>

            {datasetActif?.metadata ? (
              <div className="grid grid-cols-2 gap-2">
                <div
                  className="flex flex-col gap-0.5 rounded-xl px-3 py-2"
                  style={{
                    background: "rgba(77, 163, 255, 0.08)",
                    border: "1px solid rgba(77, 163, 255, 0.15)",
                  }}
                >
                  <span className="text-primaryGray text-xs">Images</span>
                  <span className="text-primaryWhite text-sm font-semibold">
                    {datasetActif.metadata.imageCount}
                  </span>
                </div>
                <div
                  className="flex flex-col gap-0.5 rounded-xl px-3 py-2"
                  style={{
                    background: "rgba(77, 163, 255, 0.08)",
                    border: "1px solid rgba(77, 163, 255, 0.15)",
                  }}
                >
                  <span className="text-primaryGray text-xs">Questions</span>
                  <span className="text-primaryWhite text-sm font-semibold">
                    {datasetActif.metadata.questionCount}
                  </span>
                </div>
                <div
                  className="flex flex-col gap-0.5 rounded-xl px-3 py-2"
                  style={{
                    background: "rgba(77, 163, 255, 0.08)",
                    border: "1px solid rgba(77, 163, 255, 0.15)",
                  }}
                >
                  <span className="text-primaryGray text-xs">Taille</span>
                  <span className="text-primaryWhite text-sm font-semibold">
                    {(datasetActif.metadata.size / 1_000_000).toFixed(1)} Mo
                  </span>
                </div>
                <div
                  className="flex flex-col gap-0.5 rounded-xl px-3 py-2"
                  style={{
                    background: "rgba(77, 163, 255, 0.08)",
                    border: "1px solid rgba(77, 163, 255, 0.15)",
                  }}
                >
                  <span className="text-primaryGray text-xs">Modalités</span>
                  <span className="text-primaryWhite text-sm font-semibold">
                    {datasetActif.metadata.modalitiesAvailable?.join(", ") ??
                      "—"}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-primaryGray text-sm">
                Chargement des métadonnées...
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {SPLITS.map((split) => (
              <button
                key={split.id}
                onClick={() => setSplitActif(split.id)}
                className={`min-w-fit flex-1 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  splitActif === split.id
                    ? "bg-primaryBlue border-primaryBlue shadow-primaryBlue/30 text-white shadow-md"
                    : "bg-primaryDarkBlue text-primaryGray border-primaryDarkBlue hover:border-primaryBlue/50 hover:text-primaryWhite"
                }`}
              >
                {split.label}
              </button>
            ))}
          </div>

          <div className="flex-1">
            {selectedDatasetId !== null && (
              <ImagesGrid
                datasetId={selectedDatasetId}
                split={splitActif}
                onImageSelectee={onImageSelectee}
              /> //on recupere l'image selectionnée de ImagesGrid
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ImagesSection;
