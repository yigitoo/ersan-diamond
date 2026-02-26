import { connectDB } from "@/lib/db/connection";
import Appointment from "@/lib/db/models/appointment";
import CalendarEvent from "@/lib/db/models/calendar-event";
import {
  SLOT_DURATION_MINUTES,
  SLOT_BUFFER_MINUTES,
  DEFAULT_BUSINESS_HOURS,
} from "@/lib/utils/constants";

export interface TimeSlot {
  time: string; // HH:mm
  available: boolean;
}

export async function getAvailableSlots(
  date: Date,
  assignedUserId?: string
): Promise<{ slots: TimeSlot[]; closed: boolean }> {
  const dayOfWeek = date.getDay();
  const businessDay = DEFAULT_BUSINESS_HOURS.find((h) => h.dayOfWeek === dayOfWeek);

  if (!businessDay || businessDay.closed) {
    return { slots: [], closed: true };
  }

  const [openHour, openMin] = businessDay.open.split(":").map(Number);
  const [closeHour, closeMin] = businessDay.close.split(":").map(Number);

  // Generate all possible slots
  const allSlots: string[] = [];
  const slotStep = SLOT_DURATION_MINUTES + SLOT_BUFFER_MINUTES;
  let currentMinutes = openHour * 60 + openMin;
  const endMinutes = closeHour * 60 + closeMin;

  while (currentMinutes + SLOT_DURATION_MINUTES <= endMinutes) {
    const hour = Math.floor(currentMinutes / 60);
    const min = currentMinutes % 60;
    allSlots.push(`${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`);
    currentMinutes += slotStep;
  }

  // Query booked/blocked
  await connectDB();
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const apptFilter: Record<string, unknown> = {
    datetimeStart: { $gte: dayStart, $lte: dayEnd },
    status: { $in: ["PENDING", "CONFIRMED"] },
  };
  if (assignedUserId) apptFilter.assignedUserId = assignedUserId;

  const blockFilter: Record<string, unknown> = {
    start: { $gte: dayStart, $lte: dayEnd },
    type: "BLOCKED",
  };
  if (assignedUserId) blockFilter.ownerUserId = assignedUserId;

  const [appointments, blockedEvents] = await Promise.all([
    Appointment.find(apptFilter).lean(),
    CalendarEvent.find(blockFilter).lean(),
  ]);

  const takenTimes = new Set<string>();
  for (const apt of appointments) {
    const d = new Date(apt.datetimeStart);
    takenTimes.add(
      `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`
    );
  }
  for (const evt of blockedEvents) {
    const d = new Date(evt.start);
    takenTimes.add(
      `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`
    );
  }

  const slots: TimeSlot[] = allSlots.map((time) => ({
    time,
    available: !takenTimes.has(time),
  }));

  return { slots, closed: false };
}

/**
 * Atomic slot booking - prevents double booking via findOneAndUpdate
 */
export async function bookSlot(
  date: Date,
  durationMinutes: number = SLOT_DURATION_MINUTES
): Promise<boolean> {
  await connectDB();

  const datetimeEnd = new Date(date.getTime() + durationMinutes * 60 * 1000);

  // Check for existing appointment in this slot atomically
  const conflict = await Appointment.findOne({
    datetimeStart: { $lt: datetimeEnd },
    datetimeEnd: { $gt: date },
    status: { $in: ["PENDING", "CONFIRMED"] },
  });

  return !conflict;
}
