import React, { useEffect } from "react";
import { IoArrowBack } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CartItemCard from "../components/CartItemCart.jsx";
import { clearCart } from "../redux/userSlice.js";

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems, totalAmount } = useSelector((state) => state.user);

  // --- 1. LOCAL STORAGE SYNC ---
  // Jab bhi cartItems change hon, local storage mein update karein
  useEffect(() => {
    if (cartItems) {
      localStorage.setItem("beanverse_cart", JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // --- 2. CLEAR CART AFTER ORDER (Logic) ---
  // Ye function aap checkout complete hone ke baad call kar sakte hain
  const clearCartAfterOrder = () => {
    dispatch(clearCart());
    localStorage.removeItem("beanverse_cart"); // Local storage khali
  };

  return (
    <div className="min-h-screen bg-[#fff9f6] flex justify-center p-4 md:p-10">
      <div className="w-full max-w-[800px] animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            className="p-2 hover:bg-white rounded-full transition-all shadow-sm active:scale-90"
            onClick={() => navigate("/")}
          >
            <IoArrowBack size={28} className="text-[#ff4d2d]" />
          </button>
          <h1 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">
            Review Your Cart
          </h1>
        </div>

        {cartItems?.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 shadow-xl shadow-orange-100/50 border border-orange-50 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-gray-400 text-lg font-bold uppercase tracking-widest">
              Your Cart is Empty
            </p>
            <button 
              onClick={() => navigate("/")}
              className="mt-6 text-[#ff4d2d] font-black border-2 border-[#ff4d2d] px-6 py-2 rounded-xl hover:bg-[#ff4d2d] hover:text-white transition-all"
            >
              Order Something Delicious
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Items List */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
              {cartItems?.map((item, index) => (
                <CartItemCard data={item} key={item._id || index} />
              ))}
            </div>

            {/* Billing Summary */}
            <div className="bg-white p-6 rounded-3xl shadow-xl shadow-orange-100/20 border border-orange-50 space-y-4">
              <div className="flex justify-between items-center text-gray-500 font-bold uppercase text-xs tracking-widest">
                <span>Subtotal</span>
                <span>₨.{totalAmount}</span>
              </div>
              <div className="flex justify-between items-center text-gray-500 font-bold uppercase text-xs tracking-widest">
                <span>Delivery Fee</span>
                <span className="text-green-600 font-black">FREE</span>
              </div>
              
              <div className="h-[1px] bg-gray-100 w-full" />

              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-gray-800">Total Payable</h2>
                <span className="text-2xl font-black text-[#ff4d2d]">
                  ₨.{totalAmount}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <div className="sticky bottom-4 md:static">
              <button
                className="w-full bg-[#ff4d2d] text-white py-5 rounded-2xl text-lg font-black uppercase tracking-widest
                shadow-lg shadow-[#ff4d2d]/30 hover:bg-[#e64526] hover:translate-y-[-2px] active:scale-95 transition-all"
                onClick={() => navigate("/checkout")}
              >
                Proceed To CheckOut
              </button>
              <p className="text-center text-[10px] text-gray-400 font-bold mt-3 uppercase tracking-tighter">
                Safe & Secure Payments with BeanVerse
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default CartPage;