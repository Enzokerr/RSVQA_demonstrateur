import React, { useState } from "react";
import Logo from "./Logo";
import emailjs from "@emailjs/browser";
const Footer = () => {
  const [feedback, setFeedback] = useState("");

  const handleSendFeedback = async () => {
    if (feedback.trim() === "") {
      alert("Veuillez entrer votre retour avant de l'envoyer.");
      return;
    }

    await emailjs.send(
      "service_dpmo3tb",
      "template_rmwizyk",
      {
        message: feedback,
      },
      "532XfxwXPFW2ABtVs",
    );
    setFeedback("");
    alert("Merci pour votre retour !");

    return;
  };

  return (
    <div className="bg-primaryDarkBlue h-full w-full px-10 pb-5 md:px-20">
      <div className="flex flex-col flex-wrap text-center md:flex-row md:justify-between md:align-middle">
        <div className="my-5">
          <a href="/">
            <Logo />
          </a>

          <p className="w-full text-xs text-gray-500 text-shadow-md md:w-64 md:text-sm">
            Interrogez la Terre depuis l'espace — un pixel à la fois
          </p>
        </div>
        <div className="my-5 flex flex-col gap-5 md:my-15">
          <h4 className="text-sm"></h4>
          <ul className="text-primaryWhite flex flex-col gap-3">
            <li className="hover:decoration-primaryWhite underline decoration-transparent underline-offset-2 transition-all hover:underline-offset-4">
              <a href="#">À propos</a>
            </li>
            <li className="hover:decoration-primaryWhite underline decoration-transparent underline-offset-2 transition-all hover:underline-offset-4">
              <a href="/demonstrateur">Fonctionnalités</a>
            </li>
            <li className="hover:decoration-primaryWhite underline decoration-transparent underline-offset-2 transition-all hover:underline-offset-4">
              <a href="#">Réalisations</a>
            </li>
            <li className="hover:decoration-primaryWhite underline decoration-transparent underline-offset-2 transition-all hover:underline-offset-4">
              <a href="#">Carrières</a>
            </li>
          </ul>
        </div>

        <div className="my-10 flex flex-col gap-8 md:my-20">
          <h4 className="text-sm font-bold text-gray-500">HELP</h4>
          <ul className="text-primaryWhite flex flex-col gap-3">
            <li className="hover:decoration-primaryWhite underline decoration-transparent underline-offset-2 transition-all hover:underline-offset-4">
              <a href="#">Conditions générales d'utilisation</a>
            </li>
            <li className="hover:decoration-primaryWhite underline decoration-transparent underline-offset-2 transition-all hover:underline-offset-4">
              <a href="#">Politique de confidentialité</a>
            </li>
          </ul>
        </div>
        <div className="my-10 flex flex-col gap-5 md:my-20">
          <h4 className="text-sm font-bold text-gray-500">Avis</h4>
          <div className="flex flex-col items-center gap-2">
            <input
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              type="text"
              placeholder="Votre retour"
              className="border-primaryWhite bg-primaryWhite text-primaryBlack placeholder:text-primaryGray w-3/4 rounded-md border p-2 md:w-full lg:w-64"
            />
            <button
              onClick={handleSendFeedback}
              className="bg-primaryBlue text-primaryWhite hover:shadow-primaryBlue/40 w-3/4 cursor-pointer rounded-md px-4 py-2 transition-colors hover:shadow-lg md:w-full lg:w-64"
            >
              Envoyer
            </button>
          </div>
        </div>
      </div>
      <div className="text-primaryWhite">
        <hr className="mx-auto w-full text-center"></hr>
        <p className="my-5 text-center text-sm">
          &copy; Copyright 2026, All Rights Reserved by QIA
        </p>
      </div>
    </div>
  );
};

export default Footer;
