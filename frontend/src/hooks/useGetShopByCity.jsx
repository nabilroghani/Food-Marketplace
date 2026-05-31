import { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App.jsx";
import { useDispatch, useSelector } from "react-redux";
import { setShopInMyCity, setUserData } from "../redux/userSlice.js";

const useGetShopByCity = () => {
  const dispatch = useDispatch();
  const { currentCity } = useSelector((state) => state.user);
  useEffect(() => {
    if (!currentCity) return;
    const fetchShops = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/shop/get-by-city/${currentCity}`,
          {
            withCredentials: true,
          }
        );
        dispatch(setShopInMyCity(result.data));
        // console.log(result.data);
      } catch (error) {
        console.log(error.response?.data || error);
      }
    };

    fetchShops();
  }, [currentCity]);
};

export default useGetShopByCity;
