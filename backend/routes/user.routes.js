import express from "express";
import {
  broadcastPromotion,
  getCurrentUser,
  updateUserLocation,
} from "../controllers/user.controllers.js";
import isAuth from "../middlewares/isAuth.js";

export const userRouter = express.Router();

userRouter.get("/current", isAuth, getCurrentUser);
userRouter.post("/update-location", isAuth, updateUserLocation);
userRouter.post("/broadcast-promotion", isAuth, broadcastPromotion);
