import { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App.jsx";
import { useSelector } from "react-redux";
import { useSocket } from "../context/SocketContext.jsx"; 

const useUpdateLocation = (currentOrderId) => { 
  const { userData } = useSelector((state) => state.user);
  const socket = useSocket(); 

  useEffect(() => {
    if (!userData || userData.role !== "deliveryBoy") return;

    const updateLocation = async (lat, lon) => {
      try {
        await axios.post(
          `${serverUrl}/api/user/update-location`,
          { lat, lon },
          { withCredentials: true }
        );

        if (socket && currentOrderId) {
          socket.emit("updateLiveLocation", {
            orderId: currentOrderId,
            lat,
            lon,
            userId: userData._id,
          });
        }
        
        console.log("📍 Location Synced & Emitted:", { lat, lon });
      } catch (err) {
        console.error("❌ Update Failed:", err.message);
      }
    };

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        updateLocation(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => console.log("GPS searching..."),
      { enableHighAccuracy: false, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [userData, socket, currentOrderId]); 
};

export default useUpdateLocation;