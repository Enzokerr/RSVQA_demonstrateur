import React from "react";
import Button from "./Button";
import { Link } from "react-router-dom";

const Card = ({ title, text, onButtonClick, className = "" }) => {
  return (
    <div
      className={
        "bg-primaryBlue/80 shadow-primaryWhite flex flex-col justify-between rounded-lg p-5 text-center shadow-md/70 transition-transform hover:scale-105 " +
        className
      }
    >
      <div>
        <h2 className="text-primaryWhite text-lg md:text-2xl lg:text-4xl">
          {title}
        </h2>
        <p className="text-primaryBlack mb-2 text-xs md:text-sm lg:text-lg">
          {text}
        </p>
      </div>

      {onButtonClick && (
        <Button variant="primary" size="md" onClick={onButtonClick} fullWidth>
          Voir plus &gt;
        </Button>
      )}
    </div>
  );
};

export default Card;
