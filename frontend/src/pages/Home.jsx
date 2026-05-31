import React from "react";
import { useSelector } from "react-redux";
import UserDashboard from "../components/UserDashboard.jsx";
import OwnerDashboard from "../components/OwnerDashboard.jsx";
import DeliveryBoy from "../components/DeliveryBoy.jsx";

const Home = () => {
  const { userData } = useSelector((state) => state.user);

  if (!userData) return <h2 className="text-center">Loading...</h2>;

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-[#fff9f6]">
      {userData.role === "user" && <UserDashboard />}
      {userData.role === "owner" && <OwnerDashboard />}
      {userData.role === "deliveryBoy" && <DeliveryBoy />}
    </div>
  );
};

export default Home;
