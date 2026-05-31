import mongoose from "mongoose";

const deliveryAssignmentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
    },
    shopOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
    },
    brodcastedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["brodcasted", "assigned", "completed"],
      default: "brodcasted",
    },
    acceptedAt: Date,
    lastKnownLocation: {
      lat: {
        type: Number,
        default: null,
      },
      lon: {
        type: Number,
        default: null,
      },
    },
    lastLocationUpdateAt: {
      type: Date,
      default: null,
    },
    estimatedDeliveryTime: {
      type: Date,
      default: null,
    },
    delayNotificationSent: {
      type: Boolean,
      default: false,
    },
    delayNotifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const DeliveryAssignment = mongoose.model(
  "DeliveryAssignment",
  deliveryAssignmentSchema
);
export default DeliveryAssignment;
