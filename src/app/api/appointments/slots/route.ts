import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import Appointment from "@/lib/db/models/appointment";
import CalendarEvent from "@/lib/db/models/calendar-event";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import {
  SLOT_DURATION_MINUTES,
  SLOT_BUFFER_MINUTES,
  DEFAULT_BUSINESS_HOURS,
} from "@/lib/utils/constants";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const dateStr = req.nextUrl.searchParams.get("date");

    if (!dateStr) {
      return errorResponse("Tarih parametresi gerekli", 400);
    }

    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    const businessDay = DEFAULT_BUSINESS_HOURS.find((h) => h.dayOfWeek === dayOfWeek);

    if (!businessDay || businessDay.closed) {
      return successResponse({ slots: [], closed: true });
    }

    // Generate all possible slots
    const [openHour, openMin] = businessDay.open.split(":").map(Number);
    const [closeHour, closeMin] = businessDay.close.split(":").map(Number);

    const slots: string[] = [];
    const slotStep = SLOT_DURATION_MINUTES + SLOT_BUFFER_MINUTES;

    let currentMinutes = openHour * 60 + openMin;
    const endMinutes = closeHour * 60 + closeMin;

    while (currentMinutes + SLOT_DURATION_MINUTES <= endMinutes) {
      const hour = Math.floor(currentMinutes / 60);
      const min = currentMinutes % 60;
      slots.push(`${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`);
      currentMinutes += slotStep;
    }

    // Get booked appointments for this date
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const [bookedAppointments, blockedEvents] = await Promise.all([
      Appointment.find({
        datetimeStart: { $gte: dayStart, $lte: dayEnd },
        status: { $in: ["PENDING", "CONFIRMED"] },
      }).lean(),
      CalendarEvent.find({
        start: { $gte: dayStart, $lte: dayEnd },
        type: "BLOCKED",
      }).lean(),
    ]);

    // Filter out taken slots
    const takenTimes = new Set<string>();
    for (const apt of bookedAppointments) {
      const h = new Date(apt.datetimeStart).getHours();
      const m = new Date(apt.datetimeStart).getMinutes();
      takenTimes.add(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    }
    for (const evt of blockedEvents) {
      const h = new Date(evt.start).getHours();
      const m = new Date(evt.start).getMinutes();
      takenTimes.add(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    }

    const availableSlots = slots.filter((s) => !takenTimes.has(s));

    return successResponse({ slots: availableSlots, closed: false });
  } catch (error) {
    console.error("[API] Slots error:", error);
    return errorResponse("Slotlar yüklenirken hata oluştu", 500);
  }
}
