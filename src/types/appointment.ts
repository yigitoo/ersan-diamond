export type ServiceType = "IN_STORE" | "VIDEO_CALL" | "SOURCING";
export type AppointmentStatus = "PENDING" | "CONFIRMED" | "RESCHEDULED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";

export interface IAppointment {
  _id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceType: ServiceType;
  datetimeStart: Date;
  datetimeEnd: Date;
  status: AppointmentStatus;
  assignedUserId?: string;
  notes: string;
  relatedProductId?: string;
  calendarEventId?: string;
  reminderSent24h: boolean;
  reminderSent2h: boolean;
  createdAt: Date;
  updatedAt: Date;
}
