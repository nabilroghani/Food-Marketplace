import React from "react";

const CategoryCard = ({ name, image, onClick, isActive }) => {
  return (
    <div
      className={`
        /* Desktop: 180px | Mobile: 110px */
        w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] md:w-[180px] md:h-[180px] 
        rounded-2xl border-2 shrink-0 overflow-hidden bg-white shadow-xl shadow-gray-200 
        hover:shadow-lg transition-all duration-300 relative cursor-pointer
        ${isActive ? "border-[#ff4d2d] scale-95" : "border-transparent"}
      `}
      onClick={onClick}
    >
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
      />
      <div
        className={`absolute bottom-0 w-full left-0 px-2 py-1 sm:px-3 md:py-1 rounded-t-xl text-center shadow text-[10px] sm:text-xs md:text-sm font-bold backdrop-blur
        ${isActive ? "bg-[#ff4d2d] text-white" : "bg-[#ffffff96] text-gray-800"}`}
      >
        {name}
      </div>
    </div>
  );
};

export default CategoryCard;
