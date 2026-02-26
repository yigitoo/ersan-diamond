import mongoose, { Schema, model, models } from "mongoose";
import type { ICalendarEvent } from "@/types";

const calendarEventSchema = new Schema(
  {
    ownerUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment" },
    title: { type: String, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    type: {
      type: String,
      enum: ["APPOINTMENT", "BLOCKED", "PERSONAL"],
      default: "APPOINTMENT",
    },
    location: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

calendarEventSchema.index({ ownerUserId: 1, start: 1 });
calendarEventSchema.index({ start: 1, end: 1 });

export default (models.CalendarEvent as mongoose.Model<ICalendarEvent>) ||
  model<ICalendarEvent>("CalendarEvent", calendarEventSchema);
