export type CalendarEventType = "APPOINTMENT" | "BLOCKED" | "PERSONAL";

export interface ICalendarEvent {
  _id: string;
  ownerUserId: string;
  appointmentId?: string;
  title: string;
  start: Date;
  end: Date;
  type: CalendarEventType;
  location?: string;
  notes?: string;
  createdAt: Date;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

export interface BusinessHours {
  dayOfWeek: number; // 0=Sunday, 1=Monday, ...6=Saturday
  open: string; // "10:00"
  close: string; // "19:00"
  closed: boolean;
}
