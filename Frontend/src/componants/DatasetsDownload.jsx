import React from "react";

const DatasetsDownload = ({ label, img, file }) => {
  return (
    <div className="transition-transform duration-300 hover:scale-105">
      <a href={file} download className="group relative">
        <img src={img} alt={label} className="w-full" />
        <p className="text-primaryWhite border-primaryWhite text-md absolute bottom-0 w-full transform rounded-b-xl border-t-2 bg-[#142F9F]/40 p-5 text-center font-semibold opacity-0 duration-300 group-hover:opacity-100 md:text-sm lg:text-lg">
          {label}
        </p>
      </a>
    </div>
  );
};

export default DatasetsDownload;
