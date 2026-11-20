//a ajouter 

import React, { useState, useEffect } from "react";
import UTIF from "utif";

/*
Redefinition de TIF Image grace à l'ia car la bibliothèque React ne fonctionnait pas bien.
*/


const TifImage = React.memo(function TifImage({ url, className, style }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    if (!url) return;
    setSrc(null);
    fetch(url)
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        const ifds = UTIF.decode(buffer);
        UTIF.decodeImage(buffer, ifds[0]);
        const rgba    = UTIF.toRGBA8(ifds[0]);
        const canvas  = document.createElement("canvas");
        canvas.width  = ifds[0].width;
        canvas.height = ifds[0].height;
        const ctx       = canvas.getContext("2d");
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        imageData.data.set(rgba);
        ctx.putImageData(imageData, 0, 0);
        setSrc(canvas.toDataURL());
      })
      .catch(() => setSrc(null));
  }, [url]);

  if (!url) return null;

  return src
    ? <img src={src} alt="image satellite" className={className} style={style} />
    : <div className="animate-pulse bg-primaryDarkBlue/60" style={{ ...(style || {}), height: "200px" }} />;
});

export default TifImage;