import React from "react";
import { useNavigate } from "react-router-dom";
import { IoFastFoodOutline } from "react-icons/io5";
import { FaHome } from "react-icons/fa";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fff9f6] flex flex-col items-center justify-center p-6 text-center">
      {/* Animated Illustration Area */}
      <div className="relative mb-8">
        <h1 className="text-[120px] md:text-[180px] font-black text-orange-100 leading-none select-none">
          404
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <IoFastFoodOutline 
            className="text-[80px] md:text-[120px] text-[#ff4d2d] animate-bounce" 
          />
        </div>
      </div>

      {/* Text Content */}
      <div className="max-w-md space-y-4">
        <h2 className="text-2xl md:text-3xl font-black text-gray-800 uppercase tracking-tight">
          Oops! Page Not Found
        </h2>
        <p className="text-gray-500 font-medium">
          Seems like the food you're looking for was so delicious, someone already ate it (or the link is broken)!
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-md">
        <button
          onClick={() => navigate("/")}
          className="flex-1 flex items-center justify-center gap-2 bg-[#ff4d2d] text-white py-4 px-6 rounded-2xl font-bold shadow-lg shadow-[#ff4d2d]/30 hover:bg-[#e64526] hover:-translate-y-1 transition-all active:scale-95"
        >
          <FaHome size={20} />
          Back to Home
        </button>
        
        <button
          onClick={() => navigate(-1)}
          className="flex-1 py-4 px-6 rounded-2xl font-bold text-gray-600 border-2 border-gray-200 hover:bg-white hover:border-gray-300 transition-all active:scale-95"
        >
          Go Back
        </button>
      </div>

      {/* Decorative Circles (Background) */}
      <div className="fixed top-20 left-10 w-20 h-20 bg-orange-100 rounded-full blur-2xl -z-10 animate-pulse" />
      <div className="fixed bottom-20 right-10 w-32 h-32 bg-orange-100 rounded-full blur-3xl -z-10 animate-pulse delay-700" />
    </div>
  );
};

export default NotFound;