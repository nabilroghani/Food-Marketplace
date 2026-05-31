import axios from "axios";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { serverUrl } from "../App.jsx";
import { useEffect } from "react";
import { useState } from "react";
import { FaStore } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { FaUtensils } from "react-icons/fa";
import FoodCard from "../components/FoodCard.jsx";
import { FaArrowLeft } from "react-icons/fa";
import { useSocket } from "../context/SocketContext.jsx";

const Shop = () => {
  const { shopId } = useParams();
  const [items, setItems] = useState([]);
  const [shop, setShop] = useState(null);
  const navigate = useNavigate();
  const socket = useSocket();
  const handleShop = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/item/get-by-shop/${shopId}`,
        { withCredentials: true },
      );
    //   console.log(result.data);
    setShop(result.data.shop);
    setItems(result.data.items);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
      handleShop();
    }, [shopId]);

  useEffect(() => {
    if (!socket || !shopId) return;

    const handleMenuItemStatusUpdate = ({ itemId, isAvailable, shopId: updatedShopId }) => {
      if (String(updatedShopId) !== String(shopId)) return;

      setItems((prev) =>
        prev.map((item) =>
          item._id === itemId ? { ...item, isAvailable } : item,
        ),
      );
    };

    socket.on("menuItemStatusUpdate", handleMenuItemStatusUpdate);

    return () => {
      socket.off("menuItemStatusUpdate", handleMenuItemStatusUpdate);
    };
  }, [socket, shopId]);
  return (
    <div className="min-h-screen w-full bg-gray-50">
        <button className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-2 bg-black/50 hover:bg-black/70 text-white
         px-3 py-2 rounded-full shadow transition" onClick={()=> navigate("/")}>
            <FaArrowLeft/>
            <span className="text-sm sm:text-base">Back</span>
        </button>
        {shop && <div className="relative w-full h-56 sm:h-64 md:h-80 lg:h-96">
            <img src={shop.image} alt="" className="w-full h-full object-cover"/>
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/30 flex flex-col justify-center
             items-center text-center px-4">
                <FaStore className="text-white text-4xl mb-3 drop-shadow-md"/>
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg">{shop.name}</h1>
                <div className="mt-3 flex items-start justify-center gap-[10px] px-2">
                    <FaLocationDot size={20} color="red" className="shrink-0 mt-1"/>
                    <p className="text-sm sm:text-base md:text-lg font-medium text-gray-400">{shop.address}</p>
                </div>
            </div>
            </div>}


            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
                <h2 className="flex items-center justify-center gap-3 text-2xl sm:text-3xl font-bold mb-8 sm:mb-10 text-gray-800">
                    <FaUtensils color="red"/> Our Menu
                </h2>

                {
                    items.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                            {items.map((item)=> (
                                <FoodCard key={item._id} data={item}/>
                            ))}
                        </div>
                    ) : <p className="text-center text-gray-500 text-lg">No Items Availible</p>
                }
            </div>





    </div>
  )
};

export default Shop;
