import axios from "axios";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App.jsx";
import { setMyShopData } from "../redux/ownerSlice.js";
import { toast } from "react-hot-toast";

const OwnerItemCard = ({ data }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleDeleteItem = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/item/delete-item/${data._id}`,
        { withCredentials: true }
      );
      dispatch(setMyShopData(result.data));
    } catch (error) {
      console.log(error);
    }
  };

  const handleToggleAvailability = async () => {
    try {
      const result = await axios.patch(
        `${serverUrl}/api/item/toggle-availability/${data._id}`,
        {},
        { withCredentials: true },
      );
      dispatch(setMyShopData(result.data.shop));
      toast.success(result.data.message);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update item availability.",
      );
    }
  };

  return (
    <div
      className={`flex rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-orange-100 w-full max-w-3xl ${
        data.isAvailable ? "bg-white" : "bg-gray-100 opacity-80"
      }`}
    >
      {/* Image */}
      <div className="w-32 sm:w-40 h-32 sm:h-40 flex-shrink-0">
        <img
          src={data.image}
          alt={data.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between p-4 flex-1">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800">{data.name}</h2>
            {!data.isAvailable && (
              <span className="rounded-full bg-gray-700 px-2 py-1 text-xs font-bold text-white">
                Sold Out
              </span>
            )}
          </div>

          <p className="text-sm text-gray-500 mt-1">
            Category: <span className="font-medium">{data.category}</span>
          </p>

          <p className="text-sm text-gray-500">
            Food Type:{" "}
            <span className="font-medium capitalize">{data.foodType}</span>
          </p>
        </div>

        {/* Bottom Row */}
        <div className="flex items-center justify-between mt-3">
          <div className="text-[#ff4d2d] font-bold text-lg">
            Rs {data.price}
          </div>

          <div className="flex items-center gap-2">
            <button
              className={`rounded-full px-3 py-2 text-xs font-bold transition-colors ${
                data.isAvailable
                  ? "bg-green-50 text-green-700 hover:bg-green-100"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={handleToggleAvailability}
            >
              {data.isAvailable ? "Available" : "Unavailable"}
            </button>
            <button
              className="p-2 rounded-full bg-orange-50 text-[#ff4d2d] hover:bg-orange-100
             cursor-pointer"
              onClick={() => navigate(`/edit-item/${data._id}`)}
            >
              <FaPencilAlt size={16} />
            </button>
            <button
              className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 cursor-pointer"
              onClick={handleDeleteItem}
            >
              <FaTrashAlt size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerItemCard;
