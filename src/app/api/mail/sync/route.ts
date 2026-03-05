import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { hasPermission } from "@/lib/auth/rbac";
import { syncInbox } from "@/lib/email/sync";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { rateLimit } from "@/lib/utils/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !hasPermission(user.role, "mail:view")) {
      return errorResponse("Unauthorized", 403);
    }

    // Rate limit: max 1 sync per 15 seconds per user
    const { success: withinLimit } = rateLimit(`mail-sync-${user.id}`, 1, 15_000);
    if (!withinLimit) {
      return successResponse({ synced: 0, errors: 0, throttled: true });
    }

    const result = await syncInbox();
    return successResponse(result);
  } catch (error) {
    console.error("[API] Mail sync error:", error);
    return errorResponse("Sync failed", 500);
  }
}
