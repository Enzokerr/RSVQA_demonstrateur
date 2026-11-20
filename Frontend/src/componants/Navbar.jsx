// ============================================================
// Navbar.jsx — Barre de navigation RSVQA
// Layout : Logo à gauche | Liens centrés qui prennent tout l'espace
// Fond totalement transparent avec léger flou
// ============================================================

import { useState } from "react";
import Logo from "./Logo";
import { useLocation } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

// les navlink sont les liens vers d'autres pages du projet au lieu d'ecrir 5 fois une balise a on remplace le tout par un tableau d'objets

const NAV_LINKS = [
  //label = text affichée , href le liens ou le path , active = booleen qui indique dans quelle page on est
  { label: "Accueil", href: "/" },
  { label: "Datasets", href: "/documentation#datasets" },
  { label: "Demonstrateur", href: "/demonstrateur" },
  { label: "Documentation", href: "/documentation" },
];

// declaraction du composant Navbar (creation du composant react)
const Navbar = () => {
  //creation d'une variable d'etat du menue de la bare de navigation
  // creation de la fonction de modification de cet etat setMenuOpen
  //useState(false) indique la valeur par defaut de la variable
  // le mot clé const sert a dire ma fonction et ma variable ne vont pas etre reasignée a autre choses
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  // toute la partie apres le return conserne ce qui va etre affichée
  return (
    <nav className="top-0 z-50 bg-transparent">
      {/*
      le contenue de className continet le tailwind 
     
      fixed = position fixe
      top-0 = collée en haut
      bg-transparent = fond transparent 
      backdrop-blur-sm = flou en erriere plan
    */}

      {/* 
        relative sur ce conteneur permet de positionner les enfants en absolu à l'intérieur.
        h-16 fixe la hauteur de la navbar.
        w-full prend toute la largeur du parent 

        flex on utilise flexe box pour aligner les elements du tableau de la nav bar 
        items-center c'est pour centrer les enfants 
      */}
      <div className="flex w-full items-center">
        {/* ---- LOGO — positionné à gauche en absolu ---- */}
        {/* `absolute left-8` : collé à gauche, indépendant du centrage des liens */}
        <div className="flex w-full justify-between lg:justify-start lg:px-10">
          <div>
            <a href="/">
              <Logo />
            </a>
          </div>

          {/* ---- LIENS — centrés sur toute la largeur ---- */}
          {/*
          `w-full flex justify-center` : prend toute la largeur et centre les liens.
          Les liens sont donc vraiment au milieu de l'écran, peu importe la taille.
        */}
          <div className="mx-auto flex items-center">
            <ul className="hidden w-full items-center gap-20 lg:flex">
              {/*
          items-center 
          gap c'est le vide entre les element de la liste 
          md : flex = a partir d'un ecran moyen , la barre deviens flex (md=moyen) 
          w-full le ul prend toute la largeur possible 
          justify-center les enfant sont centrés horizontalement 
          items-center les enfants sonr centrées verticalement 
          */}
              {
                // creation d'une boucle (map) qui pour chaque lien(link) cree un li
                NAV_LINKS.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <li key={link.href}>
                      <HashLink
                        to={link.href}
                        /*
                application d'un style commun a touts les boutons 
                text taille du text
                font largeur de la police
                rounded l'arondi du a
                */
                        // creation d'une condition si le lien est actif application d'un style particulier
                        //condition ? vrai : faux

                        className={`rounded-md px-4 py-2.5 text-lg font-medium transition-colors duration-200 xl:text-xl ${
                          isActive
                            ? "border-primaryBlue text-primaryBlue bg-primaryDarkBlue/60 border"
                            : "text-primaryBlue/70 hover:text-primaryWhite hover:bg-primaryWhite/5"
                        } `}
                      >
                        {link.label}
                        {/* c'est le text du lien contenue dans la partie label du tableau de navigation*/}
                      </HashLink>
                    </li>
                  );
                })
              }
            </ul>
          </div>
        </div>

        {/* ---- BOUTON HAMBURGER — mobile uniquement ---- */}
        <button
          className="text-primaryBlue absolute right-8 rounded-lg p-2 transition hover:bg-white/10 lg:hidden"
          /*
          md : hidden ---> cachée quand la taille de l'ecran est moyenne ou plus 
          absolute right-8 ----> placement du bouton a droite de l'ecran
          ronded-lg  coins arrondis 
          transition --->transition fluide 
          */

          //partie interaction avec le bouton
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Ouvrir le menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* ---- MENU MOBILE ---- */}
      {menuOpen && (
        <div className="relative z-50 rounded-2xl border-t border-white/10 bg-blue-950/90 px-6 py-4 backdrop-blur-md lg:hidden">
          <ul className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <HashLink
                  to={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    link.active
                      ? "border-primaryBlue text-primaryBlue bg-primaryDarkBlue/60 border"
                      : "text-primaryBlue/70 hover:bg-white/5 hover:text-white"
                  } `}
                >
                  {link.label}
                </HashLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
