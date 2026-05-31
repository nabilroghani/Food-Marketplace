// import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import { serverUrl } from "../App.jsx";

// import axios from "axios";
// import {
//   FaMotorcycle,
//   FaMapMarkerAlt,
//   FaStore,
//   FaBoxOpen,
//   FaPhoneAlt,
//   FaWallet,
//   FaChartLine
// } from "react-icons/fa";
// import DeliveryBoyTracking from "./DeliveryBoyTracking.jsx";
// import { useSocket } from "../context/SocketContext.jsx";
// import { toast } from "react-hot-toast";
// import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
// import { ClipLoader } from "react-spinners";
// import useUpdateLocation from "../hooks/useUpdateLocation.jsx";
// import { getDistanceInKilometers } from "../utils/mapUtils.js";

// const notificationSound = new Audio("/notification.mp3");

// const DeliveryBoy = () => {
//   const { userData } = useSelector((state) => state.user);
//   const socket = useSocket();
//   const [currentOrder, setCurrentOrder] = useState(null);
//   const [availableAssignments, setAvailableAssignments] = useState([]);
//   const [otp, setOtp] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [showOtpBox, setShowOtpBox] = useState(false);
//   const [todayDeliveries, setTodayDeliveries] = useState([]);
//   const [message, setMessage] = useState("")
//   const [isNearDeliveryLocation, setIsNearDeliveryLocation] = useState(false);

//   useUpdateLocation(currentOrder?._id);

//   const ratePerDelivery = 50;
//   // Stats calculation
//   const totalEarning = todayDeliveries.reduce((sum, d) => sum + d.count * ratePerDelivery, 0);
//   const totalOrdersToday = todayDeliveries.reduce((sum, d) => sum + d.count, 0);

//   const getAssignments = async () => {
//     try {
//       const { data } = await axios.get(
//         `${serverUrl}/api/order/get-assignments`,
//         { withCredentials: true }
//       );
//       setAvailableAssignments(data);
//     } catch (error) {
//       console.error("Assignments Error:", error);
//     }
//   };

//   const getCurrentOrder = async () => {
//     try {
//       setLoading(true);
//       const result = await axios.get(
//         `${serverUrl}/api/order/get-current-order`,
//         { withCredentials: true }
//       );
//       setCurrentOrder(result.data);
//     } catch (error) {
//       const status = error.response?.status;

//       if (status === 400 || status === 404) {
//         setCurrentOrder(null);
//         setShowOtpBox(false);
//         setOtp("");
//         return;
//       }

//       if (status === 401) {
//         setCurrentOrder(null);
//         return;
//       }

//       console.error("Current Order Error:", error);
//       setCurrentOrder(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleTodayDeliveries = async () => {
//     try {
//       const result = await axios.get(`${serverUrl}/api/order/get-today-deliveries`, 
//         { withCredentials: true }
//       );
//       setTodayDeliveries(result.data);
//     } catch (error) {
//       console.error("Today Deliveries Error:", error);
//     }
//   };

//   useEffect(() => {
//     if (userData?.role === "deliveryBoy") {
//       getAssignments();
//       getCurrentOrder();
//       handleTodayDeliveries();
//     }
//   }, [userData?.role, userData?._id]);

//   useEffect(() => {
//     const deliveryBoyLocation = currentOrder?.deliveryBoyLocation;
//     const destination = currentOrder?.customerLocation
//       ? {
//           lat: currentOrder.customerLocation.lat,
//           lon: currentOrder.customerLocation.lon,
//         }
//       : currentOrder?.deliveryAddress?.latitude != null &&
//           currentOrder?.deliveryAddress?.longitude != null
//         ? {
//             lat: currentOrder.deliveryAddress.latitude,
//             lon: currentOrder.deliveryAddress.longitude,
//           }
//         : null;

//     if (
//       deliveryBoyLocation?.lat == null ||
//       deliveryBoyLocation?.lon == null ||
//       !destination
//     ) {
//       setIsNearDeliveryLocation(false);
//       return;
//     }

//     const distance = getDistanceInKilometers(deliveryBoyLocation, destination);
//     setIsNearDeliveryLocation(distance <= 200);
//   }, [
//     currentOrder?.deliveryBoyLocation?.lat,
//     currentOrder?.deliveryBoyLocation?.lon,
//     currentOrder?.customerLocation?.lat,
//     currentOrder?.customerLocation?.lon,
//     currentOrder?.deliveryAddress?.latitude,
//     currentOrder?.deliveryAddress?.longitude,
//   ]);

//   // Socket: Join order & Real-time Location Updates
//   useEffect(() => {
//     if (!socket || !currentOrder?._id) return;

//     const orderId = currentOrder._id;
//     const eventName = `locationUpdate-${orderId}`;

//     const joinOrderRoom = () => {
//       socket.emit("joinOrder", orderId);
//     };

//     const handleLocationUpdate = (data) => {
//       setCurrentOrder((prev) => {
//         if (!prev) return prev;

//         return {
//           ...prev,
//           deliveryBoyLocation: { lat: data.lat, lon: data.lon },
//         };
//       });
//     };

//     joinOrderRoom();
//     socket.on("connect", joinOrderRoom);
//     socket.on(eventName, handleLocationUpdate);

//     return () => {
//       socket.off("connect", joinOrderRoom);
//       socket.off(eventName, handleLocationUpdate);
//     };
//   }, [socket, currentOrder?._id]);

//   // Socket: New Request Notification
//   useEffect(() => {
//     if (socket && userData?.role === "deliveryBoy") {
//       socket.on("newOrderRequest", (data) => {
//         notificationSound.currentTime = 0;
//         notificationSound.play().catch(() => {});
//         toast.success(`New Order Request! 🚀`, {
//           duration: 10000,
//           position: "top-center",
//           style: { background: "#ff4d2d", color: "#fff" },
//         });
//         getAssignments();
//       });
//     }
//     return () => { if (socket) socket.off("newOrderRequest"); };
//   }, [socket, userData]);

//   const acceptOrder = async (assignmentId) => {
//     try {
//       const { data } = await axios.get(
//         `${serverUrl}/api/order/accept-order/${assignmentId}`,
//         { withCredentials: true }
//       );
//       toast.success(data.message);
//       getCurrentOrder();
//       getAssignments();
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Failed to accept");
//     }
//   };

//   const sendOtp = async () => {
//     if (!isNearDeliveryLocation) {
//       toast.error("You must be near the delivery location to send the code.");
//       return;
//     }

//     try {
//       const { data } = await axios.post(
//         `${serverUrl}/api/order/send-delivery-otp`,
//         { orderId: currentOrder._id, shopOrderId: currentOrder.shopOrder?._id },
//         { withCredentials: true }
//       );
//       setLoading(false); 
//       setShowOtpBox(true);
//       toast.success(data.message);
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Failed to send OTP");
//       setLoading(false);
//     }
//   };

//   const verifyOtp = async () => {
//     if (!isNearDeliveryLocation) {
//       toast.error("You must be near the delivery location to send the code.");
//       return;
//     }

//     try {
//       await axios.post(
//         `${serverUrl}/api/order/verify-delivery-otp`,
//         { orderId: currentOrder._id, shopOrderId: currentOrder.shopOrder?._id, otp },
//         { withCredentials: true }
//       );
//       toast.success("Order Delivered Successfully! 🎉");
//       setCurrentOrder(null);
//       setShowOtpBox(false);
//       setOtp("");
//       handleTodayDeliveries(); 
//       getAssignments();
//     } catch (error) {
//       toast.error(error.response?.data?.message || "OTP verification failed");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 pb-24 font-sans">
//       {/* Header */}
//       <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm p-6 mb-6 border border-gray-100">
//         <div className="flex justify-between items-center">
//           <div>
//             <h1 className="text-xl font-black text-gray-800">Hi, {userData?.fullName} 👋</h1>
//             <p className="text-xs text-green-600 font-bold flex items-center gap-1 mt-1 font-mono">
//               <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
//               ONLINE & ACTIVE
//             </p>
//           </div>
//           <div className="bg-orange-100 p-3 rounded-2xl text-orange-600">
//             <FaMotorcycle size={24} />
//           </div>
//         </div>
//       </div>

//       {/* Stats Section */}
//       <div className="max-w-2xl mx-auto grid grid-cols-2 gap-4 mb-6">
//         <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
//           <div className="flex items-center gap-2 mb-2 text-orange-500">
//             <FaWallet size={14} />
//             <p className="text-[10px] font-black text-gray-400 uppercase">Today's Earnings</p>
//           </div>
//           <p className="text-2xl font-black text-gray-800">Rs. {totalEarning}</p>
//           <p className="text-[10px] text-green-500 font-bold">+{totalOrdersToday} Deliveries</p>
//         </div>
//         <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
//           <div className="flex items-center gap-2 mb-2 text-blue-500">
//             <FaChartLine size={14} />
//             <p className="text-[10px] font-black text-gray-400 uppercase">Performance</p>
//           </div>
//           <p className="text-2xl font-black text-gray-800">98%</p>
//           <p className="text-[10px] text-blue-500 font-bold">On Time Delivery</p>
//         </div>
//       </div>

//       {/* Main Content Area */}
//       {loading ? (
//         <div className="max-w-2xl mx-auto h-64 flex items-center justify-center bg-white rounded-3xl">
//           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
//         </div>
//       ) : currentOrder ? (
//         <div className="max-w-2xl mx-auto space-y-4">
//           <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
//             {/* Map Area */}
//             <div className="h-[500px] min-h-[500px] w-full bg-gray-200 relative">
//               {currentOrder.deliveryBoyLocation?.lat ? (
//                 <DeliveryBoyTracking
//                   data={{
//                     _id: currentOrder._id,
//                     deliveryBoyLocation: currentOrder.deliveryBoyLocation,
//                     customerLocation: currentOrder.customerLocation,
//                   }}
//                 />
//               ) : (
//                 <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 font-bold">
//                   Initializing GPS Tracking...
//                 </div>
//               )}
//             </div>

//             {/* Order Details */}
//             <div className="p-6 space-y-6">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <h2 className="text-lg font-black text-gray-800 uppercase">{currentOrder.shopOrder?.shop?.name}</h2>
//                   <p className="text-sm text-gray-500 flex items-start gap-1 mt-1">
//                     <FaMapMarkerAlt className="text-red-500 mt-1 flex-shrink-0" />
//                     {currentOrder.deliveryAddress?.text}
//                   </p>
//                 </div>
//                 <a href={`tel:${currentOrder.user?.mobile}`} className="bg-green-500 p-4 rounded-2xl text-white shadow-lg">
//                   <FaPhoneAlt />
//                 </a>
//               </div>

//               <div className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-300">
//                 <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Order Summary</p>
//                 <p className="font-bold text-gray-800">{currentOrder.user?.fullName}</p>
//                 <p className="text-sm text-gray-600">
//                   {currentOrder.shopOrder?.shopOrderItems?.length} Items • Rs. {currentOrder.shopOrder?.subtotal}
//                 </p>
//               </div>

//               {!showOtpBox ? (
//                 <div
//                   onClick={() => {
//                     if (!loading && !isNearDeliveryLocation) {
//                       toast.error("You must be near the delivery location to send the code.");
//                     }
//                   }}
//                 >
//                   <button onClick={sendOtp} disabled={loading || !isNearDeliveryLocation} aria-disabled={!isNearDeliveryLocation} className="w-full bg-[#ff4d2d] text-white font-black py-4 rounded-2xl shadow-lg uppercase tracking-widest">
//                      {loading ? <ClipLoader size={20} color="white"/> : "REACHED LOCATION"}
//                   </button>
//                 </div>
//               ) : (
//                 <div className="space-y-3">
//                   <p className="text-center text-xs font-bold text-gray-400 uppercase">Enter Delivery OTP</p>
//                   <input
//                     type="number"
//                     placeholder="----"
//                     onChange={(e) => setOtp(e.target.value)}
//                     value={otp}
//                     className="w-full text-center text-3xl tracking-[1rem] font-black p-4 rounded-2xl border-2 border-orange-500 outline-none"
//                   />
//                   <div
//                     onClick={() => {
//                       if (!isNearDeliveryLocation) {
//                         toast.error("You must be near the delivery location to send the code.");
//                       }
//                     }}
//                   >
//                     <button className="w-full bg-green-600 text-white font-black py-4 rounded-2xl shadow-lg" onClick={verifyOtp} disabled={!isNearDeliveryLocation} aria-disabled={!isNearDeliveryLocation}>
//                       COMPLETE DELIVERY
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       ) : (
//         <div className="max-w-2xl mx-auto space-y-6">
//           {/* Chart Card */}
//           <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
//             <h3 className="text-sm font-black text-gray-800 mb-6 uppercase flex items-center gap-2">
//               <FaChartLine className="text-orange-500" /> Hourly Delivery Stats
//             </h3>
//             <div className="h-64 min-h-[16rem] w-full min-w-0">
//               <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256}>
//                 <BarChart data={todayDeliveries}>
//                   <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
//                   <Tooltip cursor={{fill: '#fcfcfc'}} contentStyle={{borderRadius: '15px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} labelFormatter={(l) => `Time: ${l}:00`} />
//                   <Bar dataKey="count" fill="#ff4d2d" radius={[4, 4, 0, 0]} barSize={25} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </div>

//           {/* New Requests Section */}
//           <div>
//             <h2 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">
//               <FaBoxOpen className="text-orange-500" /> Available Requests
//               <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-lg ml-1">
//                 {availableAssignments.length}
//               </span>
//             </h2>

//             {availableAssignments.length > 0 ? (
//               <div className="grid gap-4">
//                 {availableAssignments.map((a) => (
//                   <div key={a.assignmentId} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:border-orange-500 transition-all">
//                     <div className="flex justify-between items-start mb-4">
//                       <div className="flex items-center gap-3">
//                         <div className="bg-orange-50 p-3 rounded-2xl text-orange-500">
//                           <FaStore />
//                         </div>
//                         <div>
//                           <h3 className="font-black text-gray-800 uppercase text-sm">{a.shopName}</h3>
//                           <p className="text-[10px] font-bold text-green-600">Earnings: Rs. {ratePerDelivery}</p>
//                         </div>
//                       </div>
//                       <span className="text-sm font-black text-gray-900 italic">Rs. {a.subtotal}</span>
//                     </div>
//                     <button onClick={() => acceptOrder(a.assignmentId)} className="w-full bg-gray-900 text-white font-bold py-3 rounded-2xl active:scale-95 transition-all shadow-lg">
//                       Accept Request
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200">
//                 <div className="text-4xl mb-2">😴</div>
//                 <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Waiting for new orders...</p>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DeliveryBoy;
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { serverUrl } from "../App.jsx";
import axios from "axios";
import {
  FaMotorcycle,
  FaMapMarkerAlt,
  FaBoxOpen,
  FaPhoneAlt,
  FaWallet,
  FaChartLine,
  FaStore
} from "react-icons/fa";
import DeliveryBoyTracking from "./DeliveryBoyTracking.jsx";
import { useSocket } from "../context/SocketContext.jsx";
import { toast } from "react-hot-toast";
import { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { ClipLoader } from "react-spinners";
import useUpdateLocation from "../hooks/useUpdateLocation.jsx";
import { getDistanceInKilometers } from "../utils/mapUtils.js";

const notificationSound = new Audio("/notification.mp3");

const DeliveryBoy = () => {
  const { userData } = useSelector((state) => state.user);
  const socket = useSocket();
  const [currentOrder, setCurrentOrder] = useState(null);
  const [availableAssignments, setAvailableAssignments] = useState([]);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false); // Separate loading for buttons
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [todayDeliveries, setTodayDeliveries] = useState([]);
  const [isNearDeliveryLocation, setIsNearDeliveryLocation] = useState(false);

  useUpdateLocation(currentOrder?._id);

  const ratePerDelivery = 50;
  const totalEarning = todayDeliveries.reduce((sum, d) => sum + d.count * ratePerDelivery, 0);
  const totalOrdersToday = todayDeliveries.reduce((sum, d) => sum + d.count, 0);

  const getAssignments = async () => {
    try {
      const { data } = await axios.get(`${serverUrl}/api/order/get-assignments`, { withCredentials: true });
      setAvailableAssignments(data);
    } catch (error) {
      console.error("Assignments Error:", error);
    }
  };

  const getCurrentOrder = async () => {
    try {
      setLoading(true);
      const result = await axios.get(`${serverUrl}/api/order/get-current-order`, { withCredentials: true });
      setCurrentOrder(result.data);
    } catch (error) {
      if (error.response?.status === 400 || error.response?.status === 404) {
        setCurrentOrder(null);
        setShowOtpBox(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTodayDeliveries = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-today-deliveries`, { withCredentials: true });
      setTodayDeliveries(result.data);
    } catch (error) {
      console.error("Today Deliveries Error:", error);
    }
  };

  useEffect(() => {
    if (userData?.role === "deliveryBoy") {
      getAssignments();
      getCurrentOrder();
      handleTodayDeliveries();
    }
  }, [userData?.role, userData?._id]);

  useEffect(() => {
    const deliveryBoyLocation = currentOrder?.deliveryBoyLocation;
    const destination = currentOrder?.customerLocation
      ? { lat: currentOrder.customerLocation.lat, lon: currentOrder.customerLocation.lon }
      : currentOrder?.deliveryAddress?.latitude != null
      ? { lat: currentOrder.deliveryAddress.latitude, lon: currentOrder.deliveryAddress.longitude }
      : null;

    if (deliveryBoyLocation?.lat && destination?.lat) {
      const distance = getDistanceInKilometers(deliveryBoyLocation, destination);
      setIsNearDeliveryLocation(distance <= 200); // 200 KM range logic
    } else {
      setIsNearDeliveryLocation(false);
    }
  }, [currentOrder?.deliveryBoyLocation, currentOrder?.customerLocation, currentOrder?.deliveryAddress]);

  useEffect(() => {
    if (!socket || !currentOrder?._id) return;
    const orderId = currentOrder._id;
    const eventName = `locationUpdate-${orderId}`;
    
    socket.emit("joinOrder", orderId);
    socket.on(eventName, (data) => {
      setCurrentOrder(prev => prev ? { ...prev, deliveryBoyLocation: { lat: data.lat, lon: data.lon } } : prev);
    });

    return () => { socket.off(eventName); };
  }, [socket, currentOrder?._id]);

  useEffect(() => {
    if (socket && userData?.role === "deliveryBoy") {
      socket.on("newOrderRequest", () => {
        notificationSound.play().catch(() => {});
        toast.success(`New Order Request! 🚀`, { duration: 10000 });
        getAssignments();
      });
    }
    return () => { if (socket) socket.off("newOrderRequest"); };
  }, [socket, userData]);

  const acceptOrder = async (assignmentId) => {
    try {
      const { data } = await axios.get(`${serverUrl}/api/order/accept-order/${assignmentId}`, { withCredentials: true });
      toast.success(data.message);
      getCurrentOrder();
      getAssignments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept");
    }
  };

  const sendOtp = async () => {
    if (!isNearDeliveryLocation) return toast.error("You must be near the delivery location.");
    try {
      setActionLoading(true);
      const { data } = await axios.post(`${serverUrl}/api/order/send-delivery-otp`, 
        { orderId: currentOrder._id, shopOrderId: currentOrder.shopOrder?._id }, 
        { withCredentials: true }
      );
      setShowOtpBox(true);
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setActionLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setActionLoading(true);
      await axios.post(`${serverUrl}/api/order/verify-delivery-otp`, 
        { orderId: currentOrder._id, shopOrderId: currentOrder.shopOrder?._id, otp }, 
        { withCredentials: true }
      );
      toast.success("Order Delivered! 🎉");
      setCurrentOrder(null);
      setShowOtpBox(false);
      handleTodayDeliveries();
      getAssignments();
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP verification failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      {/* Top Header */}
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black">Hi, {userData?.fullName} 👋</h1>
            <p className="text-xs text-green-600 font-bold flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span> ONLINE
            </p>
          </div>
          <div className="bg-orange-100 p-3 rounded-2xl text-orange-600"><FaMotorcycle size={24} /></div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-2xl mx-auto grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase">Today's Earnings</p>
          <p className="text-2xl font-black">Rs. {totalEarning}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase">Performance</p>
          <p className="text-2xl font-black">98%</p>
        </div>
      </div>

      {loading ? (
        <div className="max-w-2xl mx-auto h-64 flex items-center justify-center bg-white rounded-3xl">
          <ClipLoader color="#ff4d2d" />
        </div>
      ) : currentOrder ? (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            {/* Map Area Fix */}
            <div className="h-[400px] w-full bg-gray-100 relative overflow-hidden">
              {currentOrder.deliveryBoyLocation?.lat ? (
                <DeliveryBoyTracking
                  data={{
                    _id: currentOrder._id,
                    deliveryBoyLocation: currentOrder.deliveryBoyLocation,
                    customerLocation: currentOrder.customerLocation || currentOrder.deliveryAddress,
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center font-bold text-gray-400">Loading GPS...</div>
              )}
            </div>

            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-black uppercase">{currentOrder.shopOrder?.shop?.name}</h2>
                  <p className="text-sm text-gray-500 flex gap-1"><FaMapMarkerAlt className="text-red-500 mt-1" /> {currentOrder.deliveryAddress?.text}</p>
                </div>
                <a href={`tel:${currentOrder.user?.mobile}`} className="bg-green-500 p-4 rounded-2xl text-white shadow-lg"><FaPhoneAlt /></a>
              </div>

              {!showOtpBox ? (
                <button 
                  onClick={sendOtp} 
                  disabled={actionLoading || !isNearDeliveryLocation} 
                  className={`w-full py-4 rounded-2xl font-black text-white shadow-lg transition-all ${!isNearDeliveryLocation ? 'bg-gray-400' : 'bg-[#ff4d2d]'}`}
                >
                  {actionLoading ? <ClipLoader size={20} color="white" /> : "REACHED LOCATION"}
                </button>
              ) : (
                <div className="space-y-3">
                  <input
                    type="number"
                    placeholder="Enter OTP"
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full text-center text-2xl font-black p-4 rounded-2xl border-2 border-orange-500 outline-none"
                  />
                  <button onClick={verifyOtp} disabled={actionLoading} className="w-full bg-green-600 text-white font-black py-4 rounded-2xl shadow-lg">
                    {actionLoading ? <ClipLoader size={20} color="white" /> : "COMPLETE DELIVERY"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Stats Chart Fix */}
          <div className="bg-white p-6 rounded-3xl shadow-sm h-72 w-full">
            <h3 className="text-sm font-black mb-4 uppercase flex items-center gap-2"><FaChartLine className="text-orange-500" /> Hourly Stats</h3>
            <div className="h-48 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={todayDeliveries}>
                   <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} fontSize={10} />
                   <Tooltip />
                   <Bar dataKey="count" fill="#ff4d2d" radius={[5, 5, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
            </div>
          </div>

          <div className="grid gap-4">
            <h2 className="text-lg font-black flex items-center gap-2"><FaBoxOpen className="text-orange-500" /> New Requests</h2>
            {availableAssignments.map((a) => (
              <div key={a.assignmentId} className="bg-white p-5 rounded-3xl shadow-sm border hover:border-orange-500 transition-all">
                <div className="flex justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-50 p-3 rounded-2xl text-orange-500"><FaStore /></div>
                    <div><h3 className="font-black text-sm uppercase">{a.shopName}</h3><p className="text-[10px] text-green-600 font-bold">Earn Rs. {ratePerDelivery}</p></div>
                  </div>
                  <span className="font-black">Rs. {a.subtotal}</span>
                </div>
                <button onClick={() => acceptOrder(a.assignmentId)} className="w-full bg-gray-900 text-white font-bold py-3 rounded-2xl">Accept Request</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryBoy;