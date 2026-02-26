import mongoose, { Schema, model, models } from "mongoose";
import type { IAuditLog } from "@/types";

const auditLogSchema = new Schema(
  {
    actorUserId: { type: Schema.Types.ObjectId, ref: "User" },
    actorRole: { type: String },
    actionType: { type: String, required: true },
    entityType: { type: String },
    entityId: { type: String },
    route: { type: String },
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actorUserId: 1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ actionType: 1 });
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL

export default (models.AuditLog as mongoose.Model<IAuditLog>) ||
  model<IAuditLog>("AuditLog", auditLogSchema);
