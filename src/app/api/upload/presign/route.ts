import { NextRequest } from "next/server";
import { getPresignedUploadUrl, generateImageKey } from "@/lib/r2";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { rateLimit } from "@/lib/utils/rate-limit";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/heic",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 20 uploads per minute per IP
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { success: withinLimit } = rateLimit(ip, 20, 60 * 1000);
    if (!withinLimit) {
      return errorResponse("Çok fazla istek. Lütfen bir süre bekleyin.", 429);
    }

    const body = await req.json();
    const { filename, contentType, fileSize, folder = "products" } = body;

    if (!filename || !contentType) {
      return errorResponse("Dosya adı ve tipi gerekli", 400);
    }

    if (!ALLOWED_TYPES.includes(contentType)) {
      return errorResponse(
        "Sadece JPEG, PNG, WebP, AVIF ve HEIC dosyaları yüklenebilir",
        400
      );
    }

    if (typeof fileSize === "number" && fileSize > MAX_SIZE) {
      return errorResponse("Dosya boyutu 10MB'ı aşamaz", 400);
    }

    const key = generateImageKey(folder, filename);
    const { uploadUrl, publicUrl } = await getPresignedUploadUrl(key, contentType);

    return successResponse({ uploadUrl, publicUrl, key });
  } catch (error) {
    console.error("[API] Presign error:", error);
    return errorResponse("Yükleme URL'i oluşturulamadı", 500);
  }
}
