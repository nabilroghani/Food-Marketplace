import express from "express";
import dotenv from "dotenv";
import path from "path";
dotenv.config();
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth.routes.js";
import cors from "cors";
import { userRouter } from "./routes/user.routes.js";
import { itemRouter } from "./routes/item.routes.js";
import { shopRouter } from "./routes/shop.routes.js";
import orderRouter from "./routes/order.routes.js";
import http from "http";
import { Server } from "socket.io";
import { socketHandler } from "./socket.js";
import { checkDelayedOrders } from "./utils/orderDelay.js";

const app = express();
const server = http.createServer(app);

// FIXED: CORS ke origin se trailing slash (/) hataya aur transports merge kiya
const io = new Server(server, {
  cors: {
    origin: "https://bean-verse-nu.vercel.app",
    credentials: true,
    methods: ['POST', 'GET']
  },
  transports: ["polling", "websocket"]
})

app.set("io", io)

// FIXED: Port strictly production level par set kiya
const port = process.env.PORT || 7860;

// FIXED: Express CORS middleware se bhi trailing slash (/) hata diya
app.use(
  cors({
    origin: "https://bean-verse-nu.vercel.app",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter);
app.use("/api/order", orderRouter);
app.use("/public", express.static(path.join(process.cwd(), "public")));

await connectDb();

socketHandler(io);

setInterval(() => {
  checkDelayedOrders(io).catch((error) => {
    console.error("Delay Check Error:", error);
  });
}, 60 * 1000);

server.listen(port, () => {
  console.log(`🚀 Server started at ${port}`);
});