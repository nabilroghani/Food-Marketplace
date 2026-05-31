import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { IoLocation } from "react-icons/io5";
import { IoSearch } from "react-icons/io5";
import { BiCurrentLocation } from "react-icons/bi";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import { setAddress, setLocation } from "../redux/mapSlice.js";
import axios from "axios";
import { useEffect, useState } from "react";
import { MdDeliveryDining } from "react-icons/md";
import { clearCart } from "../redux/userSlice.js";
import { FaCreditCard } from "react-icons/fa6";
import Swal from 'sweetalert2';
import { serverUrl } from "../App.jsx";

function RecenterMap({ location }) {
  const map = useMap();

  useEffect(() => {
    if (location?.lat && location?.lon) {
      map.setView([location.lat, location.lon], 16, { animate: true });
    }
  }, [location, map]);

  return null;
}

const CheckOut = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { location, address } = useSelector((state) => state.map);
  const { cartItems, totalAmount } = useSelector((state) => state.user);
  const [addressInput, setAddressInput] = useState("");
  const apiKey = import.meta.env.VITE_GEOAPIKEY;
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // Logical Fix applied as discussed: Free delivery over 500
  const deliveryFee = totalAmount >= 500 ? 0 : 40;
  const AmountWithDeliveryFee = totalAmount + deliveryFee;

  const onDragEnd = (e) => {
    const { lat, lng } = e.target._latlng;
    dispatch(setLocation({ lat, lon: lng }));
    getAddressByLatLng(lat, lng);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        dispatch(setLocation({ lat: latitude, lon: longitude }));
        getAddressByLatLng(latitude, longitude);
      },
      (error) => {
        console.log("Location error:", error);
      }
    );
  };

  const getAddressByLatLng = async (lat, lng) => {
    try {
      // FIXED: { withCredentials: false } added to disable global cookie sending
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apiKey}`,
        { withCredentials: false }
      );
      dispatch(setAddress(result?.data?.results[0].address_line2));
    } catch (error) {
      console.log(error);
    }
  };

  const getLatLngByAddress = async () => {
    try {
      // FIXED: { withCredentials: false } added to prevent CORS wildcard block
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
          addressInput
        )}&apiKey=${apiKey}`,
        { withCredentials: false }
      );
      const { lat, lon } = result.data.features[0].properties;
      dispatch(setLocation({ lat, lon }));
    } catch (error) {
      console.log(error);
    }
  };

const handlePlaceOrder = async () => {
  try {
    if (!addressInput || !location.lat) {
      // 1. Validation Popup
      Swal.fire({
        title: 'Address Missing!',
        text: 'Please select your delivery location on the map.',
        icon: 'warning',
        confirmButtonColor: '#ff4d2d',
      });
      return;
    }

    // Loading State dikhane ke liye
    Swal.fire({
      title: 'Placing Order...',
      didOpen: () => { Swal.showLoading(); },
      allowOutsideClick: false
    });

    const result = await axios.post(
      `${serverUrl}/api/order/place-order`,
      {
        paymentMethod,
        deliveryAddress: {
          text: addressInput,
          latitude: location.lat,
          longitude: location.lon,
        },
        totalAmount: AmountWithDeliveryFee,
        cartItems: cartItems.map((item) => ({
          id: item.id || item._id,
          shop: item.shop,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
        })),
      },
      { withCredentials: true }
    );

    // Order Success!
    dispatch(clearCart());

    if (paymentMethod === "cod") {
      Swal.fire({
        title: 'Success!',
        text: 'Your order has been placed successfully.',
        icon: 'success',
        confirmButtonColor: '#ff4d2d',
        timer: 2000 
      }).then(() => {
        navigate("/order-placed");
      });
    } else {
      if (result.data.url) {
        window.location.href = result.data.url;
      }
    }

  } catch (error) {
    console.log("Order error:", error);
    // Error Popup
    Swal.fire({
      title: 'Error!',
      text: 'Could not place order. Please try again.',
      icon: 'error',
      confirmButtonColor: '#ff4d2d',
    });
  }
};



  useEffect(() => {
    if (address) {
      setAddressInput(address);
    }
  }, [address]);

  useEffect(() => {
    if (!location?.lat) {
      getCurrentLocation();
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-10 font-sans">
      {/* Back Button */}
      <button
        className="fixed top-6 left-6 z-20 bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-all"
        onClick={() => navigate("/cart")}
      >
        <IoArrowBack size={28} className="text-[#ff4d2d]" />
      </button>

      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
        {/* Left Side: Map and Form */}
        <div className="flex-1 p-6 md:p-8 space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
              Checkout
            </h1>
            <p className="text-sm text-gray-500">
              Secure your meal in just one step
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 uppercase tracking-wider text-[12px]">
              <IoLocation className="text-[#ff4d2d]" /> Delivery Location
            </h2>

            <div className="flex gap-2 bg-gray-100 p-2 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-[#ff4d2d]/20 transition-all">
              <input
                value={addressInput || ""}
                onChange={(e) => setAddressInput(e.target.value)}
                type="text"
                placeholder="Search your area..."
                className="flex-1 bg-transparent p-2 text-sm focus:outline-none"
              />
              <button
                className="bg-[#ff4d2d] text-white p-2 rounded-lg hover:brightness-110 transition active:scale-95"
                onClick={getLatLngByAddress}
              >
                <IoSearch size={20} />
              </button>
              <button
                className="bg-blue-600 text-white p-2 rounded-lg hover:brightness-110 transition active:scale-95"
                onClick={getCurrentLocation}
              >
                <BiCurrentLocation size={20} />
              </button>
            </div>

            <div className="rounded-2xl border-2 border-gray-100 overflow-hidden shadow-inner h-60 md:h-72">
              {location?.lat && location?.lon ? (
                <MapContainer
                  className="w-full h-full"
                  center={[location.lat, location.lon]}
                  zoom={16}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <RecenterMap location={location} />
                  <Marker
                    position={[location.lat, location.lon]}
                    draggable
                    eventHandlers={{ dragend: onDragEnd }}
                  />
                </MapContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full bg-gray-50 animate-pulse">
                  <div className="w-10 h-10 border-4 border-[#ff4d2d] border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-gray-500 text-sm">Detecting location...</p>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wider text-[12px]">
              Payment Method
            </h2>
            <div className="grid grid-cols-1 gap-3">
              <button
                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                  paymentMethod === "cod"
                    ? "border-[#ff4d2d] bg-orange-50 shadow-sm"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
                onClick={() => setPaymentMethod("cod")}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl ${
                      paymentMethod === "cod"
                        ? "bg-[#ff4d2d] text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <MdDeliveryDining size={24} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900">Cash on Delivery</p>
                    <p className="text-xs text-gray-500">
                      Pay when food arrives
                    </p>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-4 ${
                    paymentMethod === "cod"
                      ? "border-[#ff4d2d]"
                      : "border-gray-200"
                  }`}
                ></div>
              </button>

              <button
                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                  paymentMethod === "online"
                    ? "border-[#ff4d2d] bg-orange-50 shadow-sm"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
                onClick={() => setPaymentMethod("online")}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl flex gap-1 ${
                      paymentMethod === "online"
                        ? "bg-[#ff4d2d] text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <FaCreditCard size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900">Online Payment</p>
                    <p className="text-xs text-gray-500">
                      UPI, Cards or Wallets
                    </p>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-4 ${
                    paymentMethod === "online"
                      ? "border-[#ff4d2d]"
                      : "border-gray-200"
                  }`}
                ></div>
              </button>
            </div>
          </section>
        </div>

        {/* Right Side: Summary & Action */}
        <div className="w-full md:w-[350px] bg-gray-50 p-6 md:p-8 flex flex-col justify-between border-l border-gray-100">
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-4">
              Order Details
            </h2>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    Rs. {item.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-4 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>Rs. {totalAmount}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery Charge</span>
                <span
                  className={
                    deliveryFee === 0
                      ? "text-green-600 font-bold"
                      : "font-semibold"
                  }
                >
                  {deliveryFee === 0 ? "FREE" : `Rs. ${deliveryFee}`}
                </span>
              </div>
              {deliveryFee > 0 && (
                <div className="p-2 bg-orange-100 rounded-lg text-[10px] text-orange-700">
                  Tip: Add Rs. {500 - totalAmount} more for FREE delivery!
                </div>
              )}
              <div className="border-t border-dashed border-gray-300 pt-3 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-black text-[#ff4d2d]">
                  Rs. {AmountWithDeliveryFee}
                </span>
              </div>
            </div>
          </div>

          <button
            className="w-full bg-[#ff4d2d] hover:bg-[#e64526] text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-[#ff4d2d]/30 transition-all active:scale-95 mt-8"
            onClick={handlePlaceOrder}
          >
            {paymentMethod === "cod" ? "Place Order" : "Pay & Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckOut;