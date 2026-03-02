import mongoose, { Schema, model, models } from "mongoose";
import type { IDelivery } from "@/types";

const addressSubSchema = new Schema(
  {
    label: { type: String, default: "" },
    street: { type: String, default: "" },
    district: { type: String },
    city: { type: String, required: true },
    country: { type: String, default: "Türkiye" },
    postalCode: { type: String },
    notes: { type: String },
  },
  { _id: false }
);

const statusEntrySchema = new Schema(
  {
    status: {
      type: String,
      enum: ["PENDING", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "CANCELLED"],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
    note: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { _id: false }
);

const courierLocationSchema = new Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const deliverySchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    saleId: { type: Schema.Types.ObjectId, ref: "Sale" },
    courierId: { type: Schema.Types.ObjectId, ref: "User" },
    createdById: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["PENDING", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "CANCELLED"],
      default: "PENDING",
    },
    priority: {
      type: String,
      enum: ["NORMAL", "HIGH", "URGENT"],
      default: "NORMAL",
    },
    scheduledDate: { type: Date, required: true },
    timeSlot: {
      type: String,
      enum: ["MORNING", "AFTERNOON", "EVENING", "FLEXIBLE"],
      default: "FLEXIBLE",
    },
    recipientName: { type: String, required: true },
    recipientPhone: { type: String, required: true },
    recipientEmail: { type: String },
    pickupAddress: { type: addressSubSchema, required: true },
    deliveryAddress: { type: addressSubSchema, required: true },
    adminNotes: { type: String, default: "" },
    courierNotes: { type: String, default: "" },
    specialInstructions: { type: String, default: "" },
    courierLocation: { type: courierLocationSchema },
    statusHistory: [statusEntrySchema],
    deliveredAt: { type: Date },
    proofOfDelivery: { type: String },
  },
  { timestamps: true }
);

deliverySchema.index({ scheduledDate: 1, status: 1 });
deliverySchema.index({ courierId: 1, scheduledDate: 1 });
deliverySchema.index({ status: 1 });
deliverySchema.index({ createdAt: -1 });

export default (models.Delivery as mongoose.Model<IDelivery>) ||
  model<IDelivery>("Delivery", deliverySchema);
