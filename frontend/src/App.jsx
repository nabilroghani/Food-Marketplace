import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";

// Pages & Components
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Home from "./pages/Home.jsx";
import CreateEditShop from "./pages/CreateEditShop.jsx";
import Nav from "./components/Nav.jsx";
import Footer from "./components/Footer.jsx";
import AddItem from "./pages/AddItem.jsx";
import EditItem from "./pages/EditItem.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckOut from "./pages/CheckOut.jsx";
import OrderPlaced from "./pages/OrderPlaced.jsx";
import MyOrders from "./pages/MyOrders.jsx";
import TrackOrderPage from "./pages/TrackOrderPage.jsx";
import Shop from "./pages/Shop.jsx";
import NotFound from "./pages/NotFound.jsx";
import AboutUs from "./pages/AboutUs.jsx"; // About Us Import

// Hooks
import useGetCurrentUser from "./hooks/useGetCurrentUser.jsx";
import useGetCity from "./hooks/useGetCity.jsx";
import useGetMyShop from "./hooks/useGetMyShop.jsx";
import { useSocket } from "./context/SocketContext.jsx";
import { useDispatch } from "react-redux";
import { updateMenuItemAvailability } from "./redux/userSlice.js";

export const serverUrl = "https://nabilroghani-beanverse.hf.space";

const App = () => {
  const { userData } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const socket = useSocket();
  const dispatch = useDispatch();

  useGetCurrentUser();
  useGetCity();
  useGetMyShop();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [userData]);

  useEffect(() => {
    if (!socket || !userData) return;

    const handlePromotionBroadcast = (payload) => {
      toast.success(`${payload.title}: ${payload.message}`, {
        duration: 6000,
      });
    };

    const handleOrderDelayed = (payload) => {
      toast.error(
        payload.message || "Your order is slightly delayed due to traffic/high demand.",
        { duration: 6000 },
      );
    };

    const handleMenuItemStatusUpdate = (payload) => {
      dispatch(updateMenuItemAvailability(payload));
    };

    socket.on("promotionBroadcast", handlePromotionBroadcast);
    socket.on("orderDelayed", handleOrderDelayed);
    socket.on("menuItemStatusUpdate", handleMenuItemStatusUpdate);

    return () => {
      socket.off("promotionBroadcast", handlePromotionBroadcast);
      socket.off("orderDelayed", handleOrderDelayed);
      socket.off("menuItemStatusUpdate", handleMenuItemStatusUpdate);
    };
  }, [socket, userData?._id, dispatch]);

  // Ye routes hain jahan Footer hide karna hai
  const hideFooterRoutes = ["/signin", "/signup", "/forgot-password", "/checkout"];
  const shouldShowFooter = !hideFooterRoutes.includes(location.pathname);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#ff4d2d] border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#ff4d2d] rounded-full animate-pulse opacity-50"></div>
        </div>
        <p className="mt-4 text-gray-500 font-bold tracking-widest animate-pulse uppercase text-xs">Loading App...</p>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>
        {/* 🌍 Open Routes (Har koi dekh sakta hai) */}
        <Route path="/about-us" element={<AboutUs />} />

        {/* 🔓 Auth Routes (Sirf un-authenticated users ke liye) */}
        <Route path="/signin" element={!userData ? <SignIn /> : <Navigate to="/" replace />} />
        <Route path="/signup" element={!userData ? <SignUp /> : <Navigate to="/" replace />} />
        <Route path="/forgot-password" element={!userData ? <ForgotPassword /> : <Navigate to="/" replace />} />

        {/* 🔒 Protected Routes WITHOUT Nav */}
        <Route path="/create-edit-shop" element={userData ? <CreateEditShop /> : <Navigate to="/about-us" replace />} />
        <Route path="/cart" element={userData ? <CartPage /> : <Navigate to="/about-us" replace />} />
        <Route path="/checkout" element={userData ? <CheckOut /> : <Navigate to="/about-us" replace />} />
        <Route path="/order-placed" element={userData ? <OrderPlaced /> : <Navigate to="/about-us" replace />} />
        <Route path="/my-orders" element={userData ? <MyOrders /> : <Navigate to="/about-us" replace />} />
        <Route path="/track-order/:orderId" element={userData ? <TrackOrderPage /> : <Navigate to="/about-us" replace />} />
        <Route path="/shop/:shopId" element={userData ? <Shop /> : <Navigate to="/about-us" replace />} />

        {/* 🔒 Protected Routes WITH Layout Nav */}
        <Route element={userData ? <Nav /> : <Navigate to="/about-us" replace />}>
          <Route path="/" element={<Home />} />
          <Route path="/add-item" element={<AddItem />} />
          <Route path="/edit-item/:itemId" element={<EditItem />} />
        </Route>

        {/* 🚨 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Footer Logic: User login ho aur hide routes mein na ho tabhi dikhega */}

    </>
  );
};

export default App;
