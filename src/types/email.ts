export type EmailDirection = "INBOUND" | "OUTBOUND";
export type EmailStatus = "SENT" | "FAILED" | "RECEIVED";
export type EmailTemplateId =
  | "appointment-received"
  | "appointment-confirmed"
  | "appointment-rescheduled"
  | "appointment-cancelled"
  | "reminder-24h"
  | "reminder-2h"
  | "sell-to-us-received"
  | "inventory-inquiry-received"
  | "daily-report"
  | "sale-receipt";

export type ThreadStatus = "OPEN" | "ARCHIVED" | "CLOSED";

export interface IEmailThread {
  _id: string;
  customerEmail: string;
  subject: string;
  leadId?: string;
  appointmentId?: string;
  lastMessageAt: Date;
  messageCount: number;
  status: ThreadStatus;
  unread: boolean;
  createdAt: Date;
}

export interface AttachmentMeta {
  filename: string;
  contentType: string;
  size: number;
  url?: string;
}

export interface IEmail {
  _id: string;
  threadId: string;
  direction: EmailDirection;
  from: string;
  to: string;
  cc?: string;
  subject: string;
  html: string;
  text: string;
  sentAt: Date;
  status: EmailStatus;
  sentByUserId?: string;
  templateId?: EmailTemplateId;
  providerMessageId?: string;
  attachmentsMeta: AttachmentMeta[];
  createdAt: Date;
}
