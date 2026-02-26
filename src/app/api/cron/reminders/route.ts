import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Appointment, User } from "@/lib/db/models";
import { sendTemplatedEmail } from "@/lib/email/smtp";
import { EMAIL_TEMPLATES } from "@/lib/email/templates";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { formatDate, formatTime } from "@/lib/utils/formatters";
import { SERVICE_TYPE_LABELS } from "@/lib/utils/constants";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    await connectDB();

    const now = new Date();
    let sent24h = 0;
    let sent2h = 0;

    // 24h reminders
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in23h = new Date(now.getTime() + 23 * 60 * 60 * 1000);

    const appointments24h = await Appointment.find({
      status: "CONFIRMED",
      reminderSent24h: false,
      datetimeStart: { $gte: in23h, $lte: in24h },
    });

    for (const appt of appointments24h) {
      const rep = appt.assignedUserId
        ? await User.findById(appt.assignedUserId).lean()
        : null;

      const template = EMAIL_TEMPLATES["reminder-24h"];
      await sendTemplatedEmail(
        appt.customerEmail,
        template.subject,
        template.html,
        {
          customerName: appt.customerName,
          salesRepName: rep?.signatureName || "Ersan Diamond Team",
          signatureTitle: rep?.signatureTitle || "Concierge",
          phoneInternal: rep?.phoneInternal || "",
          date: formatDate(appt.datetimeStart),
          time: formatTime(appt.datetimeStart),
          serviceType: SERVICE_TYPE_LABELS[appt.serviceType] || appt.serviceType,
        }
      );

      await Appointment.findByIdAndUpdate(appt._id, { reminderSent24h: true });
      sent24h++;
    }

    // 2h reminders
    const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const in1h = new Date(now.getTime() + 1 * 60 * 60 * 1000);

    const appointments2h = await Appointment.find({
      status: "CONFIRMED",
      reminderSent2h: false,
      datetimeStart: { $gte: in1h, $lte: in2h },
    });

    for (const appt of appointments2h) {
      const template = EMAIL_TEMPLATES["reminder-2h"];
      await sendTemplatedEmail(
        appt.customerEmail,
        template.subject,
        template.html,
        {
          customerName: appt.customerName,
          salesRepName: "Ersan Diamond Team",
          signatureTitle: "Concierge",
          phoneInternal: "",
          time: formatTime(appt.datetimeStart),
          serviceType: SERVICE_TYPE_LABELS[appt.serviceType] || appt.serviceType,
        }
      );

      await Appointment.findByIdAndUpdate(appt._id, { reminderSent2h: true });
      sent2h++;
    }

    return successResponse({ sent24h, sent2h });
  } catch (error) {
    console.error("[Cron] Reminders failed:", error);
    return errorResponse("Reminders failed", 500);
  }
}
