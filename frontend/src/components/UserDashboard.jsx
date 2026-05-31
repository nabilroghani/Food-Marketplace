import { useRef, useState, useEffect } from "react";
import { categories } from "../category.js";
import CategoryCard from "./CategoryCard.jsx";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { useSelector } from "react-redux";
import FoodCard from "./FoodCard.jsx";
import useGetShopByCity from "../hooks/useGetShopByCity.jsx";
import useGetItemByCity from "../hooks/useGetItemByCity.jsx";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  useGetShopByCity();
  useGetItemByCity();
  
  const { currentCity, shopInMyCity, itemsInMyCity, searchItems } = useSelector(
    (state) => state.user,
  );
  
  const cateScrollRef = useRef();
  const shopScrollRef = useRef();
  const navigate = useNavigate();
  
  const [showLeftCateButton, setShowLeftCateButton] = useState(false);
  const [showRightCateButton, setShowRightCateButton] = useState(false);
  const [showLeftShopButton, setShowLeftShopButton] = useState(false);
  const [showRightShopButton, setShowRightShopButton] = useState(false);
  const [updatedItemsList, setUpdatedItemsList] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");

  const handleFilterByCategory = (category) => {
    setActiveCategory(category);
    if (category === "All") {
      setUpdatedItemsList(itemsInMyCity);
    } else {
      const filteredList = itemsInMyCity?.filter(
        (i) => i.category === category || i.catagory === category,
      );
      setUpdatedItemsList(filteredList);
    }
  };

  useEffect(() => {
    setUpdatedItemsList(itemsInMyCity);
  }, [itemsInMyCity]);

  const updateButton = (ref, setLeftButton, setRightButton) => {
    const element = ref.current;
    if (element) {
      setLeftButton(element.scrollLeft > 5);
      setRightButton(
        Math.ceil(element.scrollLeft + element.clientWidth) < element.scrollWidth - 5
      );
    }
  };

  const scrollHandler = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = ref.current.clientWidth * 0.8;
      ref.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton);
      updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton);
    };

    handleScroll();
    const cateElement = cateScrollRef?.current;
    const shopElement = shopScrollRef?.current;

    if (cateElement) cateElement.addEventListener("scroll", handleScroll);
    if (shopElement) shopElement.addEventListener("scroll", handleScroll);

    window.addEventListener("resize", handleScroll);

    return () => {
      if (cateElement) cateElement.removeEventListener("scroll", handleScroll);
      if (shopElement) shopElement.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [shopInMyCity, itemsInMyCity, searchItems]);

  return (
    <div className="min-h-screen w-full bg-[#fff9f6] pb-20">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10 pt-4 sm:pt-6">
        
        {/* --- SEARCH RESULTS SECTION --- */}
        {searchItems && searchItems.length > 0 && (
          <div className="w-full flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1.5 bg-[#ff4d2d] rounded-full"></div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-800 tracking-tight">
                Search Results ({searchItems.length})
              </h1>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {searchItems.map((item) => (
                <FoodCard data={item} key={item._id} />
              ))}
            </div>
            <hr className="border-gray-200" />
          </div>
        )}

        {/* --- CATEGORIES SECTION --- */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-xl sm:text-2xl font-black text-gray-800">
              Inspiration for your first order
            </h1>
          </div>
          
          <div className="group relative">
            {showLeftCateButton && (
              <button
                className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 bg-white text-[#ff4d2d] w-10 h-10
                rounded-full shadow-xl items-center justify-center z-20 hover:scale-110 transition-all border border-gray-100"
                onClick={() => scrollHandler(cateScrollRef, "left")}
              >
                <FaAngleLeft size={20} />
              </button>
            )}
            
            <div
              className="w-full flex overflow-x-auto gap-3 sm:gap-6 pb-4 no-scrollbar scroll-smooth"
              ref={cateScrollRef}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {categories.map((cate, index) => (
                <div key={index} className="flex-shrink-0">
                  <CategoryCard
                    name={cate.category}
                    image={cate.image}
                    isActive={activeCategory === cate.category}
                    onClick={() => handleFilterByCategory(cate.category)}
                  />
                </div>
              ))}
            </div>

            {showRightCateButton && (
              <button
                className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 bg-white text-[#ff4d2d] w-10 h-10
                rounded-full shadow-xl items-center justify-center z-20 hover:scale-110 transition-all border border-gray-100"
                onClick={() => scrollHandler(cateScrollRef, "right")}
              >
                <FaAngleRight size={20} />
              </button>
            )}
          </div>
        </div>

        {/* --- BEST SHOPS SECTION --- */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
             <h1 className="text-xl sm:text-2xl font-black text-gray-800">
              Top Brands in {currentCity || "Your City"}
            </h1>
          </div>

          <div className="group relative">
            {showLeftShopButton && (
              <button
                className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 bg-white text-[#ff4d2d] w-10 h-10
                rounded-full shadow-xl items-center justify-center z-20 hover:scale-110 transition-all border border-gray-100"
                onClick={() => scrollHandler(shopScrollRef, "left")}
              >
                <FaAngleLeft size={20} />
              </button>
            )}

            <div
              className="w-full flex overflow-x-auto gap-4 sm:gap-6 pb-4 no-scrollbar scroll-smooth"
              ref={shopScrollRef}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {shopInMyCity?.length === 0 ? (
                <div className="w-full py-10 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 font-bold">No shops found in {currentCity}</p>
                </div>
              ) : (
                shopInMyCity?.map((shop, index) => (
                  <div key={index} className="flex-shrink-0 transform hover:scale-105 transition-transform">
                    <CategoryCard 
                      name={shop.name} 
                      image={shop.image} 
                      onClick={() => navigate(`/shop/${shop._id}`)}
                    />
                  </div>
                ))
              )}
            </div>

            {showRightShopButton && (
              <button
                className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 bg-white text-[#ff4d2d] w-10 h-10
                rounded-full shadow-xl items-center justify-center z-20 hover:scale-110 transition-all border border-gray-100"
                onClick={() => scrollHandler(shopScrollRef, "right")}
              >
                <FaAngleRight size={20} />
              </button>
            )}
          </div>
        </div>

        {/* --- FOOD ITEMS GRID --- */}
        <div className="flex flex-col gap-8 pt-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-black text-gray-800 uppercase tracking-tight">
              {activeCategory === "All" ? "Explore Everything" : `${activeCategory} Specials`}
            </h1>
            <div className="h-1 flex-1 mx-6 bg-gray-100 rounded-full hidden sm:block"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 lg:gap-x-6 lg:gap-y-10">
            {updatedItemsList?.length > 0 ? (
              updatedItemsList.map((item, index) => (
                <FoodCard key={item._id || index} data={item} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <p className="text-gray-400 text-lg font-medium">No food items available in this category.</p>
              </div>
            )}
          </div>
        </div>

      </div>
      
      {/* CSS for hiding scrollbars while keeping functionality */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;
