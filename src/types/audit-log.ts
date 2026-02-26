export type AuditActionType =
  | "AUTH:login"
  | "AUTH:logout"
  | "AUTH:failed_login"
  | "NAVIGATION:page_view"
  | "CRUD:create"
  | "CRUD:update"
  | "CRUD:delete"
  | "EMAIL:sent"
  | "EMAIL:failed"
  | "FILE:image_upload"
  | "FILE:document_attach"
  | "SETTINGS:role_change"
  | "SETTINGS:permission_change";

export type AuditEntityType =
  | "Product"
  | "Lead"
  | "Appointment"
  | "Sale"
  | "User"
  | "EmailThread"
  | "Email"
  | "CalendarEvent";

export interface IAuditLog {
  _id: string;
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
  createdAt: Date;
}
