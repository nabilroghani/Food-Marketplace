import React, { useEffect, useState } from "react";
import { FaCircleCheck } from "react-icons/fa6";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App.jsx";
import { IoTimerOutline } from "react-icons/io5";

const OrderPlaced = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(false);

  // URL parameters se data nikalna
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    const verifyOnlinePayment = async () => {
      if (sessionId && orderId) {
        setVerifying(true);
        try {
          await axios.post(
            `${serverUrl}/api/order/verify-payment`,
            { sessionId, orderId },
            { withCredentials: true }
          );
          console.log("Payment status updated in database");
        } catch (error) {
          console.error("Verification failed:", error);
        } finally {
          setVerifying(false);
        }
      }
    };

    verifyOnlinePayment();
  }, [sessionId, orderId]);

  return (
    <div className="min-h-screen bg-[#fff9f6] flex flex-col justify-center items-center px-4 text-center relative overflow-hidden">
      {verifying ? (
        // Verification Loader
        <div className="flex flex-col items-center">
          <IoTimerOutline className="text-[#ff4d2d] text-6xl animate-spin mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Verifying Payment...</h1>
          <p className="text-gray-500">Please wait while we confirm your transaction.</p>
        </div>
      ) : (
        // Success UI
        <>
          <FaCircleCheck className="text-green-500 text-6xl mb-4 animate-bounce" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Placed!</h1>
          <p className="text-gray-600 max-w-md mb-6">
            Thanks for your purchase. Your order is being prepared. You can track
            order status in the "My Orders" Section.
          </p>
          <button
            className="bg-[#ff4d2d] hover:bg-[#e64526] text-white px-6 py-3 rounded-lg text-lg font-medium transition shadow-lg active:scale-95"
            onClick={() => navigate("/my-orders")}
          >
            Back to my orders page
          </button>
        </>
      )}
    </div>
  );
};

export default OrderPlaced;