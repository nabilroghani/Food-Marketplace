import DeliveryAssignment from "../models/deliveryAssignment.model.js";
import { Order } from "../models/order.model.js";
import { sendOrderDelayMail } from "./mail.js";

const FIVE_MINUTES = 5 * 60 * 1000; //30 * 1000
const FORTY_FIVE_MINUTES = 45 * 60 * 1000;

export const getEstimatedDeliveryTime = (acceptedAt) => {
  const baseTime = acceptedAt ? new Date(acceptedAt).getTime() : Date.now();
  return new Date(baseTime + FORTY_FIVE_MINUTES);
};

export const checkDelayedOrders = async (io) => {
  const assignments = await DeliveryAssignment.find({
    status: "assigned",
    assignedTo: { $ne: null },
  }).populate({
    path: "order",
    populate: [{ path: "user", select: "email socketId fullName" }],
  });

  const now = Date.now();

  for (const assignment of assignments) {
    if (!assignment.order) continue;

    const shopOrder = assignment.order.shopOrders.find(
      (item) => String(item._id) === String(assignment.shopOrderId),
    );

    if (!shopOrder || shopOrder.status !== "out of delivery") continue;

    const stationaryTooLong =
      assignment.lastLocationUpdateAt &&
      now - new Date(assignment.lastLocationUpdateAt).getTime() >= FIVE_MINUTES;
    const etaExceeded =
      assignment.estimatedDeliveryTime &&
      now > new Date(assignment.estimatedDeliveryTime).getTime();

    if (!stationaryTooLong && !etaExceeded) continue;
    if (assignment.delayNotificationSent) continue;

    assignment.delayNotificationSent = true;
    assignment.delayNotifiedAt = new Date();
    await assignment.save();

    const payload = {
      orderId: assignment.order._id,
      shopOrderId: assignment.shopOrderId,
      message: "Your order is slightly delayed due to traffic/high demand.",
    };

    io.to(String(assignment.order._id)).emit("orderDelayed", payload);

    if (assignment.order.user?.socketId) {
      io.to(assignment.order.user.socketId).emit("orderDelayed", payload);
    }

    if (assignment.order.user?.email) {
      await sendOrderDelayMail(assignment.order.user.email);
    }
  }
};
