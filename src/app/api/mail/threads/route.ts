import { connectDB } from "@/lib/db/connection";
import { getSessionUser } from "@/lib/auth";
import { hasPermission } from "@/lib/auth/rbac";
import EmailThread from "@/lib/db/models/email-thread";
import { successResponse, errorResponse, paginatedResponse, parseSearchParams } from "@/lib/utils/api-response";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !hasPermission(user.role, "mail:view")) {
      return errorResponse("Unauthorized", 403);
    }

    await connectDB();
    const { page, limit, skip } = parseSearchParams(req.nextUrl.searchParams);

    const filter: Record<string, unknown> = {};
    const search = req.nextUrl.searchParams.get("search");
    if (search) {
      filter.$or = [
        { customerEmail: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ];
    }

    const [threads, total] = await Promise.all([
      EmailThread.find(filter)
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      EmailThread.countDocuments(filter),
    ]);

    return paginatedResponse(threads, total, page, limit);
  } catch (error) {
    console.error("[API] Mail threads error:", error);
    return errorResponse("Mail thread'leri yüklenemedi", 500);
  }
}
