import React from "react";

const DocumentRSVQA = ({ path, lien, text, titre }) => {
  return (
    <div className="bg-primaryBlue/70 my-5 flex transform rounded-2xl p-5 duration-200 hover:scale-105 hover:shadow-lg md:mx-20">
      <div className="max-w-1/4 p-3 lg:max-w-1/6">
        <img src={path} alt="" />
      </div>
      <div className="my-auto flex flex-col p-3 lg:p-6">
        <div>
          <h2 className="text-xl font-bold">{titre}</h2>
          <p>{text}</p>
        </div>
        <div>
          <a href={lien} className="text-xl font-bold underline">
            pre-print
          </a>
        </div>
      </div>
    </div>
  );
};

export default DocumentRSVQA;
