import { NextRequest } from "next/server";
import { syncInbox } from "@/lib/email/sync";
import { successResponse, errorResponse } from "@/lib/utils/api-response";

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return errorResponse("Unauthorized", 401);
  }

  try {
    const result = await syncInbox();
    return successResponse(result);
  } catch (error) {
    console.error("[Cron] Mail sync failed:", error);
    return errorResponse("Mail sync failed", 500);
  }
}
