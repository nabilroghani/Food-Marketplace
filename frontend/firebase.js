// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "beanverse-c0b44.firebaseapp.com",
  projectId: "beanverse-c0b44",
  storageBucket: "beanverse-c0b44.firebasestorage.app",
  messagingSenderId: "443570620638",
  appId: "1:443570620638:web:6051a1859e19deaeac9a4f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { app, auth };
