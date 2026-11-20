import React from "react";

const Button = ({
  // Le composant botton qui serait utilise plustard
  children, // nom reserve par react pour ce qui est entre balise qui serait le contenu de notre boutton
  href, // Pour lier au lien
  variant = "primary", //Style == colors
  size = "md", // taille par defaut md qui serait definie
  onClick,
  type = "Button",
  disabled = false, // Pour desactiver le boutton, par defaut il est actif
  fullWidth = false, // Avoir toute la largeur de la page , par defaut fausse
}) => {
  // Styles de base
  const baseStyles =
    "inline-block font-semibold text-center transition-all duration-300 cursor-pointer rounded-[20px]";

  // Tailles
  const sizes = {
    sm: "px-2 py-2 text-sm",

    md: "px-3 py-3 text-base", // padding 6 * 4 px horizontal et 3 * 4 vertical avec text base de taille

    lg: "px-6 py-6 text-3xl",
    //  xl: "px-10 py-5 text-xl" reste a definir if needed
  };

  // Variantes pour les styles et les couleurs
  const variants = {
    primary:
      "bg-[#142F9F]/60 border-2 border-primaryBlue text-primaryWhite hover:bg-primaryBlue/80 hover:shadow-lg hover:shadow-primaryBlue/40 hover:scale-105",
    outline:
      "bg-[#142F9F]/37 border-2 border-primaryBlue text-primaryBlue hover:bg-[#142F9F]  hover:text-primaryBlue hover:shadow-lg hover:scale-105", // C'est pour les bouttons de nav bar reste a ajuster avec la taille
    ghost:
      "bg-transparent text-primaryBlue hover:bg-primaryBlue/10 hover:scale-105",
    danger:
      "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/40 hover:scale-105",
    success:
      "bg-green-600 text-white hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/40 hover:scale-105",
  };

  const widthClass = fullWidth ? "w-full" : "";
  const disabledClass = disabled
    ? "opacity-50 cursor-not-allowed hover:scale-100"
    : "";

  const combinedStyles = `${baseStyles} ${sizes[size]} ${variants[variant]} ${widthClass} ${disabledClass}`;

  // Si c'est un lien
  if (href && !disabled) {
    return (
      <a href={href} className={combinedStyles}>
        {children}
      </a>
    );
  }

  // Sinon c'est un bouton
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedStyles}
    >
      {children}
    </button>
  );
};

export default Button;
