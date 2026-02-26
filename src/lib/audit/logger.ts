import { connectDB } from "@/lib/db/connection";
import AuditLog from "@/lib/db/models/audit-log";
import type { AuditActionType, AuditEntityType } from "@/types";

interface AuditLogParams {
  actorUserId: string;
  actorRole: string;
  actionType: AuditActionType;
  entityType?: AuditEntityType;
  entityId?: string;
  route?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    await connectDB();
    await AuditLog.create(params);
  } catch (error) {
    console.error("[AuditLog] Failed to write audit log:", error);
  }
}

export async function logCrud(
  actorUserId: string,
  actorRole: string,
  action: "create" | "update" | "delete",
  entityType: AuditEntityType,
  entityId: string,
  options?: {
    route?: string;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    ip?: string;
    userAgent?: string;
  }
): Promise<void> {
  await logAudit({
    actorUserId,
    actorRole,
    actionType: `CRUD:${action}` as AuditActionType,
    entityType,
    entityId,
    ...options,
  });
}

export async function logAuth(
  action: "login" | "logout" | "failed_login",
  userId: string,
  role: string,
  options?: { ip?: string; userAgent?: string }
): Promise<void> {
  await logAudit({
    actorUserId: userId,
    actorRole: role,
    actionType: `AUTH:${action}` as AuditActionType,
    ...options,
  });
}

export async function logEmail(
  actorUserId: string,
  actorRole: string,
  status: "sent" | "failed",
  entityType: AuditEntityType,
  entityId: string,
  route?: string
): Promise<void> {
  await logAudit({
    actorUserId,
    actorRole,
    actionType: `EMAIL:${status}` as AuditActionType,
    entityType,
    entityId,
    route,
  });
}
