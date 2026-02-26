import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { getSessionUser } from "@/lib/auth";
import { hasPermission } from "@/lib/auth/rbac";
import Appointment from "@/lib/db/models/appointment";
import CalendarEvent from "@/lib/db/models/calendar-event";
import User from "@/lib/db/models/user";
import { updateAppointmentSchema } from "@/lib/validations/appointment";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { logCrud } from "@/lib/audit";
import { sendEmail } from "@/lib/email/smtp";
import { appointmentConfirmed, appointmentCancelled, appointmentRescheduled } from "@/lib/email/templates/appointment";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse("Unauthorized", 401);

    await connectDB();
    const { id } = await params;
    const appointment = await Appointment.findById(id)
      .populate("assignedUserId", "name email")
      .lean();

    if (!appointment) return errorResponse("Randevu bulunamadı", 404);

    return successResponse(appointment);
  } catch (error) {
    return errorResponse("Randevu yüklenemedi", 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user || !hasPermission(user.role, "appointments:manage")) {
      return errorResponse("Unauthorized", 403);
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const parsed = updateAppointmentSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || "Geçersiz veri", 400);
    }

    const before = await Appointment.findById(id).lean();
    if (!before) return errorResponse("Randevu bulunamadı", 404);

    const updated = await Appointment.findByIdAndUpdate(id, parsed.data, { new: true }).lean();

    await logCrud(user.id, user.role, "update", "Appointment", id, {
      before: { status: before.status } as Record<string, unknown>,
      after: parsed.data as Record<string, unknown>,
    });

    // Send status change emails
    if (parsed.data.status && parsed.data.status !== before.status) {
      try {
        let repName = "Ersan Diamond Concierge";
        if (updated!.assignedUserId) {
          const rep = await User.findById(updated!.assignedUserId).lean();
          if (rep) repName = rep.signatureName || rep.name;
        }

        const emailData = {
          customerName: updated!.customerName,
          serviceType: updated!.serviceType,
          date: updated!.datetimeStart,
          salesRepName: repName,
          appointmentId: id,
          newDate: parsed.data.datetimeStart ? new Date(parsed.data.datetimeStart) : undefined,
        };

        let template;
        if (parsed.data.status === "CONFIRMED") template = appointmentConfirmed(emailData);
        else if (parsed.data.status === "CANCELLED") template = appointmentCancelled(emailData);
        else if (parsed.data.status === "RESCHEDULED") template = appointmentRescheduled(emailData);

        if (template) {
          await sendEmail({
            to: updated!.customerEmail,
            subject: template.subject,
            html: template.html,
          });
        }
      } catch (emailErr) {
        console.error("[API] Appointment status email failed:", emailErr);
      }
    }

    return successResponse(updated);
  } catch (error) {
    return errorResponse("Randevu güncellenemedi", 500);
  }
}
