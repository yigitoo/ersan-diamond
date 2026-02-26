import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { getSessionUser } from "@/lib/auth";
import { hasPermission } from "@/lib/auth/rbac";
import CalendarEvent from "@/lib/db/models/calendar-event";
import { createCalendarEventSchema } from "@/lib/validations/calendar";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { logCrud } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse("Unauthorized", 401);

    await connectDB();

    const start = req.nextUrl.searchParams.get("start");
    const end = req.nextUrl.searchParams.get("end");

    if (!start || !end) {
      return errorResponse("start ve end parametreleri gerekli", 400);
    }

    const filter: Record<string, unknown> = {
      start: { $gte: new Date(start) },
      end: { $lte: new Date(end) },
    };

    if (!hasPermission(user.role, "calendar:view_all")) {
      filter.ownerUserId = user.id;
    }

    const userId = req.nextUrl.searchParams.get("userId");
    if (userId && hasPermission(user.role, "calendar:view_all")) {
      filter.ownerUserId = userId;
    }

    const events = await CalendarEvent.find(filter)
      .sort({ start: 1 })
      .populate("appointmentId", "customerName serviceType status")
      .lean();

    return successResponse(events);
  } catch (error) {
    console.error("[API] Calendar error:", error);
    return errorResponse("Takvim yüklenemedi", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !hasPermission(user.role, "calendar:manage")) {
      return errorResponse("Unauthorized", 403);
    }

    await connectDB();
    const body = await req.json();
    const parsed = createCalendarEventSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || "Geçersiz veri", 400);
    }

    const event = await CalendarEvent.create(parsed.data);

    await logCrud(user.id, user.role, "create", "CalendarEvent", event._id.toString());

    return successResponse(event, 201);
  } catch (error) {
    console.error("[API] Calendar create error:", error);
    return errorResponse("Etkinlik oluşturulamadı", 500);
  }
}
