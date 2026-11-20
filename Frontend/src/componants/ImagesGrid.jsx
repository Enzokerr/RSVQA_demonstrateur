import React, { useState, useEffect, useRef, useCallback } from "react";
import UTIF from "utif";
import { BASE_URL } from "./config";

function TifImage({ url }) {
  const [src, setSrc] = useState(null);
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    setSrc(null);
    setErreur(false);

    const controller = new AbortController();

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.arrayBuffer();
      })
      .then((buffer) => {
        const ifds = UTIF.decode(buffer);
        if (!ifds || ifds.length === 0) throw new Error("TIF invalide");
        UTIF.decodeImage(buffer, ifds[0]);
        const rgba = UTIF.toRGBA8(ifds[0]);
        if (!ifds[0].width || !ifds[0].height)
          throw new Error("Dimensions invalides");
        const canvas = document.createElement("canvas");
        canvas.width = ifds[0].width;
        canvas.height = ifds[0].height;
        const ctx = canvas.getContext("2d");
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        imageData.data.set(rgba);
        ctx.putImageData(imageData, 0, 0);
        setSrc(canvas.toDataURL());
      })
      .catch((e) => {
        if (e.name !== "AbortError") setErreur(true);
      });

    return () => controller.abort();
  }, [url]);

  if (erreur)
    return (
      <div className="bg-primaryDarkBlue/60 flex h-full w-full items-center justify-center">
        <span className="text-primaryGray text-xs">Erreur</span>
      </div>
    );

  return src ? (
    <img src={src} alt="" className="h-full w-full object-cover" />
  ) : (
    <div className="bg-primaryDarkBlue/60 h-full w-full animate-pulse" />
  );
}

const ImagesGrid = ({ datasetId, split, onImageSelectee }) => {
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fini, setFini] = useState(false);
  const sentinelleRef = useRef(null);

  // ── Clé de contexte pour éviter les doublons ───────────────────────────
  // On stocke le datasetId+split actif au moment du fetch
  // pour ignorer les réponses d'un fetch obsolète
  const contexteRef = useRef(`${datasetId}-${split}`);

  // ── Réinitialisation quand dataset ou split change ──────────────────────
  useEffect(() => {
    contexteRef.current = `${datasetId}-${split}`;
    setImages([]);
    setPage(0);
    setFini(false);
    setLoading(false);
  }, [datasetId, split]);

  // ── Chargement d'une page ───────────────────────────────────────────────
  useEffect(() => {
    if (datasetId === null || datasetId === undefined) return;
    if (fini) return;
    if (loading) return;

    const contexteAuLancement = `${datasetId}-${split}`;

    setLoading(true);

    fetch(
      `${BASE_URL}/images?dataset_id=${datasetId}&split=${split}&page=${page}`,
    )
      .then((res) => res.json())
      .then((data) => {
        // On ignore la réponse si le contexte a changé entre temps
        if (contexteRef.current !== contexteAuLancement) return;

        if (!Array.isArray(data) || data.length === 0) {
          setFini(true);
        } else {
          // On déduplique par id pour éviter les doublons en StrictMode
          setImages((prev) => {
            const idsExistants = new Set(prev.map((img) => img.id));
            const nouvelles = data.filter((img) => !idsExistants.has(img.id));
            return [...prev, ...nouvelles];
          });
        }
        setLoading(false);
      })
      .catch(() => {
        if (contexteRef.current === contexteAuLancement) setLoading(false);
      });
  }, [page, datasetId, split]);

  // ── IntersectionObserver ────────────────────────────────────────────────
  const observerCallback = useCallback(
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !loading && !fini) {
        setPage((prev) => prev + 1);
      }
    },
    [loading, fini],
  );

  useEffect(() => {
    const sentinelle = sentinelleRef.current;
    if (!sentinelle) return;
    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
    });
    observer.observe(sentinelle);
    return () => observer.disconnect();
  }, [observerCallback]);

  return (
    <>
      <style>{`
        .scroll-custom::-webkit-scrollbar { width: 6px; }
        .scroll-custom::-webkit-scrollbar-track { background: rgba(31, 42, 68, 0.3); border-radius: 999px; }
        .scroll-custom::-webkit-scrollbar-thumb { background: rgba(77, 163, 255, 0.4); border-radius: 999px; }
        .scroll-custom::-webkit-scrollbar-thumb:hover { background: rgba(77, 163, 255, 0.7); }
      `}</style>

      <div
        className="scroll-custom max-h-125 overflow-y-auto pr-2"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(77, 163, 255, 0.4) rgba(31, 42, 68, 0.3)",
        }}
      >
        <div className="grid grid-cols-3 gap-3">
          {images.map((img) => (
            <div
              key={`${datasetId}-${split}-${img.id}`} // ← clé unique
              onClick={() =>
                onImageSelectee &&
                onImageSelectee(`${BASE_URL}${img.URL}`, img.id, datasetId)
              } // je met dans la variable que je passes a ImagesSection :img.URL img.id datasetId
              className="border-primaryDarkBlue hover:border-primaryBlue/60 hover:shadow-primaryBlue/20 bg-primaryDarkBlue aspect-square cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-200 hover:shadow-lg"
            >
              <TifImage url={`${BASE_URL}${img.URL}`} />
            </div>
          ))}
        </div>

        {!fini && <div ref={sentinelleRef} className="h-4 w-full" />}

        {loading && (
          <div className="flex justify-center py-4">
            <div className="border-primaryBlue h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
          </div>
        )}

        {fini && images.length > 0 && (
          <p className="text-primaryGray py-4 text-center text-sm">
            Toutes les images sont chargées
          </p>
        )}

        {fini && images.length === 0 && (
          <p className="text-primaryGray py-4 text-center text-sm">
            Aucune image disponible pour ce split
          </p>
        )}
      </div>
    </>
  );
};

export default ImagesGrid;
