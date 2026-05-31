import React, { useState, useEffect, useRef } from "react";
import { FaLocationDot, FaPlus, FaUserLarge, FaMotorcycle } from "react-icons/fa6";
import { CiSearch, CiShoppingCart } from "react-icons/ci";
import { LuReceipt, LuLogOut, LuLayoutDashboard } from "react-icons/lu";
import { TbXboxXFilled } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, Outlet, Link } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App.jsx";
import { setSearchItems, setUserData } from "../redux/userSlice.js";
import { toast } from "react-hot-toast";

const Nav = () => {
  const { userData, currentCity, cartItems } = useSelector((state) => state.user);
  const { myShopData } = useSelector((state) => state.owner);

  const [showInfo, setShowInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Handle Scroll Effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowInfo(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogOut = async () => {
    try {
      await axios.post(`${serverUrl}/api/auth/signout`, {}, { withCredentials: true });
      dispatch(setUserData(null));
      toast.success("Logged out successfully");
      navigate("/signin", { replace: true });
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  // Search Logic with Debouncing
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim() && userData?.role === "user") {
        try {
          const result = await axios.get(
            `${serverUrl}/api/item/search-items?query=${query}&city=${currentCity}`,
            { withCredentials: true }
          );
          dispatch(setSearchItems(result.data));
        } catch (error) {
          console.error(error);
        }
      } else {
        dispatch(setSearchItems(null));
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, currentCity, userData?.role, dispatch]);

  return (
    <div className="relative min-h-screen bg-white">
      <nav
        className={`w-full flex items-center justify-between px-3 sm:px-4 md:px-10 fixed top-0 z-[9999] transition-all duration-300 ${
          isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm h-[68px] sm:h-[70px]" : "bg-[#fff9f6] h-[72px] sm:h-[80px]"
        }`}
      >
        {/* Logo Section */}
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate("/")}>
          <div className="bg-[#ff4d2d] p-2 rounded-xl group-hover:rotate-12 transition-transform">
            <FaMotorcycle className="text-white text-xl" />
          </div>
          <h1 className="text-lg sm:text-2xl font-black text-[#ff4d2d] tracking-tighter">BeanVerse</h1>
        </div>

        {/* Search Bar - Desktop */}
        {userData?.role === "user" && (
          <div className="hidden md:flex flex-1 max-w-xl mx-8 h-[45px] bg-gray-100/50 rounded-2xl items-center border border-transparent focus-within:border-[#ff4d2d]/30 focus-within:bg-white transition-all px-4 gap-3">
            <div className="flex items-center gap-2 border-r border-gray-300 pr-3 min-w-[100px]">
              <FaLocationDot className="text-[#ff4d2d] size={14}" />
              <span className="text-xs font-bold text-gray-600 truncate max-w-[70px]">
                {currentCity || "Select..."}
              </span>
            </div>
            <CiSearch size={20} className="text-gray-400 font-bold" />
            <input
              type="text"
              onChange={(e) => setQuery(e.target.value)}
              value={query}
              placeholder="Search food or snacks..."
              className="bg-transparent text-sm text-gray-700 outline-none w-full font-medium"
            />
          </div>
        )}

        {/* Desktop Menu & Profile */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-6">
          {/* Mobile Search Icon */}
          {userData?.role === "user" && (
            <button className="md:hidden p-2 text-gray-600" onClick={() => setShowSearch(!showSearch)}>
              {showSearch ? <TbXboxXFilled size={24} /> : <CiSearch size={24} className="font-bold" />}
            </button>
          )}

          {/* Desktop Nav Items */}
          <div className="hidden sm:flex items-center gap-3">
            {userData?.role === "owner" ? (
              <>
                <Link to="/add-item" className="flex items-center gap-2 px-4 py-2 bg-[#ff4d2d] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#e64426] transition-all">
                  <FaPlus /> <span>Add Item</span>
                </Link>
                <Link to="/my-orders" className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${location.pathname === "/my-orders" ? "bg-orange-100 text-[#ff4d2d]" : "bg-gray-100 text-gray-600"}`}>
                  <LuReceipt /> <span>Orders</span>
                </Link>
              </>
            ) : userData?.role === "user" && (
              <Link to="/cart" className="relative p-2 bg-gray-100 rounded-xl text-gray-700 hover:text-[#ff4d2d] transition-colors">
                <CiShoppingCart size={24} strokeWidth={1} />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#ff4d2d] text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {cartItems.length}
                  </span>
                )}
              </Link>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <div
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ff4d2d] to-[#ff8c76] flex items-center justify-center text-white font-black shadow-lg cursor-pointer border-2 border-white active:scale-90 transition-all"
              onClick={() => setShowInfo(!showInfo)}
            >
              {userData?.fullName?.charAt(0).toUpperCase() || "U"}
            </div>

            {showInfo && (
              <div className="absolute top-[55px] right-0 w-[200px] sm:w-[220px] bg-white shadow-2xl rounded-2xl p-3 flex flex-col gap-1 z-[9999] border border-gray-100 scale-in-center">
                <div className="px-3 py-2 border-b border-gray-50 mb-2">
                  <p className="text-[9px] font-bold text-gray-400 uppercase">Signed in as</p>
                  <p className="text-sm font-black text-gray-800 truncate">{userData?.fullName}</p>
                </div>

                <button onClick={() => {navigate("/profile"); setShowInfo(false)}} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-sm font-bold text-gray-600 transition-all">
                  <FaUserLarge size={14} /> Profile
                </button>

                {/* Mobile Specific Links inside Dropdown */}
                {userData?.role === "owner" && (
                  <div className="sm:hidden flex flex-col gap-1 border-t border-gray-50 mt-1 pt-1">
                    <button onClick={() => {navigate("/add-item"); setShowInfo(false)}} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-sm font-bold text-gray-600">
                      <FaPlus size={14} /> Add Item
                    </button>
                    <button onClick={() => {navigate("/my-orders"); setShowInfo(false)}} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-sm font-bold text-gray-600">
                      <LuReceipt size={14} /> My Orders
                    </button>
                  </div>
                )}

                {userData?.role === "user" && (
                  <button onClick={() => {navigate("/my-orders"); setShowInfo(false)}} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-sm font-bold text-gray-600">
                    <LuReceipt size={14} /> Orders History
                  </button>
                )}

                <button onClick={handleLogOut} className="flex items-center gap-3 px-3 py-2 hover:bg-red-50 rounded-lg text-sm font-bold text-red-500 mt-1">
                  <LuLogOut size={14} /> Log Out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {showSearch && userData?.role === "user" && (
          <div className="absolute top-[72px] sm:top-[80px] left-0 w-full bg-white px-3 sm:px-4 py-3 shadow-lg md:hidden border-t">
            <div className="flex items-center bg-gray-100 rounded-xl p-3 gap-3 border focus-within:border-[#ff4d2d]">
              <FaLocationDot className="text-[#ff4d2d] shrink-0" />
              <input
                onChange={(e) => setQuery(e.target.value)}
                value={query}
                type="text"
                autoFocus
                placeholder="Search food..."
                className="bg-transparent text-sm text-gray-700 outline-none w-full font-bold"
              />
            </div>
          </div>
        )}
      </nav>

      {/* Spacing for fixed nav */}
      <div className="h-[72px] sm:h-[80px] md:h-[90px]"></div>
      
      <main className="max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation (Optional but good for UX) */}
      {userData?.role === "user" && (
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t flex justify-around items-center py-3 z-[999]">
          <Link to="/" className="flex flex-col items-center gap-1">
            <LuLayoutDashboard size={20} className={location.pathname === "/" ? "text-[#ff4d2d]" : "text-gray-400"} />
            <span className="text-[10px] font-bold">Home</span>
          </Link>
          <Link to="/cart" className="flex flex-col items-center gap-1 relative">
            <CiShoppingCart size={22} className={location.pathname === "/cart" ? "text-[#ff4d2d]" : "text-gray-400"} />
            {cartItems.length > 0 && <span className="absolute -top-1 -right-1 bg-[#ff4d2d] text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full">{cartItems.length}</span>}
            <span className="text-[10px] font-bold">Cart</span>
          </Link>
          <Link to="/my-orders" className="flex flex-col items-center gap-1">
            <LuReceipt size={20} className={location.pathname === "/my-orders" ? "text-[#ff4d2d]" : "text-gray-400"} />
            <span className="text-[10px] font-bold">Orders</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Nav;
