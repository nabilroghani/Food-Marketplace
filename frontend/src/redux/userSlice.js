import { createSlice } from "@reduxjs/toolkit";

// Helper: Local Storage se data uthane ke liye
const savedCart = localStorage.getItem("beanverse_cart")
  ? JSON.parse(localStorage.getItem("beanverse_cart"))
  : [];

// Helper: Total Amount calculate karne ke liye
const calculateTotal = (items) => 
  items.reduce((sum, i) => sum + i.price * i.quantity, 0);

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    city: null,
    currentCity: null,
    currentState: null,
    currentAddress: null,
    shopInMyCity: null,
    itemsInMyCity: null,
    cartItems: savedCart, // Ab refresh par yahan se data ayega
    totalAmount: calculateTotal(savedCart),
    myOrders: null,
    searchItems: null,
    socket: null,
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setCurrentCity: (state, action) => {
      state.currentCity = action.payload;
    },
    setCurrentState: (state, action) => {
      state.currentState = action.payload;
    },
    setCurrentAddress: (state, action) => {
      state.currentAddress = action.payload;
    },
    setShopInMyCity: (state, action) => {
      state.shopInMyCity = action.payload;
    },
    setItemsInMyCity: (state, action) => {
      state.itemsInMyCity = action.payload;
    },

    // --- CART ACTIONS WITH LOCAL STORAGE SYNC ---
    addToCart: (state, action) => {
      const cartItem = action.payload;
      // Note: Make sure yours items have '_id' or 'id'
      const existingItem = state.cartItems.find((i) => (i._id || i.id) === (cartItem._id || cartItem.id));
      
      if (existingItem) {
        existingItem.quantity += cartItem.quantity;
      } else {
        state.cartItems.push(cartItem);
      }
      
      state.totalAmount = calculateTotal(state.cartItems);
      localStorage.setItem("beanverse_cart", JSON.stringify(state.cartItems));
    },

    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.cartItems.find((i) => (i._id || i.id) === id);
      if (item) {
        item.quantity = quantity;
      }
      state.totalAmount = calculateTotal(state.cartItems);
      localStorage.setItem("beanverse_cart", JSON.stringify(state.cartItems));
    },

    removeCartItem: (state, action) => {
      state.cartItems = state.cartItems.filter((i) => (i._id || i.id) !== action.payload);
      state.totalAmount = calculateTotal(state.cartItems);
      localStorage.setItem("beanverse_cart", JSON.stringify(state.cartItems));
    },

    // --- CLEAR CART (Order Place Hone Ke Baad Call Karein) ---
    clearCart: (state) => {
      state.cartItems = [];
      state.totalAmount = 0;
      localStorage.removeItem("beanverse_cart");
    },

    setMyOrders: (state, action) => {
      state.myOrders = action.payload;
    },

    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload;
      if (state.myOrders) {
        const orderIndex = state.myOrders.findIndex((o) => o._id === orderId);
        if (orderIndex !== -1) {
          // Status update logic as per your structure
          if(state.myOrders[orderIndex].shopOrders) {
             state.myOrders[orderIndex].shopOrders[0].status = status;
          }
        }
      }
    },

    setSearchItems: (state, action) => {
      state.searchItems = action.payload;
    },
    updateMenuItemAvailability: (state, action) => {
      const { itemId, isAvailable } = action.payload;

      if (state.itemsInMyCity) {
        state.itemsInMyCity = state.itemsInMyCity.map((item) =>
          item._id === itemId ? { ...item, isAvailable } : item,
        );
      }

      if (state.searchItems) {
        state.searchItems = state.searchItems.map((item) =>
          item._id === itemId ? { ...item, isAvailable } : item,
        );
      }
    },
  },
});

export const {
  setUserData,
  setCurrentCity,
  setCurrentState,
  setCurrentAddress,
  setShopInMyCity,
  setItemsInMyCity,
  addToCart,
  updateQuantity,
  removeCartItem,
  clearCart, 
  setMyOrders,
  updateOrderStatus,
  setSearchItems,
  updateMenuItemAvailability,
} = userSlice.actions;

export default userSlice.reducer;
