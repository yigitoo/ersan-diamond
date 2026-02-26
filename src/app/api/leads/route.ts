import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { getSessionUser } from "@/lib/auth";
import Lead from "@/lib/db/models/lead";
import { createLeadSchema } from "@/lib/validations/lead";
import { successResponse, errorResponse, paginatedResponse, parseSearchParams } from "@/lib/utils/api-response";
import { sendEmail } from "@/lib/email/smtp";
import { sellToUsReceived, inventoryInquiryReceived } from "@/lib/email/templates/lead";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse("Unauthorized", 401);

    await connectDB();
    const { page, limit, sort, order, search, skip } = parseSearchParams(req.nextUrl.searchParams);

    const filter: Record<string, unknown> = {};
    const status = req.nextUrl.searchParams.get("status");
    if (status) filter.status = status;

    const assignedUserId = req.nextUrl.searchParams.get("assignedUserId");
    if (assignedUserId) filter.assignedUserId = assignedUserId;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .sort({ [sort]: order })
        .skip(skip)
        .limit(limit)
        .populate("assignedUserId", "name email")
        .lean(),
      Lead.countDocuments(filter),
    ]);

    return paginatedResponse(leads, total, page, limit);
  } catch (error) {
    console.error("[API] GET /api/leads error:", error);
    return errorResponse("Lead'ler yüklenemedi", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const parsed = createLeadSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || "Geçersiz veri", 400);
    }

    const data = parsed.data;
    const lead = await Lead.create({
      ...data,
      status: "NEW",
    });

    // Send auto-reply email
    try {
      const emailData =
        data.type === "SELL_TO_US"
          ? sellToUsReceived({
              customerName: data.name,
              salesRepName: "Ersan Diamond Concierge",
              leadId: lead._id.toString(),
            })
          : inventoryInquiryReceived({
              customerName: data.name,
              salesRepName: "Ersan Diamond Concierge",
              leadId: lead._id.toString(),
              brand: data.productBrand,
              model: data.productModel,
              reference: data.productReference,
            });

      if (data.email) {
        await sendEmail({
          to: data.email,
          subject: emailData.subject,
          html: emailData.html,
        });
      }
    } catch (emailError) {
      console.error("[API] Lead email failed:", emailError);
    }

    return successResponse(lead, 201);
  } catch (error) {
    console.error("[API] Lead create error:", error);
    return errorResponse("Lead oluşturulurken hata oluştu", 500);
  }
}
