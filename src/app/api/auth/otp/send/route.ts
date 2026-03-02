import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db/connection";
import Otp from "@/lib/db/models/otp";
import User from "@/lib/db/models/user";
import { sendEmail } from "@/lib/email/smtp";
import { sendSms } from "@/lib/sms/httpsms";
import { otpEmailTemplate, otpSmsTemplate } from "@/lib/email/templates/otp";

function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { email, method } = await req.json();
    if (!email) {
      return NextResponse.json({ success: false, error: "E-posta gerekli" }, { status: 400 });
    }

    await connectDB();

    // Verify user exists
    const user = await User.findOne({ email: email.toLowerCase().trim(), active: true }).lean();
    if (!user) {
      // Don't reveal if user exists — return success anyway
      return NextResponse.json({ success: true });
    }

    // Rate limit: max 1 OTP per 60 seconds
    const recent = await Otp.findOne({
      email: email.toLowerCase().trim(),
      createdAt: { $gte: new Date(Date.now() - 60000) },
    });
    if (recent) {
      return NextResponse.json({ success: false, error: "Lütfen 60 saniye bekleyin / Please wait 60 seconds" }, { status: 429 });
    }

    const code = generateOtp();
    const codeHash = hashCode(code);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await Otp.create({
      email: email.toLowerCase().trim(),
      codeHash,
      expiresAt,
    });

    // Always send via both email and SMS simultaneously
    const tasks: Promise<unknown>[] = [];

    tasks.push(
      sendEmail({
        to: email,
        subject: "Ersan Diamond - Doğrulama Kodu / Verification Code",
        html: otpEmailTemplate(code),
      }).catch((err) => console.error("[OTP] Email send failed:", err))
    );

    if ((user as any).phoneInternal) {
      tasks.push(
        sendSms({
          to: (user as any).phoneInternal,
          content: otpSmsTemplate(code),
        }).catch((err) => console.error("[OTP] SMS send failed:", err))
      );
    }

    await Promise.allSettled(tasks);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[OTP] Send error:", error);
    return NextResponse.json({ success: false, error: "OTP gönderilemedi" }, { status: 500 });
  }
}
