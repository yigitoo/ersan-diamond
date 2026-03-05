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
  | "SETTINGS:permission_change"
  // Logistics
  | "LOGISTICS:delivery_created"
  | "LOGISTICS:delivery_updated"
  | "LOGISTICS:status_changed"
  | "LOGISTICS:courier_assigned"
  | "LOGISTICS:auto_assigned"
  | "LOGISTICS:location_updated"
  // Mail
  | "MAIL:thread_starred"
  | "MAIL:thread_unstarred"
  | "MAIL:thread_trashed"
  | "MAIL:thread_restored"
  | "MAIL:thread_deleted"
  | "MAIL:thread_archived"
  | "MAIL:thread_closed"
  | "MAIL:thread_opened"
  // Auth OTP
  | "AUTH:otp_sent"
  | "AUTH:otp_verified"
  | "AUTH:otp_failed";

export type AuditEntityType =
  | "Product"
  | "Lead"
  | "Appointment"
  | "Sale"
  | "User"
  | "EmailThread"
  | "Email"
  | "CalendarEvent"
  | "Delivery";

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
