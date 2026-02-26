import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { EmailThread, Email } from "@/lib/db/models";
import { successResponse, errorResponse, paginatedResponse, parseSearchParams } from "@/lib/utils/api-response";
import { getSessionUser } from "@/lib/auth/session";

// GET /api/mail — list email threads
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse("Unauthorized", 401);

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
      EmailThread.find(filter).sort({ lastMessageAt: -1 }).skip(skip).limit(limit).lean(),
      EmailThread.countDocuments(filter),
    ]);

    return paginatedResponse(threads, total, page, limit);
  } catch (error) {
    console.error("[API] GET /api/mail error:", error);
    return errorResponse("Failed to fetch mail threads", 500);
  }
}
