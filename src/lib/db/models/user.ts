import mongoose, { Schema, model, models } from "mongoose";
import type { IUser } from "@/types";

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["OWNER", "ADMIN", "SALES", "VIEWER"],
      default: "SALES",
    },
    active: { type: Boolean, default: true },
    signatureName: { type: String, default: "" },
    signatureTitle: { type: String, default: "" },
    phoneInternal: { type: String, default: "" },
    avatar: { type: String },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });

export default (models.User as mongoose.Model<IUser>) || model<IUser>("User", userSchema);
