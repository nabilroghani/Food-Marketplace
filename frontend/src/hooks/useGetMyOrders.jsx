import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setMyShopData } from "../redux/ownerSlice.js";
import { setMyOrders } from "../redux/userSlice.js";
import { serverUrl } from "../App.jsx";

const useGetMyOrders = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    if (!userData?._id) return;

    const fetchOrders = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/order/my-orders`, {
          withCredentials: true,
        });
        dispatch(setMyOrders(result.data));
        // console.log(result.data);
      } catch (error) {
        console.log(error.response?.data || error);
        dispatch(setMyShopData(null));
      }
    };

    fetchOrders();
  }, [userData]);
};

export default useGetMyOrders;
