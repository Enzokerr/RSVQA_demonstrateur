/*
Composant slot d'image se trouvant dans la page Demonstrateur.
*/


import React, { useState } from "react";
import TifImage from "./TifImage";





const ImageSlot = ({ imageId, imageUrl, onSelect, isSelected }) => {
  const [hovered, setHovered] = useState(false);

  const handleSelect = () => {  // se lance quand on select une image.
    if (onSelect && imageUrl) onSelect(imageUrl, imageId);
  };

  return (
    <div
      className={`relative flex flex-col rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer group
        ${isSelected
          ? "border-[#4DA3FF] shadow-[0_0_18px_2px_rgba(77,163,255,0.45)]"
          : "border-[#3B76F7]/40 hover:border-[#4DA3FF]/70"}
        bg-[#141A2E]/70 backdrop-blur-sm`}
      style={{ width: "280px", minWidth: "260px" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Badge ID */}
      {imageId && (
        <div className="absolute top-2 left-2 z-10 rounded-md bg-[#142F9F]/80 border border-[#3B76F7]/60 px-2 py-0.5 text-xs font-bold text-[#4DA3FF] backdrop-blur-sm">
          #{imageId}
        </div>
      )}

      {/* Badge Actif */}
      {isSelected && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-md bg-[#4DA3FF]/20 border border-[#4DA3FF]/60 px-2 py-0.5 text-xs font-semibold text-[#4DA3FF] backdrop-blur-sm">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#4DA3FF] animate-pulse" />
          Actif
        </div>
      )}

      {/* Zone image */}
      <div className="relative w-full overflow-hidden" style={{ height: "240px" }}>
          <TifImage
        url={imageUrl}
        className="w-full h-full object-cover"
        style={{ display: "block" }}
      />

        {/* Overlay hover */}
        <div className={`absolute inset-0 bg-[#142F9F]/40 transition-opacity duration-200
          ${hovered ? "opacity-100" : "opacity-0"}`}
        />
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-2 p-2">
        <p className="text-xs text-white/50 truncate text-center font-mono">
          {imageUrl ? `image #${imageId}` : "Aucune image"}
        </p>
        <button
          onClick={handleSelect}
          disabled={!imageUrl}
          className={`w-full rounded-lg py-1.5 text-xs font-semibold border transition-all duration-200
            ${!imageUrl
              ? "border-white/10 bg-white/5 text-white/20 cursor-not-allowed"
              : isSelected
                ? "border-[#4DA3FF] bg-[#4DA3FF]/20 text-[#4DA3FF] hover:bg-[#4DA3FF]/80 hover:text-white hover:shadow-lg hover:shadow-[#4DA3FF]/30 hover:scale-105 active:scale-95"
                : "border-[#3B76F7] bg-[#142F9F]/60 text-white hover:bg-[#4DA3FF]/80 hover:shadow-lg hover:shadow-[#4DA3FF]/30 hover:scale-105 active:scale-95"
            }`}
        >
          {isSelected ? "✓ Dans le Chat" : "Envoyer dans le Chat"}
        </button>
      </div>
    </div>
  );
};

export default ImageSlot;