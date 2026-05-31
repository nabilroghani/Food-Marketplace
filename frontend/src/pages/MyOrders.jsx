import React, { useEffect } from "react"; 
import { useSelector, useDispatch } from "react-redux"; 
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast"; 
import OwnerOrderCard from "../components/OwnerOrderCard.jsx";
import UserOrderCard from "../components/UserOrderCard.jsx";
import useGetMyOrders from "../hooks/useGetMyOrders.jsx";
import { useSocket } from "../context/SocketContext.jsx";
import { updateOrderStatus, setMyOrders } from "../redux/userSlice.js"; // setMyOrders ya addNewOrder import karein

const MyOrders = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const socket = useSocket(); 

  useGetMyOrders();

  const { userData, myOrders } = useSelector((state) => state.user);

  useEffect(() => {
    if (socket) {
      // 1. Status Update Listener
      socket.on("orderStatusUpdated", (data) => {
        dispatch(updateOrderStatus({ orderId: data.orderId, status: data.status }));
        toast.success(data.message, {
          icon: '📦',
          style: { borderRadius: '10px', background: '#333', color: '#fff' },
        });
      });

      // 2. 🔥 New Order Listener (For Admin/Owner refresh)
      socket.on("newOrderReceived", (data) => {
        if (userData.role === "owner") {
            // Naye order ko list ke shuru mein add karein
            dispatch(setMyOrders([data.order, ...myOrders]));
            toast.success("🔔 New Order Received!", { duration: 5000 });
        }
      });
    }

    return () => {
      if (socket) {
        socket.off("orderStatusUpdated");
        socket.off("newOrderReceived");
      }
    };
  }, [socket, dispatch, myOrders, userData?.role]); 

  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex justify-center px-4">
      <div className="w-full max-w-[800px] p-4">
        <div className="flex items-center gap-[20px] mb-6">
          <div className="z-[10] cursor-pointer" onClick={() => navigate("/")}>
            <IoArrowBack size={35} className="text-[#ff4d2d]" />
          </div>
          <h1 className="text-2xl font-bold text-start">My Orders</h1>
        </div>

        <div className="space-y-6">
          {myOrders &&
            myOrders.map((order, index) =>
              userData.role === "user" ? (
                <UserOrderCard data={order} key={order._id || index} />
              ) : userData.role === "owner" ? (
                <OwnerOrderCard
                  data={order}
                  key={order._id || index}
                  ownerId={userData._id}
                />
              ) : null,
            )}

          {myOrders?.length === 0 && (
            <p className="text-center text-gray-500">No orders found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;