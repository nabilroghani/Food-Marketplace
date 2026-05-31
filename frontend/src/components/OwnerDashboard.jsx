import { useSelector } from "react-redux";
import { FaUtensils } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FaPen } from "react-icons/fa";
import OwnerItemCard from "./OwnerItemCard.jsx";
import { useState } from "react";
import axios from "axios";
import { serverUrl } from "../App.jsx";
import { toast } from "react-hot-toast";

const OwnerDashboard = () => {
  const { myShopData } = useSelector((state) => state.owner);
  const navigate = useNavigate();
  const [promotionTitle, setPromotionTitle] = useState("");
  const [promotionMessage, setPromotionMessage] = useState("");
  const [sendingPromotion, setSendingPromotion] = useState(false);

  const handleBroadcastPromotion = async () => {
    if (!promotionTitle.trim() || !promotionMessage.trim()) {
      toast.error("Please enter both a title and message.");
      return;
    }

    try {
      setSendingPromotion(true);
      const { data } = await axios.post(
        `${serverUrl}/api/user/broadcast-promotion`,
        {
          title: promotionTitle,
          message: promotionMessage,
        },
        { withCredentials: true },
      );
      toast.success(data.message);
      setPromotionTitle("");
      setPromotionMessage("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to broadcast promotion.");
    } finally {
      setSendingPromotion(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex flex-col items-center">
      {!myShopData && (
        <div className="flex justify-center items-center p-4 sm:p-6">
          <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col items-center text-center">
              <FaUtensils className="text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20 mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                Add Your Restaurant
              </h2>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Join our food delivery platform and reach thousand of hungry
                customers every day.
              </p>
              <button
                className="bg-[#ff4d2d] text-white px-5 sm:px-6 py-2 rounded-full font-medium shadow-md hover:bg-orange-600 transition-colors duration-200"
                onClick={() => navigate("/create-edit-shop")}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ye tab show hoga jab apne shop ad keya ho */}
      {myShopData && (
        <div className="w-full flex flex-col items-center gap-6 px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl text-gray-900 flex items-center gap-3 mt-8 text-center">
            <FaUtensils className="text-[#ff4d2d] w-14 h-14" />
            Welcome to {myShopData.name}
          </h1>
          <div className="w-full max-w-3xl bg-white shadow-lg rounded-2xl p-5 sm:p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Broadcast Message</h2>
            <div className="space-y-3">
              <input
                type="text"
                value={promotionTitle}
                onChange={(e) => setPromotionTitle(e.target.value)}
                placeholder="Promotion title"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none"
              />
              <textarea
                value={promotionMessage}
                onChange={(e) => setPromotionMessage(e.target.value)}
                placeholder="Promotion or coupon message"
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none resize-none"
              />
              <button
                onClick={handleBroadcastPromotion}
                disabled={sendingPromotion}
                className="bg-[#ff4d2d] text-white px-5 py-3 rounded-xl font-medium shadow-md hover:bg-orange-600 transition-colors duration-200"
              >
                {sendingPromotion ? "Sending..." : "Broadcast Message"}
              </button>
            </div>
          </div>
          <div
            className="bg-white shadow-lg rounded-xl overflow-hidden border border-orange-100 hover:shadow-2xl
          transition-all duration-300 w-full max-w-3xl relative
          "
          >
            <div
              className="absolute top-4 right-4 bg-[#ff4d2d] text-white p-2 rounded-full shadow-md
             hover:bg-orange-600 transition-colors transition-colors cursor-pointer"
              onClick={() => navigate("/create-edit-shop")}
            >
              <FaPen size={20} />
            </div>
            <img
              src={myShopData.image}
              alt={myShopData.name}
              className="w-full h-48 sm:h-64 object-cover"
            />
            <div className="p-4 sm:p-6">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                {myShopData.name}
              </h1>
              <p className="text-gray-500 ">
                {myShopData.city}, {myShopData.state}
              </p>
              <p className="text-gray-500 mb-4">{myShopData.address}</p>
            </div>
          </div>

          {myShopData.items.length == 0 && (
            <div className="flex justify-center items-center p-4 sm:p-6">
              <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex flex-col items-center text-center">
                  <FaUtensils className="text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20 mb-4" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                    Add Food Item
                  </h2>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base">
                    Share your delicious creation with our customers by adding
                    them to the menu.
                  </p>
                  <button
                    className="bg-[#ff4d2d] text-white px-5 sm:px-6 py-2 rounded-full font-medium shadow-md hover:bg-orange-600 transition-colors duration-200"
                    onClick={() => navigate("/add-item")}
                  >
                    Add Food
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ye data tab show hoga jab owner apna product add kare */}
          {myShopData.items.length > 0 && (
            <div>
              {myShopData.items.map((item, index) => (
                <OwnerItemCard data={item} key={index} /> //ye hamne prop bheg deya
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
