import mongoose, { Schema, model, models } from "mongoose";
import type { ILead } from "@/types";

const leadSchema = new Schema(
  {
    type: { type: String, enum: ["INQUIRY", "SELL_TO_US", "CHAT"], required: true },
    name: { type: String, required: true },
    phone: { type: String, default: "" },
    email: { type: String, default: "", lowercase: true, trim: true },
    source: {
      type: String,
      enum: ["WEBSITE", "WHATSAPP", "CHATBOT", "REFERRAL", "WALK_IN", "OTHER"],
      default: "WEBSITE",
    },
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"],
      default: "NEW",
    },
    assignedUserId: { type: Schema.Types.ObjectId, ref: "User" },
    relatedProductId: { type: Schema.Types.ObjectId, ref: "Product" },
    threadId: { type: Schema.Types.ObjectId, ref: "EmailThread" },
    tags: [{ type: String }],
    images: [{ type: String }],
    desiredPrice: { type: Number },
    currency: { type: String },
    productBrand: { type: String },
    productModel: { type: String },
    productReference: { type: String },
    productYear: { type: Number },
    productCondition: { type: String },
  },
  { timestamps: true }
);

leadSchema.index({ status: 1, assignedUserId: 1 });
leadSchema.index({ email: 1 });
leadSchema.index({ createdAt: -1 });

export default (models.Lead as mongoose.Model<ILead>) || model<ILead>("Lead", leadSchema);
