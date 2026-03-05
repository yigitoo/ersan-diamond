import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { hasPermission } from "@/lib/auth/rbac";
import { uploadBuffer, generateAttachmentKey } from "@/lib/r2";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { rateLimit } from "@/lib/utils/rate-limit";

const MAX_SIZE = 25 * 1024 * 1024; // 25MB

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !hasPermission(user.role, "mail:send")) {
      return errorResponse("Unauthorized", 403);
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { success: withinLimit } = rateLimit(ip, 20, 60 * 1000);
    if (!withinLimit) {
      return errorResponse("Çok fazla istek", 429);
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return errorResponse("Dosya gerekli", 400);
    }

    if (file.size > MAX_SIZE) {
      return errorResponse("Dosya boyutu 25MB'ı aşamaz", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = generateAttachmentKey(file.name);
    const contentType = file.type || "application/octet-stream";
    const url = await uploadBuffer(key, buffer, contentType);

    return successResponse({
      url,
      key,
      filename: file.name,
      contentType,
      size: file.size,
    });
  } catch (error) {
    console.error("[API] Attachment upload error:", error);
    return errorResponse("Dosya yüklenemedi", 500);
  }
}
