import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db/connection";
import Otp from "@/lib/db/models/otp";
import { cookies } from "next/headers";
import { logAudit, getRequestMeta } from "@/lib/audit/logger";

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();
    if (!email || !code) {
      return NextResponse.json({ success: false, error: "E-posta ve kod gerekli" }, { status: 400 });
    }

    await connectDB();

    const codeHash = hashCode(code);

    const otp = await Otp.findOne({
      email: email.toLowerCase().trim(),
      codeHash,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otp) {
      logAudit({ actorUserId: email, actorRole: "unknown", actionType: "AUTH:otp_failed", after: { email: email.toLowerCase().trim() }, route: "/api/auth/otp/verify", ...getRequestMeta(req) });
      return NextResponse.json({ success: false, error: "Geçersiz veya süresi dolmuş kod / Invalid or expired code" }, { status: 400 });
    }

    // Mark as used
    otp.used = true;
    await otp.save();

    // Set trusted cookie (3 days)
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(`${email}:${token}`).digest("hex");

    const cookieStore = await cookies();
    cookieStore.set("otp_trusted", `${email}:${token}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3 * 24 * 60 * 60, // 3 days
      path: "/",
    });

    logAudit({ actorUserId: email, actorRole: "unknown", actionType: "AUTH:otp_verified", after: { email: email.toLowerCase().trim() }, route: "/api/auth/otp/verify", ...getRequestMeta(req) });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[OTP] Verify error:", error);
    return NextResponse.json({ success: false, error: "Doğrulama başarısız" }, { status: 500 });
  }
}
