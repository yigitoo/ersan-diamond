import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { getSessionUser } from "@/lib/auth";
import { hasPermission } from "@/lib/auth/rbac";
import { sendEmailSchema } from "@/lib/validations/email";
import { sendEmail } from "@/lib/email/smtp";
import Email from "@/lib/db/models/email";
import EmailThread from "@/lib/db/models/email-thread";
import User from "@/lib/db/models/user";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { logEmail } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !hasPermission(user.role, "mail:send")) {
      return errorResponse("Unauthorized", 403);
    }

    await connectDB();
    const body = await req.json();
    const parsed = sendEmailSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || "Geçersiz veri", 400);
    }

    const data = parsed.data;

    // Get sender info for personalization
    const senderUser = await User.findById(user.id).lean();
    const senderName = senderUser?.signatureName || senderUser?.name || user.name;

    // Find or create thread
    const relatedId = data.relatedLeadId || data.relatedAppointmentId;
    let thread = relatedId
      ? await EmailThread.findOne({
          $or: [{ leadId: relatedId }, { appointmentId: relatedId }],
        })
      : await EmailThread.findOne({ customerEmail: data.to.toLowerCase() }).sort({ lastMessageAt: -1 });

    if (!thread) {
      thread = await EmailThread.create({
        customerEmail: data.to.toLowerCase(),
        subject: data.subject,
        leadId: data.relatedLeadId,
        appointmentId: data.relatedAppointmentId,
        lastMessageAt: new Date(),
        messageCount: 0,
      });
    }

    // Fetch attachment buffers from R2 for SMTP
    const smtpAttachments: Array<{ filename: string; content: Buffer; contentType: string }> = [];
    const attachmentsMeta: Array<{ filename: string; contentType: string; size: number; url: string }> = [];

    if (data.attachments && data.attachments.length > 0) {
      for (const att of data.attachments) {
        try {
          const res = await fetch(att.url);
          if (!res.ok) throw new Error(`Failed to fetch ${att.url}`);
          const buffer = Buffer.from(await res.arrayBuffer());
          smtpAttachments.push({
            filename: att.filename,
            content: buffer,
            contentType: att.contentType,
          });
          attachmentsMeta.push({
            filename: att.filename,
            contentType: att.contentType,
            size: att.size,
            url: att.url,
          });
        } catch (err) {
          console.error("[API] Failed to fetch attachment:", att.filename, err);
        }
      }
    }

    // Send email
    const result = await sendEmail({
      to: data.to,
      subject: data.subject,
      html: data.html || data.text || "",
      attachments: smtpAttachments.length > 0 ? smtpAttachments : undefined,
    });

    // Log email
    const emailRecord = await Email.create({
      threadId: thread._id,
      direction: "OUTBOUND",
      from: process.env.SMTP_FROM || "info@ersandiamonds.com",
      to: data.to,
      subject: data.subject,
      html: data.html,
      text: data.text,
      sentAt: new Date(),
      status: "SENT",
      sentByUserId: user.id,
      templateId: data.templateId,
      providerMessageId: result.messageId,
      attachmentsMeta,
    });

    // Update thread
    await EmailThread.findByIdAndUpdate(thread._id, {
      lastMessageAt: new Date(),
      $inc: { messageCount: 1 },
    });

    await logEmail(user.id, user.role, "sent", "EmailThread", thread._id.toString());

    return successResponse(emailRecord, 201);
  } catch (error) {
    console.error("[API] Mail send error:", error);
    return errorResponse("Mail gönderilemedi", 500);
  }
}
