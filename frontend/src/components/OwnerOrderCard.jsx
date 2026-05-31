import axios from "axios";
import {
  FaPhone,
  FaLocationDot,
  FaEnvelope,
  FaUserCheck,
  FaClock,
  FaBagShopping,
  FaPhoneFlip,
} from "react-icons/fa6";
import { MdOutlineDeliveryDining } from "react-icons/md";
import { serverUrl } from "../App.jsx";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { updateOrderStatus } from "../redux/userSlice.js";

const OwnerOrderCard = ({ data, ownerId }) => {
  const myShopOrder = data.shopOrders?.[0];
  const [availableBoys, setAvailableboys] = useState([]);
  const dispatch = useDispatch();

  if (!myShopOrder) return null;

  const getStatusStyles = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "preparing":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "out of delivery":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const subtotal = myShopOrder.subtotal || 0;
  const deliveryFee =
    data.deliveryFee > 0
      ? data.deliveryFee
      : subtotal < 500 && subtotal > 0
      ? 40
      : 0;
  const grandTotal = subtotal + deliveryFee;

  const handleUpdateStatus = async (orderId, shopId, status) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/update-status/${orderId}/${shopId}`,
        { status },
        { withCredentials: true }
      );
      dispatch(updateOrderStatus({ orderId, status }));
      if (result.data.availableBoys) {
        setAvailableboys(result.data.availableBoys);
      }
    } catch (error) {
      console.error("Update failed:", error.response?.data || error.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 mb-6">
      {/* Top Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col lg:flex-row justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">
              {data.user?.fullName || "Customer"}
            </h2>
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-widest ${getStatusStyles(
                myShopOrder.status
              )}`}
            >
              {myShopOrder.status}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <p className="text-gray-500 flex items-center gap-2">
              <FaEnvelope className="text-gray-400" /> {data.user?.email}
            </p>
            <a
              href={`tel:${data.user?.mobile}`}
              className="text-[#ff4d2d] font-bold flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <FaPhone /> {data.user?.mobile}
            </a>

            {data.paymentMethod == "online" ? <p>Payment: {data.payment ? "true" : "false"}</p> : <p>Payment Method:
              {data.paymentMethod}
            </p> }
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-end lg:items-center gap-4">
          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm min-w-[180px]">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Subtotal:</span>{" "}
              <span className="font-semibold">Rs.{subtotal}</span>
            </div>
            <div
              className={`flex justify-between text-xs mb-2 ${
                deliveryFee === 0 ? "text-green-600 font-bold" : "text-gray-500"
              }`}
            >
              <span>Delivery:</span>{" "}
              <span>{deliveryFee === 0 ? "FREE" : `+ Rs.${deliveryFee}`}</span>
            </div>
            <div className="border-t border-gray-100 pt-2 flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold text-gray-400">
                Total
              </span>
              <span className="text-lg font-black text-[#ff4d2d]">
                Rs.{grandTotal}
              </span>
            </div>
          </div>

          <select
            className="w-full sm:w-auto text-xs font-bold border-2 border-gray-200 rounded-lg px-4 py-2.5 bg-white shadow-sm outline-none cursor-pointer transition-all"
            value={myShopOrder.status}
onChange={(e) => {
  console.log("Full Order Data:", data);
  const myShopOrder = data.shopOrders?.[0]; 
  
  const actualShopId = myShopOrder?.shop?._id || myShopOrder?.shop;

  if (!actualShopId) {
    console.error("Shop ID missing! Check myShopOrder structure:", myShopOrder);
    return;
  }

  handleUpdateStatus(data._id, actualShopId, e.target.value);
}}
          >
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="out of delivery">Out of Delivery</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Address Bar */}
      <div className="p-4 bg-orange-50/30 border-b border-gray-100 flex items-start gap-3">
        <FaLocationDot className="text-[#ff4d2d] mt-1 shrink-0 text-lg" />
        <p className="text-sm font-medium text-gray-600 italic">
          {data?.deliveryAddress?.text}
        </p>
      </div>

      {/* Content Grid */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Items */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FaBagShopping className="text-gray-400" />
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Items Detail
            </h3>
          </div>
          <div className="space-y-3">
            {myShopOrder.shopOrderItems?.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 bg-gray-50 p-2 rounded-xl border border-gray-100"
              >
                <img
                  src={item.item?.image || item.image}
                  alt={item.name}
                  className="w-14 h-14 rounded-lg object-cover border border-gray-200"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    {item.quantity} x Rs.{item.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Delivery Agents Section (FIXED) */}
        {myShopOrder.status === "out of delivery" && (
          <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100 flex flex-col h-full">
            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <MdOutlineDeliveryDining size={20} /> Delivery Partner
            </h3>

            <div className="flex-1 overflow-y-auto max-h-[250px] space-y-3">
              {myShopOrder.assignedDeliveryBoy ? (
                /* 1. If assigned, show boy details */
                <div className="bg-white p-4 rounded-xl border border-green-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold uppercase">
                      {myShopOrder.assignedDeliveryBoy.fullName?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        {myShopOrder.assignedDeliveryBoy.fullName}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        {myShopOrder.assignedDeliveryBoy.mobile}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`tel:${myShopOrder.assignedDeliveryBoy.mobile}`}
                    className="bg-green-600 p-2.5 rounded-lg text-white"
                  >
                    <FaPhoneFlip size={14} />
                  </a>
                </div>
              ) : availableBoys.length > 0 ? (
                /* 2. If not assigned but notified boys exist */
                availableBoys.map((b, index) => (
                  <div
                    key={index}
                    className="bg-white p-3 rounded-xl border border-indigo-100 shadow-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold uppercase">
                        {b.fullName?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">
                          {b.fullName}
                        </p>
                        <p className="text-[11px] text-gray-500">{b.mobile}</p>
                      </div>
                    </div>
                    <a
                      href={`tel:${b.mobile}`}
                      className="bg-indigo-600 p-2.5 rounded-lg text-white"
                    >
                      <FaPhone size={14} />
                    </a>
                  </div>
                ))
              ) : (
                /* 3. Default: Searching / Waiting */
                <div className="h-full flex flex-col items-center justify-center text-center py-6">
                  <FaClock
                    className="text-indigo-200 animate-spin-slow mb-3"
                    size={32}
                  />
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                    Searching for partners...
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 italic text-center px-4">
                    Waiting for a nearby delivery boy to accept the request
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerOrderCard;
