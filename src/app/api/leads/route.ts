import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { getSessionUser } from "@/lib/auth";
import Lead from "@/lib/db/models/lead";
import User from "@/lib/db/models/user";
import { createLeadSchema } from "@/lib/validations/lead";
import { successResponse, errorResponse, paginatedResponse, parseSearchParams } from "@/lib/utils/api-response";
import { sendEmail } from "@/lib/email/smtp";
import { sendSms } from "@/lib/sms/httpsms";
import { smsTemplates } from "@/lib/sms/templates";
import { sellToUsReceived, inventoryInquiryReceived, contactReceived, newLeadAssigned, newLeadNotifyOwner } from "@/lib/email/templates/lead";
import { autoAssignLead } from "@/lib/leads/auto-assign";
import { logCrud } from "@/lib/audit/logger";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse("Unauthorized", 401);

    await connectDB();
    const { page, limit, sort, order, search, skip } = parseSearchParams(req.nextUrl.searchParams);

    const filter: Record<string, unknown> = {};

    // SALES users only see their assigned leads + unassigned NEW leads
    if (user.role === "SALES") {
      filter.$or = [
        { assignedUserId: user.id },
        { assignedUserId: { $exists: false }, status: "NEW" },
        { assignedUserId: null, status: "NEW" },
      ];
    }

    const status = req.nextUrl.searchParams.get("status");
    if (status) filter.status = status;

    const assignedUserId = req.nextUrl.searchParams.get("assignedUserId");
    if (assignedUserId) filter.assignedUserId = assignedUserId;

    if (search) {
      const searchFilter = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ],
      };
      if (filter.$or) {
        // Combine role-based $or with search $or using $and
        const roleOr = filter.$or;
        delete filter.$or;
        filter.$and = [{ $or: roleOr }, searchFilter];
      } else {
        filter.$or = searchFilter.$or;
      }
    }

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .sort({ [sort]: order })
        .skip(skip)
        .limit(limit)
        .populate("assignedUserId", "name email")
        .populate("relatedProductId", "title brand model slug category")
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

    // Audit log
    logCrud("system", "PUBLIC", "create", "Lead", lead._id.toString(), { route: "/api/leads" }).catch(() => {});

    // Send auto-reply email to customer
    try {
      let emailData: { subject: string; html: string };

      if (data.type === "SELL_TO_US") {
        emailData = sellToUsReceived({
          customerName: data.name,
          salesRepName: "Ersan Diamond Concierge",
          leadId: lead._id.toString(),
        });
      } else if (data.productBrand || data.productModel) {
        // Inquiry with product info → inventory inquiry
        emailData = inventoryInquiryReceived({
          customerName: data.name,
          salesRepName: "Ersan Diamond Concierge",
          leadId: lead._id.toString(),
          brand: data.productBrand,
          model: data.productModel,
          reference: data.productReference,
        });
      } else {
        // General contact form → contact confirmation
        emailData = contactReceived({
          customerName: data.name,
          leadId: lead._id.toString(),
        });
      }

      if (data.email) {
        await sendEmail({
          to: data.email,
          subject: emailData.subject,
          html: emailData.html,
        });
      }

      // Send SMS to customer
      if (data.phone) {
        let smsContent: string;
        if (data.type === "SELL_TO_US") {
          smsContent = smsTemplates.sellToUsReceived(data.name);
        } else if (data.productBrand || data.productModel) {
          const product = [data.productBrand, data.productModel].filter(Boolean).join(" ");
          smsContent = smsTemplates.inventoryInquiryReceived(data.name, product);
        } else {
          smsContent = smsTemplates.contactReceived(data.name);
        }
        await sendSms({ to: data.phone, content: smsContent });
      }
    } catch (emailError) {
      console.error("[API] Lead customer notification failed:", emailError);
    }

    // Auto-assign to sales rep with lowest workload
    try {
      const assignment = await autoAssignLead(lead._id.toString());
      if (assignment) {
        console.log(`[API] Lead ${lead._id} auto-assigned to ${assignment.assignedUserName}`);

        // Notify the assigned sales rep
        try {
          const salesRep = await User.findById(assignment.assignedUserId).select("email name phoneInternal").lean();
          if (salesRep?.email) {
            const notifEmail = newLeadAssigned({
              salesRepName: (salesRep as any).name,
              customerName: data.name,
              customerEmail: data.email || "",
              customerPhone: data.phone,
              leadType: data.type,
              leadId: lead._id.toString(),
              notes: data.notes,
              productBrand: data.productBrand,
              productModel: data.productModel,
            });
            await sendEmail({
              to: (salesRep as any).email,
              subject: notifEmail.subject,
              html: notifEmail.html,
            });

            // SMS to sales rep
            if ((salesRep as any).phoneInternal) {
              await sendSms({
                to: (salesRep as any).phoneInternal,
                content: smsTemplates.newLeadAssigned(data.name, data.type),
              });
            }
          }
        } catch (notifError) {
          console.error("[API] Sales rep notification failed:", notifError);
        }
      }
    } catch (assignError) {
      console.error("[API] Auto-assign failed:", assignError);
    }

    // Notify owner (Ersan bey)
    try {
      const owner = await User.findOne({ role: "OWNER", active: true }).select("email phoneInternal").lean();
      if (owner) {
        const ownerEmail = newLeadNotifyOwner({
          customerName: data.name,
          type: data.type,
          phone: data.phone,
          email: data.email,
          leadId: lead._id.toString(),
          notes: data.notes,
          productBrand: data.productBrand,
          productModel: data.productModel,
        });
        if ((owner as any).email) {
          await sendEmail({ to: (owner as any).email, subject: ownerEmail.subject, html: ownerEmail.html });
        }
        const adminPhone = process.env.ADMIN_PHONE || (owner as any).phoneInternal;
        if (adminPhone) {
          await sendSms({ to: adminPhone, content: smsTemplates.newLeadOwner(data.name, data.type) });
        }
      }
    } catch (ownerNotifError) {
      console.error("[API] Owner notification failed:", ownerNotifError);
    }

    return successResponse(lead, 201);
  } catch (error) {
    console.error("[API] Lead create error:", error);
    return errorResponse("Lead oluşturulurken hata oluştu", 500);
  }
}
