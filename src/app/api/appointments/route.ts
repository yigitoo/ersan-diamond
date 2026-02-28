import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { getSessionUser } from "@/lib/auth";
import Appointment from "@/lib/db/models/appointment";
import CalendarEvent from "@/lib/db/models/calendar-event";
import User from "@/lib/db/models/user";
import { createAppointmentSchema } from "@/lib/validations/appointment";
import { successResponse, errorResponse, paginatedResponse, parseSearchParams } from "@/lib/utils/api-response";
import { sendEmail } from "@/lib/email/smtp";
import { sendSms } from "@/lib/sms/httpsms";
import { smsTemplates } from "@/lib/sms/templates";
import { appointmentReceived, newAppointmentNotifyOwner } from "@/lib/email/templates/appointment";
import { SLOT_DURATION_MINUTES } from "@/lib/utils/constants";
import { logCrud } from "@/lib/audit/logger";

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

    // Audit log
    logCrud("system", "PUBLIC", "create", "Appointment", appointment._id.toString(), { route: "/api/appointments" }).catch(() => {});

    // Determine ownerUserId for calendar event
    let calendarOwner = appointment.assignedUserId;
    if (!calendarOwner) {
      const owner = await User.findOne({ role: "OWNER", active: true }).select("_id").lean();
      calendarOwner = owner?._id;
    }

    // Create calendar event with ownerUserId
    const calendarEvent = await CalendarEvent.create({
      appointmentId: appointment._id,
      ownerUserId: calendarOwner,
      title: `${data.customerName} - ${data.serviceType}`,
      start: datetimeStart,
      end: datetimeEnd,
      type: "APPOINTMENT",
    });

    // Write back calendarEventId to appointment
    await Appointment.findByIdAndUpdate(appointment._id, { calendarEventId: calendarEvent._id });

    // Send confirmation email + SMS (fire and forget)
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

      if (data.customerPhone) {
        const { formatDateTime } = await import("@/lib/utils/formatters");
        await sendSms({
          to: data.customerPhone,
          content: smsTemplates.appointmentReceived(data.customerName, formatDateTime(datetimeStart)),
        });
      }
    } catch (emailError) {
      console.error("[API] Appointment notification failed:", emailError);
    }

    // Notify owner (Ersan bey)
    try {
      const ownerUser = await User.findOne({ role: "OWNER", active: true }).select("email phoneInternal").lean();
      if (ownerUser) {
        const ownerEmail = newAppointmentNotifyOwner({
          customerName: data.customerName,
          serviceType: data.serviceType,
          date: datetimeStart,
          appointmentId: appointment._id.toString(),
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail,
        });
        if ((ownerUser as any).email) {
          await sendEmail({ to: (ownerUser as any).email, subject: ownerEmail.subject, html: ownerEmail.html });
        }
        const adminPhone = process.env.ADMIN_PHONE || (ownerUser as any).phoneInternal;
        if (adminPhone) {
          const { formatDateTime } = await import("@/lib/utils/formatters");
          await sendSms({ to: adminPhone, content: smsTemplates.newAppointmentOwner(data.customerName, formatDateTime(datetimeStart)) });
        }
      }
    } catch (ownerNotifError) {
      console.error("[API] Owner appointment notification failed:", ownerNotifError);
    }

    return successResponse(appointment, 201);
  } catch (error) {
    console.error("[API] Appointment create error:", error);
    return errorResponse("Randevu oluşturulurken hata oluştu", 500);
  }
}
