import mongoose, { Schema, model, models } from "mongoose";
import type { IProduct } from "@/types";

const productImageSchema = new Schema(
  {
    url: { type: String },
    alt: { type: String },
    order: { type: Number },
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    category: { type: String, enum: ["WATCH", "HERMES", "JEWELRY"], required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    reference: { type: String, default: "" },
    year: { type: Number },
    condition: {
      type: String,
      enum: ["UNWORN", "EXCELLENT", "VERY_GOOD", "GOOD", "FAIR"],
      default: "EXCELLENT",
    },
    price: { type: Number },
    currency: { type: String, default: "EUR" },
    priceOnRequest: { type: Boolean, default: false },
    availability: {
      type: String,
      enum: ["AVAILABLE", "RESERVED", "SOLD"],
      default: "AVAILABLE",
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    specs: { type: Schema.Types.Mixed, default: {} },
    images: [productImageSchema],
    slug: { type: String, required: true, unique: true },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ category: 1, availability: 1 });
productSchema.index({ brand: 1, model: 1 });
productSchema.index({ featured: 1, createdAt: -1 });
productSchema.index(
  { title: "text", brand: "text", model: "text", description: "text" }
);

export default (models.Product as mongoose.Model<IProduct>) ||
  model<IProduct>("Product", productSchema);
