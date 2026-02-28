import mongoose, { Schema, model, models } from "mongoose";
import type { IEmailThread } from "@/types";

const emailThreadSchema = new Schema(
  {
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, required: true },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead" },
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment" },
    lastMessageAt: { type: Date, default: Date.now },
    messageCount: { type: Number, default: 0 },
    status: { type: String, enum: ["OPEN", "ARCHIVED", "CLOSED"], default: "OPEN" },
    unread: { type: Boolean, default: true },
  },
  { timestamps: true }
);

emailThreadSchema.index({ customerEmail: 1 });
emailThreadSchema.index({ lastMessageAt: -1 });
emailThreadSchema.index({ leadId: 1 });
emailThreadSchema.index({ appointmentId: 1 });
emailThreadSchema.index({ status: 1 });

export default (models.EmailThread as mongoose.Model<IEmailThread>) ||
  model<IEmailThread>("EmailThread", emailThreadSchema);
