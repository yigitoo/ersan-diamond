import mongoose, { Schema, model, models } from "mongoose";

export interface IOtp {
  _id: string;
  email: string;
  codeHash: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

const otpSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

otpSchema.index({ email: 1, createdAt: -1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL

export default (models.Otp as mongoose.Model<IOtp>) || model<IOtp>("Otp", otpSchema);
