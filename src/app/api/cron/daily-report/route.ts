import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Sale, Lead, Appointment } from "@/lib/db/models";
import { sendEmail } from "@/lib/email/smtp";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { formatDate, formatTime, formatPrice } from "@/lib/utils/formatters";
import { SERVICE_TYPE_LABELS, enLabel } from "@/lib/utils/constants";

export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    await connectDB();

    // Yesterday's date range
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    // Fetch data
    const [sales, newLeads, appointments, cancellations] = await Promise.all([
      Sale.find({ soldAt: { $gte: yesterday, $lt: today } })
        .populate("productId", "brand model reference year")
        .populate("salesRepId", "name")
        .lean(),
      Lead.find({ createdAt: { $gte: yesterday, $lt: today } })
        .populate("assignedUserId", "name")
        .lean(),
      Appointment.find({
        datetimeStart: { $gte: yesterday, $lt: today },
        status: { $in: ["COMPLETED", "CONFIRMED", "CANCELLED", "RESCHEDULED", "NO_SHOW"] },
      }).lean(),
      Appointment.countDocuments({
        datetimeStart: { $gte: yesterday, $lt: today },
        status: "CANCELLED",
      }),
    ]);

    const totalRevenue = sales.reduce((sum, s) => sum + s.salePrice, 0);
    const dateStr = formatDate(yesterday);

    // Build HTML report inline (no pdfmake — avoids timeout)
    const salesRows = sales.map((s: any) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #333;">${s.productId?.brand || ""} ${s.productId?.model || ""}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #333;">${s.productId?.reference || ""}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #333;">${formatPrice(s.salePrice, s.currency)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #333;">${s.buyerName || ""}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #333;">${s.salesRepId?.name || ""}</td>
      </tr>
    `).join("");

    const leadRows = newLeads.map((l: any) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #333;">${l.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #333;">${l.type}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #333;">${l.email || ""}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #333;">${l.phone || ""}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #333;">${l.source}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #333;">${l.assignedUserId?.name || "—"}</td>
      </tr>
    `).join("");

    const appointmentRows = appointments.map((a: any) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #333;">${a.customerName}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #333;">${enLabel(SERVICE_TYPE_LABELS[a.serviceType]) || a.serviceType}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #333;">${a.status}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #333;">${formatTime(a.datetimeStart)}</td>
      </tr>
    `).join("");

    const html = `
    <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;background:#0a0a0a;color:#e5e5e5;padding:32px;">
      <div style="text-align:center;margin-bottom:32px;">
        <h1 style="color:#C9A84C;font-size:24px;margin:0;">ERSAN DIAMOND</h1>
        <p style="color:#888;font-size:14px;margin:8px 0 0;">Daily Report — ${dateStr}</p>
      </div>

      <!-- KPIs -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
        <tr>
          <td style="background:#1a1a1a;border:1px solid #333;border-radius:4px;padding:20px;text-align:center;width:25%;">
            <div style="font-size:28px;font-weight:bold;color:#C9A84C;">${sales.length}</div>
            <div style="font-size:12px;color:#888;text-transform:uppercase;margin-top:4px;">Sales</div>
          </td>
          <td style="width:8px;"></td>
          <td style="background:#1a1a1a;border:1px solid #333;border-radius:4px;padding:20px;text-align:center;width:25%;">
            <div style="font-size:28px;font-weight:bold;color:#C9A84C;">${formatPrice(totalRevenue)}</div>
            <div style="font-size:12px;color:#888;text-transform:uppercase;margin-top:4px;">Revenue</div>
          </td>
          <td style="width:8px;"></td>
          <td style="background:#1a1a1a;border:1px solid #333;border-radius:4px;padding:20px;text-align:center;width:25%;">
            <div style="font-size:28px;font-weight:bold;color:#C9A84C;">${newLeads.length}</div>
            <div style="font-size:12px;color:#888;text-transform:uppercase;margin-top:4px;">New Leads</div>
          </td>
          <td style="width:8px;"></td>
          <td style="background:#1a1a1a;border:1px solid #333;border-radius:4px;padding:20px;text-align:center;width:25%;">
            <div style="font-size:28px;font-weight:bold;color:#C9A84C;">${appointments.length}</div>
            <div style="font-size:12px;color:#888;text-transform:uppercase;margin-top:4px;">Appointments</div>
          </td>
        </tr>
      </table>

      ${cancellations > 0 ? `<p style="color:#ef4444;font-size:13px;margin-bottom:24px;">⚠ ${cancellations} cancelled appointment(s) yesterday</p>` : ""}

      <!-- Sales -->
      ${sales.length > 0 ? `
      <h2 style="font-size:16px;color:#C9A84C;border-bottom:1px solid #333;padding-bottom:8px;margin-bottom:12px;">Sales</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;margin-bottom:32px;">
        <tr style="color:#888;text-transform:uppercase;font-size:11px;">
          <td style="padding:8px 12px;border-bottom:1px solid #444;">Product</td>
          <td style="padding:8px 12px;border-bottom:1px solid #444;">Reference</td>
          <td style="padding:8px 12px;border-bottom:1px solid #444;">Price</td>
          <td style="padding:8px 12px;border-bottom:1px solid #444;">Buyer</td>
          <td style="padding:8px 12px;border-bottom:1px solid #444;">Rep</td>
        </tr>
        ${salesRows}
      </table>
      ` : ""}

      <!-- New Leads -->
      ${newLeads.length > 0 ? `
      <h2 style="font-size:16px;color:#C9A84C;border-bottom:1px solid #333;padding-bottom:8px;margin-bottom:12px;">New Leads</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;margin-bottom:32px;">
        <tr style="color:#888;text-transform:uppercase;font-size:11px;">
          <td style="padding:8px 12px;border-bottom:1px solid #444;">Name</td>
          <td style="padding:8px 12px;border-bottom:1px solid #444;">Type</td>
          <td style="padding:8px 12px;border-bottom:1px solid #444;">Email</td>
          <td style="padding:8px 12px;border-bottom:1px solid #444;">Phone</td>
          <td style="padding:8px 12px;border-bottom:1px solid #444;">Source</td>
          <td style="padding:8px 12px;border-bottom:1px solid #444;">Assigned</td>
        </tr>
        ${leadRows}
      </table>
      ` : ""}

      <!-- Appointments -->
      ${appointments.length > 0 ? `
      <h2 style="font-size:16px;color:#C9A84C;border-bottom:1px solid #333;padding-bottom:8px;margin-bottom:12px;">Appointments</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;margin-bottom:32px;">
        <tr style="color:#888;text-transform:uppercase;font-size:11px;">
          <td style="padding:8px 12px;border-bottom:1px solid #444;">Customer</td>
          <td style="padding:8px 12px;border-bottom:1px solid #444;">Service</td>
          <td style="padding:8px 12px;border-bottom:1px solid #444;">Status</td>
          <td style="padding:8px 12px;border-bottom:1px solid #444;">Time</td>
        </tr>
        ${appointmentRows}
      </table>
      ` : ""}

      <div style="text-align:center;margin-top:32px;padding-top:16px;border-top:1px solid #333;">
        <p style="color:#666;font-size:11px;">Ersan Diamond — Automated Daily Report</p>
      </div>
    </div>
    `;

    const adminEmail = process.env.ADMIN_EMAIL || "ersan@ersandiamond.com";

    await sendEmail({
      to: adminEmail,
      subject: `Ersan Diamond — Daily Report ${dateStr}`,
      html,
    });

    return successResponse({ sent: true, date: dateStr, sales: sales.length, leads: newLeads.length });
  } catch (error) {
    console.error("[Cron] Daily report failed:", error);
    return errorResponse("Daily report failed", 500);
  }
}
