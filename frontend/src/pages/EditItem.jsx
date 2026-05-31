import { useNavigate, useParams } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { FaUtensils } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { serverUrl } from "../App.jsx";
import { setMyShopData } from "../redux/ownerSlice.js";
import { ClipLoader } from "react-spinners";

const EditItem = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { myShopData } = useSelector((state) => state.owner);
  const { itemId } = useParams();
  const [currentItem, setCurrentItem] = useState(null);
  const [name, setName] = useState(currentItem?.name || "");
  const [price, setPrice] = useState(currentItem?.price || "");
  const [frontendImage, setFrontendImage] = useState(currentItem?.image || "");
  const [backendImage, setBackendImage] = useState(null);
  const [category, setCategory] = useState(currentItem?.category || "");
  const [foodType, setFoodType] = useState(currentItem?.foodType || "");
  const [loading, setLoading] = useState(false);

  const categories = [
    "snacks",
    "Main Course",
    "Desserts",
    "Pizza",
    "Burgers",
    "Sandwiches",
    "South Pakistani",
    "North Pakistan",
    "Chinese",
    "Fast Food",
    "Other",
  ];

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("category", category);
      formData.append("foodType", foodType);
      formData.append("price", price);

      if (backendImage) {
        formData.append("image", backendImage);
      }
      const result = await axios.put(
        `${serverUrl}/api/item/edit-item/${itemId}`,
        formData,
        { withCredentials: true }
      );
      dispatch(setMyShopData(result.data));
      // console.log(result.data);
      setLoading(false);
      navigate("/");
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };
  useEffect(() => {
    const handleGetItemById = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/item/get-by-id/${itemId}`,
          {
            withCredentials: true,
          }
        );
        setCurrentItem(result.data);
      } catch (error) {
        console.log(error);
      }
    };
    handleGetItemById();
  }, [itemId]);
  useEffect(() => {
    if (currentItem) {
      setName(currentItem.name || "");
      setPrice(currentItem.price || "");
      setCategory(currentItem.category || "");
      setFoodType(currentItem.foodType || "");
      setFrontendImage(currentItem.image || "");
    }
  }, [currentItem]);

  return (
    <div
      className="flex justify-center flex-col items-center p-6 bg-gradient-to-br from-orange-50 
    relative to-white min-h-screen"
    >
      <div
        className="absolute top-[20px] left-[20px] z-[10] mb-[10px]"
        onClick={() => navigate("/")}
      >
        <IoArrowBack size={35} className="text-[#ff4d2d]" />
      </div>
      <div className="max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-100">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-orange-100 p-4 rounded-full mb-4">
            <FaUtensils className="text-[#ff4d2d] w-16 h-16" />
          </div>
          <div className="text-3xl font-extrabold text-gray-900">Edit Food</div>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* for name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              placeholder="Enter Shop Name"
              onChange={(e) => setName(e.target.value)}
              value={name}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          {/* for image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Food Image
            </label>
            <input
              type="file"
              accept="image/*"
              className=" w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              onChange={handleImage}
            />
            {frontendImage && (
              <div className="mt-4">
                <img
                  src={frontendImage}
                  alt=""
                  className="w-full h-48 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          {/* for Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price
            </label>
            <input
              type="number"
              placeholder="0"
              onChange={(e) => setPrice(e.target.value)}
              value={price}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          {/* for Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Category
            </label>
            <select
              onChange={(e) => setCategory(e.target.value)}
              value={category}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select Category</option>
              {categories.map((cate, index) => (
                <option value={cate} key={index}>
                  {cate}
                </option>
              ))}
            </select>
          </div>

          {/* for Food type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Food Type
            </label>
            <select
              onChange={(e) => setFoodType(e.target.value)}
              value={foodType}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="veg">Veg</option>
              <option value="non veg">Non Veg</option>
            </select>
          </div>

          <button
            className="w-full bg-[#ff4d2d] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-orange-600 hover:shadow-lg
           transition-all duration-200 cursor-pointer"
            disabled={loading}
          >
            {loading ? <ClipLoader size={20} color="white" /> : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditItem;
