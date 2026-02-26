import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { requireRole } from "@/lib/auth";
import AuditLog from "@/lib/db/models/audit-log";
import { paginatedResponse, errorResponse, parseSearchParams } from "@/lib/utils/api-response";

export async function GET(req: NextRequest) {
  try {
    await requireRole(["OWNER", "ADMIN"]);
    await connectDB();

    const { page, limit, sort, order, skip } = parseSearchParams(req.nextUrl.searchParams);

    const filter: Record<string, unknown> = {};

    const actorUserId = req.nextUrl.searchParams.get("userId");
    if (actorUserId) filter.actorUserId = actorUserId;

    const actionType = req.nextUrl.searchParams.get("actionType");
    if (actionType) filter.actionType = { $regex: actionType, $options: "i" };

    const entityType = req.nextUrl.searchParams.get("entityType");
    if (entityType) filter.entityType = entityType;

    const from = req.nextUrl.searchParams.get("from");
    const to = req.nextUrl.searchParams.get("to");
    if (from || to) {
      filter.createdAt = {};
      if (from) (filter.createdAt as Record<string, unknown>).$gte = new Date(from);
      if (to) (filter.createdAt as Record<string, unknown>).$lte = new Date(to);
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ [sort]: order })
        .skip(skip)
        .limit(limit)
        .populate("actorUserId", "name email")
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    return paginatedResponse(logs, total, page, limit);
  } catch (error: any) {
    return errorResponse(error.message || "Loglar yüklenemedi", 403);
  }
}
