import { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
  setItemsInMyCity,
  setShopInMyCity,
  setUserData,
} from "../redux/userSlice.js";

const useGetItemByCity = () => {
  const dispatch = useDispatch();
  const { currentCity } = useSelector((state) => state.user);
  useEffect(() => {
    if (!currentCity) return;
    const fetchItems = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/item/get-by-city/${currentCity}`,
          {
            withCredentials: true,
          }
        );
        dispatch(setItemsInMyCity(result.data));
        // console.log(result.data);
      } catch (error) {
        console.log(error.response?.data || error);
      }
    };

    fetchItems();
  }, [currentCity]);
};

export default useGetItemByCity;
