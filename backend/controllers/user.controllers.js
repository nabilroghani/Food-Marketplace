import User from "../models/user.model.js";
import { sendPromotionBroadcastMail } from "../utils/mail.js";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "userId not found" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Get current user error" });
  }
};

export const updateUserLocation = async (req, res) => {
  try {
    const { lat, lon } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        location: {
          type: "Point",
          coordinates: [lon, lat],
        },
      },
      { new: true }
    );
    if (!user) {
      return res.status(400).json({ message: "user is not found" });
    }
    return res.status(200).json({ message: "location updated" });
  } catch (error) {
    return res.status(500).json({ message: "updated location user error" });
  }
};

export const broadcastPromotion = async (req, res) => {
  try {
    const requester = await User.findById(req.userId);

    if (!requester || !["owner", "admin"].includes(requester.role)) {
      return res.status(403).json({ message: "Not authorized to broadcast promotions." });
    }

    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required." });
    }

    const io = req.app.get("io");
    const users = await User.find({ role: "user" }).select("email");
    const payload = {
      title,
      message,
      createdAt: new Date().toISOString(),
    };

    io.emit("promotionBroadcast", payload);

    await Promise.allSettled(
      users
        .filter((user) => user.email)
        .map((user) =>
          sendPromotionBroadcastMail(user.email, title, message),
        ),
    );

    return res.status(200).json({ message: "Promotion broadcast sent successfully." });
  } catch (error) {
    return res.status(500).json({ message: `broadcast promotion error: ${error.message}` });
  }
};
