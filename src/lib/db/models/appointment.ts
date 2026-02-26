import mongoose, { Schema, model, models } from "mongoose";
import type { IAppointment } from "@/types";

const appointmentSchema = new Schema(
  {
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    serviceType: {
      type: String,
      enum: ["IN_STORE", "VIDEO_CALL", "SOURCING"],
      required: true,
    },
    datetimeStart: { type: Date, required: true },
    datetimeEnd: { type: Date, required: true },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "RESCHEDULED", "CANCELLED", "COMPLETED", "NO_SHOW"],
      default: "PENDING",
    },
    assignedUserId: { type: Schema.Types.ObjectId, ref: "User" },
    notes: { type: String, default: "" },
    relatedProductId: { type: Schema.Types.ObjectId, ref: "Product" },
    calendarEventId: { type: Schema.Types.ObjectId, ref: "CalendarEvent" },
    reminderSent24h: { type: Boolean, default: false },
    reminderSent2h: { type: Boolean, default: false },
  },
  { timestamps: true }
);

appointmentSchema.index({ datetimeStart: 1, status: 1 });
appointmentSchema.index({ assignedUserId: 1, datetimeStart: 1 });
appointmentSchema.index({ customerEmail: 1 });

export default (models.Appointment as mongoose.Model<IAppointment>) ||
  model<IAppointment>("Appointment", appointmentSchema);
