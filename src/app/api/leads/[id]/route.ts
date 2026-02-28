import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { getSessionUser } from "@/lib/auth";
import { hasPermission } from "@/lib/auth/rbac";
import Lead from "@/lib/db/models/lead";
import { updateLeadSchema } from "@/lib/validations/lead";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { logCrud } from "@/lib/audit";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse("Unauthorized", 401);

    await connectDB();
    const { id } = await params;
    const lead = await Lead.findById(id)
      .populate("assignedUserId", "name email")
      .populate("relatedProductId", "title brand model slug category")
      .lean();

    if (!lead) return errorResponse("Lead bulunamadı", 404);

    // SALES users can only view their assigned leads or unassigned NEW leads
    if (user.role === "SALES") {
      const isAssigned = (lead as any).assignedUserId?._id?.toString() === user.id
        || (lead as any).assignedUserId?.toString() === user.id;
      const isUnassignedNew = !(lead as any).assignedUserId && (lead as any).status === "NEW";
      if (!isAssigned && !isUnassignedNew) {
        return errorResponse("Yetkisiz erişim", 403);
      }
    }

    return successResponse(lead);
  } catch (error) {
    return errorResponse("Lead yüklenemedi", 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user || !hasPermission(user.role, "leads:manage")) {
      return errorResponse("Unauthorized", 403);
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const parsed = updateLeadSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || "Geçersiz veri", 400);
    }

    const before = await Lead.findById(id).lean();
    if (!before) return errorResponse("Lead bulunamadı", 404);

    const updated = await Lead.findByIdAndUpdate(id, parsed.data, { new: true }).lean();

    await logCrud(user.id, user.role, "update", "Lead", id, {
      before: { status: before.status } as Record<string, unknown>,
      after: parsed.data as Record<string, unknown>,
    });

    return successResponse(updated);
  } catch (error) {
    return errorResponse("Lead güncellenemedi", 500);
  }
}
