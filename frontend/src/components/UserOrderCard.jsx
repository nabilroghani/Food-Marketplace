import React from "react";
import { FaBox, FaClock, FaCheckCircle, FaTruck } from "react-icons/fa";
import useGetMyOrders from "../hooks/useGetMyOrders.jsx";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { serverUrl } from "../App.jsx";

const UserOrderCard = ({ data }) => {
  const navigate = useNavigate();
  const [selectedRating, setSelectedRating] = useState({}); //itemId:rating
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Status ke liye colors aur icons decide karne wala function
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return {
          color: "text-green-600",
          bg: "bg-green-100",
          icon: <FaCheckCircle />,
        };
      case "out of delivery":
        return { color: "text-blue-600", bg: "bg-blue-100", icon: <FaTruck /> };
      case "preparing":
        return {
          color: "text-orange-600",
          bg: "bg-orange-100",
          icon: <FaClock />,
        };
      default:
        return { color: "text-gray-600", bg: "bg-gray-100", icon: <FaBox /> };
    }
  };

  useGetMyOrders();

  const handleRating = async (itemId, rating) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/item/rating`,
        { itemId, rating },
        { withCredentials: true },
      );
      setSelectedRating((prev) => ({
        ...prev,
        [itemId]: rating,
      }));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4 hover:shadow-md transition-shadow">
      {/* Header Section */}
      <div className="flex justify-between items-start border-b border-dashed pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Order ID
          </span>
          <p className="font-mono font-bold text-gray-800">
            #{data._id.slice(-8).toUpperCase()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatDate(data.createdAt)}
          </p>
        </div>
        <div className="text-right">
          {data.paymentMethod == "cod" ? (
            <span className="inline-block px-2 py-1 rounded text-[10px] font-bold bg-gray-100 text-gray-600 uppercase mb-2">
              {data.paymentMethod?.toUpperCase()}
            </span>
          ) : (
            <span className="inline-block px-2 py-1 rounded text-[10px] font-bold bg-gray-100 text-gray-600 uppercase mb-2">
              Payment: {data.paymentMethod ? "true" : "false"}
            </span>
          )}

          <div
            className={`flex items-center justify-end gap-1 font-bold text-xs uppercase tracking-tight ${
              getStatusStyle(data.shopOrders?.[0]?.status).color
            }`}
          >
            {getStatusStyle(data.shopOrders?.[0]?.status).icon}
            {data.shopOrders?.[0]?.status}
          </div>
        </div>
      </div>

      {/* Shops & Items Section */}
      <div className="space-y-4">
        {data.shopOrders.map((shopOrder, idx) => (
          <div
            key={idx}
            className="bg-gray-50 rounded-xl p-3 border border-gray-100"
          >
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#ff4d2d] rounded-full"></span>
              {shopOrder.shop?.name || "Restaurant"}
            </h3>

            {/* Horizontal Scroll for Items */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {shopOrder.shopOrderItems.map((item, i) => (
                <div
                  key={i}
                  className="flex flex-shrink-0 w-64 bg-white border border-gray-200 rounded-lg p-2 gap-3"
                >
                  <img
                    src={item?.item?.image}
                    alt={item?.item?.name}
                    className="w-16 h-16 object-cover rounded-md border"
                    onError={(e) => {
                      e.target.src = "/placeholder.png";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity}
                    </p>
                    <p className="text-sm font-bold text-[#ff4d2d] mt-1">
                      Rs{item.price}
                    </p>
                  </div>

                  {shopOrder.status == "delivered" && (
                    <div className="flex space-x-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button" // Hamesha type="button" rakhein form ke andar
                          className={`text-lg transition-transform active:scale-125 ${
                            (selectedRating[item.item?._id] || 0) >= star
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                          onClick={() => handleRating(item.item?._id, star)} // Sahi Tarika
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-200">
              <span className="text-xs text-gray-500">Shop Subtotal</span>
              <span className="text-sm font-bold text-gray-700">
                Rs{shopOrder.subtotal}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Section */}
      <div className="flex justify-between items-center pt-2">
        <div>
          <p className="text-xs text-gray-500">Total Paid</p>
          <p className="text-xl font-black text-gray-900">
            Rs{data.totalAmount}
          </p>
        </div>
        <button
          className="bg-[#ff4d2d] hover:bg-[#e64526] text-white px-6 py-2.5
         rounded-xl text-sm font-bold shadow-lg shadow-orange-200 transition-all active:scale-95"
          onClick={() => navigate(`/track-order/${data._id}`)}
        >
          Track Order
        </button>
      </div>
    </div>
  );
};

export default UserOrderCard;
