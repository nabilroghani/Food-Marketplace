import React, { useState } from "react";
import { FaLeaf } from "react-icons/fa";
import { FaDrumstickBite } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa";
import { FaMinus } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/userSlice.js";

const FoodCard = ({ data }) => {
  const [quantity, setQuantity] = useState(0);
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.user);
  const isUnavailable = data.isAvailable === false;
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <FaStar className="text-yellow-500 text-lg" />
        ) : (
          <FaRegStar className="text-yellow-500 text-lg" />
        )
      );
    }
    return stars;
  };

  const handleIncrease = () => {
    if (isUnavailable) return;
    setQuantity(quantity + 1);
  };

  const handleDecrease = () => {
    if (isUnavailable) return;
    if (quantity > 0) {
      setQuantity(quantity - 1);
    }
  };
  return (
    <div
      className={`w-full min-w-0 rounded-2xl border-2 border-[#ff4d2d] bg-white shadow-md overflow-hidden
     hover:shadow-xl transition-all duration-300 flex flex-col
     ${isUnavailable ? "opacity-75" : ""}`}
    >
      <div className="relative w-full h-32 sm:h-40 md:h-[170px] flex justify-center items-center bg-white">
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white rounded-full p-1 shadow">
          {data.foodType == "veg" ? (
            <FaLeaf className="text-green-600 text-lg" />
          ) : (
            <FaDrumstickBite className="text-red-600 text-lg" />
          )}
        </div>
        {isUnavailable && (
          <div className="absolute left-2 top-2 rounded-full bg-gray-800 px-3 py-1 text-xs font-bold text-white">
            Out of Stock
          </div>
        )}
        <img
          src={data.image}
          alt=""
          className="w-full h-full object-cover transition-transform
        duration-300 hover:scale-105"
        />
      </div>

      <div className="flex-1 flex flex-col p-3 sm:p-4">
        <h1 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
          {data.name}
        </h1>

        <div className="flex items-center gap-1 mt-1 flex-wrap">
          {renderStars(data.rating?.average || 0)}
          <span className="text-xs text-gray-500">
            {data.rating?.count || 0}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 mt-auto p-3">
        <span className="font-bold text-gray-900 text-base sm:text-lg">{data.price}</span>
        <div className="flex items-center border rounded-full overflow-hidden shadow-sm max-w-full">
          <button
            className="px-2 py-1.5 hover:bg-gray-100 transition disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleDecrease}
            disabled={isUnavailable}
          >
            <FaMinus size={12} />
          </button>
          <span className="min-w-6 text-center text-sm">{quantity}</span>
          <button
            className="px-2 py-1.5 hover:bg-gray-100 transition disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleIncrease}
            disabled={isUnavailable}
          >
            <FaPlus size={12} />
          </button>
          <button
            className={`${
              cartItems.some((i) => i.id == data._id)
                ? "bg-gray-800"
                : "bg-[#ff4d2d]"
            } text-white px-3 py-2 transition-colors disabled:cursor-not-allowed disabled:bg-gray-400`}
            disabled={isUnavailable}
            onClick={() => {
              if (isUnavailable) return;
              quantity > 0
                ? dispatch(
                    addToCart({
                      id: data._id,
                      name: data.name,
                      price: data.price,
                      image: data.image,
                      shop: data.shop?._id ? data.shop._id : data.shop,
                      quantity: quantity || 1,
                      foodType: data.foodType,
                    })
                  )
                : null;
            }}
          >
            <FaShoppingCart />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
