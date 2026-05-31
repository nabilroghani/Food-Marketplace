import axios from "axios";
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { serverUrl } from "../App.jsx";
import { useSocket } from "../context/SocketContext.jsx";
import { toast } from "react-hot-toast";
import {
  IoArrowBack,
  IoCall,
  IoLocationSharp,
  IoTime,
  IoCheckmarkCircle,
} from "react-icons/io5";
import { FaStore, FaBox } from "react-icons/fa";
import DeliveryBoyTracking from "../components/DeliveryBoyTracking.jsx";

const TrackOrderPage = () => {
  const { orderId } = useParams();
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const socket = useSocket();

  // 1. Initial Data Fetching Logic
  const fetchOrderData = useCallback(
    async (isSilent = false) => {
      try {
        if (!isSilent) setLoading(true);
        const result = await axios.get(
          `${serverUrl}/api/order/get-order-by-id/${orderId}`,
          { withCredentials: true },
        );
        setCurrentOrder(result.data);
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        if (!isSilent) setLoading(false);
      }
    },
    [orderId],
  );

  // Initial Fetch on Mount
  useEffect(() => {
    if (orderId) {
      fetchOrderData();
    }
  }, [orderId, fetchOrderData]);

  useEffect(() => {
    if (!socket || !orderId) return;

    const locationKey = `locationUpdate-${orderId}`;
    const statusKey = `orderStatusUpdated-${orderId}`;

    const joinOrderRoom = () => {
      socket.emit("joinOrder", orderId);
      console.log("Joined room:", orderId);
    };

    const handleLocationUpdate = (newCoords) => {
      console.log("Live Data Received in TrackOrderPage:", newCoords);

      setCurrentOrder((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          shopOrders: prev.shopOrders.map((shopOrder) => {
            if (shopOrder.assignedDeliveryBoy) {
              return {
                ...shopOrder,
                assignedDeliveryBoy: {
                  ...shopOrder.assignedDeliveryBoy,
                  location: {
                    ...shopOrder.assignedDeliveryBoy.location,
                    type: "Point",
                    coordinates: [newCoords.lon, newCoords.lat],
                  },
                },
              };
            }
            return shopOrder;
          }),
        };
      });
    };

    const handleStatusUpdate = (payload) => {
      if (payload?.status === "delivered") {
        setCurrentOrder((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            shopOrders: prev.shopOrders.map((shopOrder) =>
              !payload.shopOrderId || shopOrder._id === payload.shopOrderId
                ? {
                    ...shopOrder,
                    status: "delivered",
                    deliveredAt: payload.deliveredAt ?? shopOrder.deliveredAt,
                  }
                : shopOrder,
            ),
          };
        });

        toast.success(payload.message || "Order delivered successfully!");
        return;
      }

      fetchOrderData(true);
    };

    joinOrderRoom();
    socket.on("connect", joinOrderRoom);
    socket.on(locationKey, handleLocationUpdate);
    socket.on(statusKey, handleStatusUpdate);

    return () => {
      console.log("Cleaning up socket listeners");
      socket.off("connect", joinOrderRoom);
      socket.off(locationKey, handleLocationUpdate);
      socket.off(statusKey, handleStatusUpdate);
    };
  }, [socket, orderId, fetchOrderData]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4 bg-white">
        <div className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
          <p className="text-gray-800 font-bold text-lg animate-pulse">
            Tracking Live...
          </p>
          <p className="text-gray-400 text-sm">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50">
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100 max-w-sm">
          <h2 className="text-2xl font-black text-gray-800 mb-2">
            Order Not Found
          </h2>
          <p className="text-gray-500 mb-8">
            Humne koshish ki, magar yeh order ID hamare system mein nahi mili.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-orange-500 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-orange-200 active:scale-95 transition-all"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 lg:pb-10">
      <nav className="bg-white/80 backdrop-blur-xl sticky top-0 z-[100] border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-3 hover:bg-gray-100 rounded-2xl transition-all active:scale-90 bg-slate-50"
            >
              <IoArrowBack size={24} className="text-gray-800" />
            </button>
            <div>
              <h1 className="text-xl font-black text-gray-800 tracking-tight leading-none">
                Live Status
              </h1>
              <p className="text-[11px] text-orange-600 font-black uppercase tracking-widest mt-1">
                ID: #{orderId.slice(-8)}
              </p>
            </div>
          </div>
          <div className="hidden sm:block">
            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-tighter">
              Secure Tracking
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
        {currentOrder?.shopOrders?.map((shopOrder, index) => (
          <div
            key={index}
            className="bg-white rounded-[2.5rem] sm:rounded-[3.5rem] shadow-2xl shadow-slate-200/80 border border-white overflow-hidden transition-all duration-500 hover:shadow-orange-100/50"
          >
            <div className="h-[500px] min-h-[500px] w-full bg-slate-100 relative group">
              {shopOrder.status !== "delivered" &&
              shopOrder.assignedDeliveryBoy ? (
                <DeliveryBoyTracking
                  orderId={orderId}
                  data={{
                    _id: orderId,
                    deliveryBoyLocation: {
                      lat: shopOrder.assignedDeliveryBoy?.location?.coordinates?.[1],
                      lon: shopOrder.assignedDeliveryBoy?.location?.coordinates?.[0],
                    },
                    customerLocation: {
                      lat: currentOrder.deliveryAddress?.latitude,
                      lon: currentOrder.deliveryAddress?.longitude,
                    },
                  }}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gradient-to-b from-slate-50 to-slate-100">
                  {shopOrder.status === "delivered" ? (
                    <div className="space-y-4 animate-in zoom-in duration-500">
                      <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-green-50/50">
                        <IoCheckmarkCircle
                          size={60}
                          className="text-green-500"
                        />
                      </div>
                      <h3 className="text-3xl font-black text-gray-800 tracking-tight">
                        Delivered!
                      </h3>
                      <p className="text-gray-500 font-medium">
                        Enjoy your meal, it has arrived.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="relative inline-block">
                        <IoTime
                          size={70}
                          className="text-orange-400 animate-bounce"
                        />
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-gray-200 rounded-full blur-[3px]"></div>
                      </div>
                      <h3 className="text-xl font-black text-gray-800">
                        Assigning Rider...
                      </h3>
                      <p className="text-xs text-gray-400 max-w-[240px] font-bold uppercase tracking-tight leading-relaxed">
                        Looking for the closest partner to pick up your order.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 sm:p-10 space-y-10">
              {shopOrder.assignedDeliveryBoy &&
                shopOrder.status !== "delivered" && (
                  <div className="flex items-center justify-between bg-gradient-to-r from-orange-50/50 to-transparent p-6 rounded-[2.5rem] border border-orange-100/50 group hover:border-orange-200 transition-all">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-orange-200 ring-4 ring-white group-hover:rotate-3 transition-transform">
                        {shopOrder.assignedDeliveryBoy?.fullName?.charAt(0) || "D"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                          <span className="text-[10px] text-orange-700 font-black uppercase tracking-widest">
                            Live Tracking
                          </span>
                        </div>
                        <p className="font-black text-gray-800 text-xl leading-none">
                          {shopOrder.assignedDeliveryBoy?.fullName || "Delivery Partner"}
                        </p>
                      </div>
                    </div>
                    {shopOrder.assignedDeliveryBoy?.mobile && (
                      <a
                        href={`tel:${shopOrder.assignedDeliveryBoy.mobile}`}
                        className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 text-green-600 hover:bg-green-600 hover:text-white active:scale-90 transition-all"
                      >
                        <IoCall size={24} />
                      </a>
                    )}
                  </div>
                )}

              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 sm:items-center">
                <div className="flex items-center gap-5">
                  <div className="p-5 bg-slate-50 rounded-3xl text-slate-600 border border-slate-100">
                    <FaStore size={26} />
                  </div>
                  <div>
                    <h2 className="font-black text-gray-800 text-2xl tracking-tight mb-1">
                      {shopOrder.shop?.name}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-orange-600 uppercase">
                        Amount: â‚¹{shopOrder.subtotal}
                      </span>
                      <span className="text-gray-300">â€¢</span>
                      <span className="text-xs text-gray-400 font-bold uppercase">
                        {shopOrder.shopOrderItems?.length} Items
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] border ${
                    shopOrder.status === "delivered"
                      ? "bg-green-50 text-green-700 border-green-100"
                      : "bg-blue-50 text-blue-700 animate-pulse border-blue-100 shadow-sm shadow-blue-50"
                  }`}
                >
                  {shopOrder.status}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-slate-100 pt-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-400">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <FaBox size={14} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">
                      Order Details
                    </span>
                  </div>
                  <p className="text-base text-slate-700 font-bold leading-relaxed pl-1">
                    {shopOrder.shopOrderItems?.map((i) => i.name).join(", ")}
                  </p>
                </div>

                <div className="space-y-4 md:text-right">
                  <div className="flex items-center gap-3 text-slate-400 md:justify-end">
                    <div className="p-2 bg-red-50 rounded-lg">
                      <IoLocationSharp size={16} className="text-red-400" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">
                      Delivery Address
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 font-bold italic leading-relaxed md:pl-10">
                    {currentOrder.deliveryAddress?.text}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default TrackOrderPage;
