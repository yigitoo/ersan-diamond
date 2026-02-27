import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { getSessionUser } from "@/lib/auth";
import { autoAssignLead } from "@/lib/leads/auto-assign";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { logCrud } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse("Unauthorized", 401);

    // Only OWNER and ADMIN can manually trigger auto-assignment
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      return errorResponse("Yetkiniz yok", 403);
    }

    await connectDB();
    const { leadId } = await req.json();

    if (!leadId) {
      return errorResponse("leadId gerekli", 400);
    }

    const result = await autoAssignLead(leadId);

    if (!result) {
      return errorResponse("Atanabilecek aktif satış temsilcisi bulunamadı", 400);
    }

    await logCrud(user.id, user.role, "update", "Lead", leadId, {
      after: { assignedUserId: result.assignedUserId, autoAssigned: true } as Record<string, unknown>,
    });

    return successResponse(result);
  } catch (error) {
    console.error("[API] Auto-assign error:", error);
    return errorResponse("Otomatik atama başarısız", 500);
  }
}
