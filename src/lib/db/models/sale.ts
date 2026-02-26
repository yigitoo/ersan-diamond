import mongoose, { Schema, model, models } from "mongoose";
import type { ISale } from "@/types";

const saleSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    buyerName: { type: String, required: true },
    buyerPhone: { type: String, default: "" },
    buyerEmail: { type: String, default: "", lowercase: true, trim: true },
    buyerCity: { type: String },
    buyerCountry: { type: String },
    salePrice: { type: Number, required: true },
    currency: { type: String, default: "EUR" },
    paymentMethod: {
      type: String,
      enum: ["CASH", "TRANSFER", "CARD", "CRYPTO", "OTHER"],
      default: "CASH",
    },
    soldAt: { type: Date, required: true },
    salesRepId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    notes: { type: String, default: "" },
    attachments: [{ type: String }],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

saleSchema.index({ createdAt: -1 });
saleSchema.index({ productId: 1 });
saleSchema.index({ salesRepId: 1 });

export default (models.Sale as mongoose.Model<ISale>) || model<ISale>("Sale", saleSchema);
