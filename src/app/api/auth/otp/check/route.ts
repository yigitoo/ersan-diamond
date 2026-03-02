import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const trusted = cookieStore.get("otp_trusted");

    if (!trusted?.value) {
      return NextResponse.json({ success: true, trusted: false });
    }

    // Cookie exists and hasn't expired (browser handles maxAge)
    return NextResponse.json({ success: true, trusted: true });
  } catch {
    return NextResponse.json({ success: true, trusted: false });
  }
}
