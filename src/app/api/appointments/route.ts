import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { getSessionUser } from "@/lib/auth";
import Appointment from "@/lib/db/models/appointment";
import CalendarEvent from "@/lib/db/models/calendar-event";
import { createAppointmentSchema } from "@/lib/validations/appointment";
import { successResponse, errorResponse, paginatedResponse, parseSearchParams } from "@/lib/utils/api-response";
import { sendEmail } from "@/lib/email/smtp";
import { appointmentReceived } from "@/lib/email/templates/appointment";
import { SLOT_DURATION_MINUTES } from "@/lib/utils/constants";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse("Unauthorized", 401);

    await connectDB();
    const { page, limit, sort, order, skip } = parseSearchParams(req.nextUrl.searchParams);

    const filter: Record<string, unknown> = {};
    const status = req.nextUrl.searchParams.get("status");
    if (status) filter.status = status;

    const assignedUserId = req.nextUrl.searchParams.get("assignedUserId");
    if (assignedUserId) filter.assignedUserId = assignedUserId;

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .sort({ [sort]: order })
        .skip(skip)
        .limit(limit)
        .populate("assignedUserId", "name email")
        .lean(),
      Appointment.countDocuments(filter),
    ]);

    return paginatedResponse(appointments, total, page, limit);
  } catch (error) {
    console.error("[API] GET /api/appointments error:", error);
    return errorResponse("Randevular yüklenemedi", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = createAppointmentSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || "Geçersiz veri", 400);
    }

    const data = parsed.data;
    const datetimeStart = new Date(data.datetimeStart);
    const datetimeEnd = new Date(datetimeStart.getTime() + SLOT_DURATION_MINUTES * 60 * 1000);

    // Check for conflicts (atomic)
    const conflict = await Appointment.findOne({
      datetimeStart: { $lt: datetimeEnd },
      datetimeEnd: { $gt: datetimeStart },
      status: { $in: ["PENDING", "CONFIRMED"] },
    });

    if (conflict) {
      return errorResponse("Bu zaman dilimi dolu. Lütfen başka bir saat seçin.", 409);
    }

    const appointment = await Appointment.create({
      ...data,
      datetimeStart,
      datetimeEnd,
      status: "PENDING",
    });

    // Create calendar event
    await CalendarEvent.create({
      appointmentId: appointment._id,
      title: `${data.customerName} - ${data.serviceType}`,
      start: datetimeStart,
      end: datetimeEnd,
      type: "APPOINTMENT",
    });

    // Send confirmation email (fire and forget)
    try {
      const emailData = appointmentReceived({
        customerName: data.customerName,
        serviceType: data.serviceType,
        date: datetimeStart,
        salesRepName: "Ersan Diamond Concierge",
        appointmentId: appointment._id.toString(),
      });
      await sendEmail({
        to: data.customerEmail,
        subject: emailData.subject,
        html: emailData.html,
      });
    } catch (emailError) {
      console.error("[API] Appointment email failed:", emailError);
    }

    return successResponse(appointment, 201);
  } catch (error) {
    console.error("[API] Appointment create error:", error);
    return errorResponse("Randevu oluşturulurken hata oluştu", 500);
  }
}
