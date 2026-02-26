import mongoose, { Schema, model, models } from "mongoose";
import type { IEmail } from "@/types";

const attachmentMetaSchema = new Schema(
  {
    filename: { type: String },
    contentType: { type: String },
    size: { type: Number },
    url: { type: String },
  },
  { _id: false }
);

const emailSchema = new Schema(
  {
    threadId: { type: Schema.Types.ObjectId, ref: "EmailThread", required: true },
    direction: { type: String, enum: ["INBOUND", "OUTBOUND"], required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    cc: { type: String },
    subject: { type: String, required: true },
    html: { type: String, default: "" },
    text: { type: String, default: "" },
    sentAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["SENT", "FAILED", "RECEIVED"],
      default: "SENT",
    },
    sentByUserId: { type: Schema.Types.ObjectId, ref: "User" },
    templateId: { type: String },
    providerMessageId: { type: String, unique: true, sparse: true },
    attachmentsMeta: [attachmentMetaSchema],
  },
  { timestamps: true }
);

emailSchema.index({ threadId: 1, sentAt: 1 });

export default (models.Email as mongoose.Model<IEmail>) || model<IEmail>("Email", emailSchema);
