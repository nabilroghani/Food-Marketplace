import Shop from "../models/shop.model.js";
import { Order } from "../models/order.model.js";
import User from "../models/user.model.js";
import DeliveryAssignment from "../models/deliveryAssignment.model.js";
import { sendDeliveryOtpMail } from "../utils/mail.js";
import { getEstimatedDeliveryTime } from "../utils/orderDelay.js";
import dotenv from "dotenv";
dotenv.config();
import Stripe from "stripe";
const stripe = new Stripe(process.env.Secret_key);



export const placeOrder = async (req, res) => {
  try {
    const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body;
    const io = req.app.get("io"); // 🔥 Get Socket Instance

    const numericTotal = Number(totalAmount);
    const finalDeliveryFee = numericTotal < 500 ? 40 : 0;
    const grandTotal = numericTotal;

    const groupItemsByShop = {};
    cartItems.forEach((item) => {
      const shopId = item.shop;
      if (!shopId || shopId === "undefined") {
        throw new Error(`Shop ID missing for item: ${item.name}`);
      }
      if (!groupItemsByShop[shopId]) groupItemsByShop[shopId] = [];
      groupItemsByShop[shopId].push(item);
    });

    const shopOrders = [];
    for (const shopId of Object.keys(groupItemsByShop)) {
      const shop = await Shop.findById(shopId).populate("owner");
      if (!shop) return res.status(404).json({ message: `Shop ${shopId} not found` });

      const items = groupItemsByShop[shopId];
      const subtotal = items.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0);

      shopOrders.push({
        shop: shop._id,
        owner: shop.owner?._id,
        subtotal,
        shopOrderItems: items.map((i) => ({
          item: i.id || i._id,
          price: i.price,
          quantity: i.quantity,
          name: i.name,
          image: i.image,
        })),
      });
    }

    const newOrder = await Order.create({
      user: req.userId,
      paymentMethod,
      deliveryAddress,
      deliveryFee: finalDeliveryFee,
      totalAmount: grandTotal,
      shopOrders,
      payment: paymentMethod === "cod" ? false : false 
    });

    await newOrder.populate("shopOrders.shop", "name");
await newOrder.populate("shopOrders.shopOrderItems.item", "name image price");


    for (const sOrder of shopOrders) {
        const owner = await User.findById(sOrder.owner);
        if (owner && owner.socketId) {
            io.to(owner.socketId).emit("newOrderReceived", {
                message: "New Order Received!",
                order: newOrder
            });
        }
    }

    if (paymentMethod === "online") {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          ...cartItems.map((item) => ({
            price_data: {
              currency: "pkr",
              product_data: { name: item.name },
              unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
          })),
          ...(finalDeliveryFee > 0 ? [{
            price_data: {
              currency: "pkr",
              product_data: { name: "Delivery Fee" },
              unit_amount: finalDeliveryFee * 100,
            },
            quantity: 1,
          }] : [])
        ],
        mode: "payment",
        success_url: `http://localhost:5173/order-placed?session_id={CHECKOUT_SESSION_ID}&orderId=${newOrder._id}`,
        cancel_url: `http://localhost:5173/cart`,
      });

      newOrder.stripeOrderId = session.id;
      await newOrder.save();

      return res.status(200).json({ url: session.url, orderId: newOrder._id });
    }

    return res.status(201).json(newOrder);

  } catch (error) {
    return res.status(500).json({ message: `Internal error: ${error.message}` });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { sessionId, orderId } = req.body; 

    if (!sessionId || !orderId) {
      return res.status(400).json({ message: "Missing sessionId or orderId" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: "Order not found" });

      order.payment = true;
      order.stripePaymentId = session.payment_intent; 
      await order.save();

      console.log("✅ Payment Verified for Order:", orderId);
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({ success: false, message: "Payment status not paid" });
    }
  } catch (error) {
    console.error("Verify Error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "user") {
      const orders = await Order.find({
        user: req.userId,
        $or: [
          { paymentMethod: "cod" },
          { payment: true }
        ]
      })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("shopOrders.owner", "name email mobile")
        .populate("shopOrders.shopOrderItems.item", "name image price");

      return res.status(200).json(orders);

    } else if (user.role === "owner") {
      const orders = await Order.find({ 
        "shopOrders.owner": req.userId,
        $or: [
          { paymentMethod: "cod" },
          { payment: true }
        ]
      })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("user")
        .populate("shopOrders.shopOrderItems.item", "name image price")
        .populate("shopOrders.assignedDeliveryBoy", "fullName mobile");

      const filteredOrders = orders.map((order) => {
        const mySpecificShopOrder = order.shopOrders.find(
          (so) => so.owner.toString() === req.userId.toString()
        );

        return {
          _id: order._id,
          paymentMethod: order.paymentMethod,
          payment: order.payment, 
          user: order.user,
          shopOrders: [mySpecificShopOrder],
          createdAt: order.createdAt,
          deliveryAddress: order.deliveryAddress,
          deliveryFee: order.deliveryFee,
          totalAmount: order.totalAmount,
        };
      });

      return res.status(200).json(filteredOrders);
    }
  } catch (error) {
    return res.status(500).json({ message: `get user order error: ${error.message}` });
  }
};

//-------------------------------------------------------------------
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, shopId } = req.params;
    const { status } = req.body;
    const io = req.app.get("io");

    // Order find karein aur user ko populate karein socket notifications ke liye
    const order = await Order.findById(orderId).populate("user");
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Sahi shop order dhoondne ke liye robust logic
    const shopOrder = order.shopOrders.find((o) => {
      const currentShopId = o.shop?._id ? o.shop._id.toString() : o.shop?.toString();
      return currentShopId === shopId.toString();
    });

    if (!shopOrder) {
      return res.status(400).json({ message: "shop order not found" });
    }

    shopOrder.status = status;

    if (status === "out of delivery" && shopOrder.assignment) {
      await DeliveryAssignment.findByIdAndUpdate(shopOrder.assignment, {
        estimatedDeliveryTime: getEstimatedDeliveryTime(new Date()),
        delayNotificationSent: false,
      });
    }

    // --- Delivery Boy Broadcast Logic ---
    let deliveryBoysPayload = [];
    if (status === "out of delivery" && !shopOrder.assignment) {
      const { longitude, latitude } = order.deliveryAddress;
      
      // 1. Kareeb tareen riders dhoondain (6km range)
      const nearByDeliveryBoys = await User.find({
        role: "deliveryBoy",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            $maxDistance: 6000,
          },
        },
      });

      const nearByIds = nearByDeliveryBoys.map((b) => b._id);
      
      // 2. Check karein ke kaun se riders pehle se busy hain
      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearByIds },
        status: { $nin: ["brodcasted", "completed"] },
      }).distinct("assignedTo");

      const busyIdSet = new Set(busyIds.map((id) => String(id)));
      
      // 3. Jo free hain unhe filter karein
      const availableBoys = nearByDeliveryBoys.filter(
        (b) => !busyIdSet.has(String(b._id))
      );
      const candidates = availableBoys.map((b) => b._id);

      if (candidates.length > 0) {
        // Assignment create karein
        const deliveryAssignment = await DeliveryAssignment.create({
          order: order._id,
          shop: shopOrder.shop,
          shopOrderId: shopOrder._id,
          brodcastedTo: candidates,
          status: "brodcasted",
        });

        shopOrder.assignment = deliveryAssignment._id;
        
        deliveryBoysPayload = availableBoys.map((b) => ({
          id: b._id,
          fullName: b.fullName,
          longitude: b.location.coordinates?.[0],
          latitude: b.location.coordinates?.[1],
          mobile: b.mobile,
          socketId: b.socketId,
        }));

        // 🔥 Riders ko real-time notify karein
        availableBoys.forEach(boy => {
          if (boy.socketId) {
            io.to(boy.socketId).emit("newOrderRequest", {
              orderId: order._id,
              address: order.deliveryAddress.text,
            });
          }
        });
      }
    }

    await order.save();

    // 🔥 User ko notify karein ke status change ho gaya hai
    if (order.user?.socketId) {
      io.to(order.user.socketId).emit("orderStatusUpdated", {
        orderId: order._id,
        status: status,
        message: `Your order from ${shopOrder.shop?.name || 'the shop'} is now ${status}`
      });
    }

    // Response ke liye data populate karein
    await order.populate("shopOrders.shop", "name");
    await order.populate("shopOrders.assignedDeliveryBoy", "fullName email mobile");

    const updatedShopOrder = order.shopOrders.find((o) => {
      const currentId = o.shop?._id ? o.shop._id.toString() : o.shop?.toString();
      return currentId === shopId.toString();
    });

    return res.status(200).json({
      shopOrder: updatedShopOrder,
      assignedDeliveryBoy: updatedShopOrder?.assignedDeliveryBoy,
      availableBoys: deliveryBoysPayload,
      assignment: updatedShopOrder?.assignment,
    });

  } catch (error) {
    return res.status(500).json({ message: `Order status error: ${error.message}` });
  }
};
//------------------------------------------------------------------

export const getDeliveryBoyAssignment = async (req, res) => {
  try {
    const deliveryBoyId = req.userId;
    const assignment = await DeliveryAssignment.find({
      brodcastedTo: deliveryBoyId,
      status: "brodcasted",
    })
      .populate("order")
      .populate("shop");

    const formated = assignment.map((a) => ({
      assignmentId: a._id,
      orderId: a.order._id,
      shopName: a.shop.name,
      deliveryAddress: a.order.deliveryAddress,
      items:
        a.order.shopOrders.find((so) => so._id.equals(a.shopOrderId))
          .shopOrderItems || [],
      subtotal: a.order.shopOrders.find((so) => so._id.equals(a.shopOrderId))
        ?.subtotal,
    }));
    return res.status(200).json(formated);
  } catch (error) {
    return res
      .status(500)
      .json({ message: ` get assignment error ${error.message}` });
  }
};

export const acceptOrder = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const io = req.app.get("io");

    // 1. Assignment dhoondain
    const assignment = await DeliveryAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(400).json({ message: "Assignment not found" });
    }

    // 2. Check karein ke status expired toh nahi
    if (assignment.status !== "brodcasted") {
      return res.status(400).json({ message: "Assignment is already taken or expired" });
    }

    // 3. Check karein ke rider pehle se kisi aur order par toh nahi
    const alreadyAssigned = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: { $nin: ["brodcasted", "completed"] },
    });

    if (alreadyAssigned) {
      return res.status(400).json({ message: "You are already assigned to another order" });
    }

    // 4. Assignment update karein
    assignment.assignedTo = req.userId;
    assignment.status = "assigned";
    assignment.acceptedAt = new Date();
    assignment.lastLocationUpdateAt = new Date();
    assignment.estimatedDeliveryTime = getEstimatedDeliveryTime(new Date());
    assignment.delayNotificationSent = false;
    await assignment.save();

    // 5. Main Order document update karein
    const order = await Order.findById(assignment.order).populate("user");
    if (!order) {
      return res.status(400).json({ message: "Order not found" });
    }

    // shopOrderId (Sub-order ID) ke zariye sahi shop order dhoondain
    const shopOrder = order.shopOrders.find(
      (so) => so._id.toString() === assignment.shopOrderId.toString()
    );

    if (!shopOrder) {
      return res.status(400).json({ message: "Internal error: Shop order not found inside main order" });
    }

    shopOrder.assignedDeliveryBoy = req.userId;
    await order.save();

    const statusPayload = {
      orderId: order._id,
      shopOrderId: shopOrder._id,
      status: shopOrder.status,
      assignedDeliveryBoy: req.userId,
      message: "A delivery rider has accepted your order.",
    };

    io.to(String(order._id)).emit(`orderStatusUpdated-${order._id}`, statusPayload);

    if (order.user?.socketId) {
      io.to(order.user.socketId).emit("orderStatusUpdated", statusPayload);
    }

    return res.status(200).json({
      message: "Order accepted successfully",
    });

  } catch (error) {
    return res.status(500).json({ message: `Accept order error: ${error.message}` });
  }
};

export const getCurrentOrder = async (req, res) => {
  try {
    const assignment = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: "assigned",
    })
      .populate("shop", "name")
      .populate("assignedTo", "fullName email mobile location")
      .populate({
        path: "order",
        populate: [{ path: "user", select: "fullName email location mobile" }],
      });

    if (!assignment || !assignment.order) {
      return res.status(200).json(null);
    }
    const shopOrder = assignment.order.shopOrders.find(
      (so) => String(so._id) == String(assignment.shopOrderId),
    );
    if (!shopOrder) {
      return res.status(200).json(null);
    }
    let deliveryBoyLocation = { lat: null, lon: null };
    if (assignment.assignedTo.location.coordinates.length == 2) {
      deliveryBoyLocation.lat = assignment.assignedTo.location.coordinates[1];
      deliveryBoyLocation.lon = assignment.assignedTo.location.coordinates[0];
    }

    let customerLocation = { lat: null, lon: null };
    if (assignment.order.deliveryAddress) {
      customerLocation.lat = assignment.order.deliveryAddress.latitude;
      customerLocation.lon = assignment.order.deliveryAddress.longitude;
    }

    return res.status(200).json({
      _id: assignment.order._id,
      user: assignment.order.user,
      shopOrder,
      deliveryAddress: assignment.order.deliveryAddress,
      deliveryBoyLocation,
      customerLocation,
      assignedDeliveryBoy: assignment.assignedTo,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `current order error ${error.message}` });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("user")
      .populate({
        path: "shopOrders.shop",
        model: "Shop",
      })
      .populate({
        path: "shopOrders.shopOrderItems.item",
        model: "Item",
      })
      .populate({
        path: "shopOrders.assignedDeliveryBoy",
        select: "fullName mobile location",
      })
      .lean();

    if (!order) {
      return res.status(400).json({ message: "order not found" });
    }
    return res.status(200).json(order);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `get by id order error ${error.message}` });
  }
};

export const sendDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId } = req.body;

    const order = await Order.findById(orderId).populate("user");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const shopOrder = order.shopOrders.id(shopOrderId);

    if (!shopOrder) {
      return res.status(404).json({ message: "Shop order not found" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    shopOrder.deliveryOtp = otp;
    shopOrder.otpExpires = Date.now() + 5 * 60 * 1000;

    await order.save();

    await sendDeliveryOtpMail(order.user, otp);

    return res.status(200).json({
      message: `OTP sent successfully to ${order.user.fullName}`,
    });
  } catch (error) {
    console.error("OTP Error:", error);
    return res
      .status(500)
      .json({ message: `Delivery OTP error: ${error.message}` });
  }
};

export const verifyDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId, otp } = req.body;
    const io = req.app.get("io");

    const order = await Order.findById(orderId).populate("user");

    const shopOrder = order?.shopOrders.id(shopOrderId);

    if (!order || !shopOrder) {
      return res
        .status(400)
        .json({ message: "Invalid order or shop order ID" });
    }

    if (
      shopOrder.deliveryOtp !== otp ||
      !shopOrder.otpExpires ||
      shopOrder.otpExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or Expired OTP" });
    }

    shopOrder.status = "delivered";
    shopOrder.deliveredAt = Date.now();
    shopOrder.deliveryOtp = null;
    shopOrder.otpExpires = null;

    await order.save();

    const statusPayload = {
      orderId,
      shopOrderId,
      status: "delivered",
      deliveredAt: shopOrder.deliveredAt,
      message: "Your order has been delivered successfully.",
    };

    await DeliveryAssignment.findOneAndUpdate(
      {
        shopOrderId: shopOrderId,
        order: orderId,
        assignedTo: shopOrder.assignedDeliveryBoy,
      },
      {
        status: "completed",
      },
    );

    io.to(orderId).emit(`orderStatusUpdated-${orderId}`, statusPayload);

    if (order.user?.socketId) {
      io.to(order.user.socketId).emit("orderStatusUpdated", statusPayload);
    }

    return res.status(200).json({ message: "Order delivered successfully!" });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res
      .status(500)
      .json({ message: `Verify OTP error: ${error.message}` });
  }
};

export const getTodayDeliveries = async (req, res) => {
  try {
    const deliveryBoyId = req.userId; // Middleware se user ID lein
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // 1. Database se aaj ki delivered orders nikaalein
    const orders = await Order.find({
      "shopOrders.assignedDeliveryBoy": deliveryBoyId,
      "shopOrders.status": "delivered",
      "shopOrders.deliveredAt": { $gte: startOfDay }
    }).lean();

    let todayDeliveries = [];

    // 2. Sirf wo shopOrders filter karein jo is delivery boy ke hain
    orders.forEach(order => {
      order.shopOrders.forEach(shopOrder => {
        if (
          shopOrder.assignedDeliveryBoy?.toString() === deliveryBoyId.toString() &&
          shopOrder.status === "delivered" &&
          new Date(shopOrder.deliveredAt) >= startOfDay
        ) {
          todayDeliveries.push(shopOrder);
        }
      });
    });

    // 3. Hourly stats banayein
    let stats = {};
    todayDeliveries.forEach(shopOrder => {
      const hour = new Date(shopOrder.deliveredAt).getHours();
      stats[hour] = (stats[hour] || 0) + 1;
    });

    // 4. Format for Recharts
    let formattedStats = Object.keys(stats).map(hour => ({
      hour: parseInt(hour),
      count: stats[hour]
    }));

    // Sorting by hour
    formattedStats.sort((a, b) => a.hour - b.hour);

    return res.status(200).json(formattedStats);

  } catch (error) {
    return res.status(500).json({ message: `today delivery error: ${error.message}` });
  }
};
