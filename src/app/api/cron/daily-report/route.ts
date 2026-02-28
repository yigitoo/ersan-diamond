import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Sale, Lead, Appointment, Product, User } from "@/lib/db/models";
import { buildDailyReportDefinition } from "@/lib/pdf/daily-report";
import { sendEmail } from "@/lib/email/smtp";
import { EMAIL_TEMPLATES } from "@/lib/email/templates";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { formatDate, formatTime, formatPrice } from "@/lib/utils/formatters";
import { SERVICE_TYPE_LABELS, enLabel } from "@/lib/utils/constants";

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
        .populate("productId", "brand model reference year images")
        .populate("salesRepId", "name signatureName")
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

    // Build PDF data
    const reportData = {
      date: dateStr,
      kpis: {
        salesCount: sales.length,
        totalRevenue,
        newLeads: newLeads.length,
        appointments: appointments.length,
        cancellations,
      },
      sales: sales.map((s: any) => ({
        brand: s.productId?.brand || "",
        model: s.productId?.model || "",
        reference: s.productId?.reference || "",
        year: s.productId?.year,
        salePrice: s.salePrice,
        currency: s.currency,
        buyerName: s.buyerName,
        buyerPhone: s.buyerPhone,
        buyerEmail: s.buyerEmail,
        salesRepName: s.salesRepId?.name || "",
        soldAt: s.soldAt.toISOString(),
      })),
      newLeads: newLeads.map((l: any) => ({
        type: l.type,
        name: l.name,
        email: l.email,
        phone: l.phone,
        source: l.source,
        assignedTo: l.assignedUserId?.name || "",
      })),
      appointments: appointments.map((a: any) => ({
        customerName: a.customerName,
        serviceType: enLabel(SERVICE_TYPE_LABELS[a.serviceType]) || a.serviceType,
        status: a.status,
        time: formatTime(a.datetimeStart),
      })),
      inventoryChanges: [], // TODO: track from audit logs
    };

    // Generate PDF with pdfmake
    const pdfMake = (await import("pdfmake/build/pdfmake")).default;
    const pdfFonts = (await import("pdfmake/build/vfs_fonts")) as any;
    (pdfMake as any).vfs = pdfFonts?.default?.pdfMake?.vfs ?? pdfFonts?.pdfMake?.vfs ?? pdfFonts?.default?.vfs ?? {};

    const docDefinition = buildDailyReportDefinition(reportData);

    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      const pdfDoc = (pdfMake as any).createPdf(docDefinition);
      pdfDoc.getBuffer((buffer: Uint8Array) => {
        resolve(Buffer.from(buffer));
      });
    });

    // Send email with PDF attachment
    const template = EMAIL_TEMPLATES["daily-report"];
    const adminEmail = process.env.ADMIN_EMAIL || "ersan@ersandiamond.com";

    await sendEmail({
      to: adminEmail,
      subject: template.subject.replace("{date}", dateStr),
      html: template.html
        .replace(/\{date\}/g, dateStr)
        .replace("{salesCount}", String(sales.length))
        .replace("{totalRevenue}", formatPrice(totalRevenue))
        .replace("{newLeads}", String(newLeads.length))
        .replace("{appointments}", String(appointments.length))
        .replace("{salesRepName}", "Sistem")
        .replace("{signatureTitle}", "")
        .replace("{phoneInternal}", ""),
      attachments: [
        {
          filename: `ersan-diamond-report-${dateStr}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    return successResponse({ sent: true, date: dateStr, sales: sales.length, leads: newLeads.length });
  } catch (error) {
    console.error("[Cron] Daily report failed:", error);
    return errorResponse("Daily report failed", 500);
  }
}
