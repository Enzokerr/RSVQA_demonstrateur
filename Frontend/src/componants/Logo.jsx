import React from "react";
import image from "../assets/Logo.png";

const Logo = () => {
  return (
    <div className="flex items-center justify-center">
      <img src={image} alt="Logo" className="w-20 md:w-24 lg:w-32" />
    </div>
  );
};

export default Logo;
