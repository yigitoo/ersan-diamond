import { NextRequest } from "next/server";
import { getPresignedUploadUrl, generateImageKey, generateAttachmentKey } from "@/lib/r2";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { rateLimit } from "@/lib/utils/rate-limit";

const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/heic",
];

const MAIL_ATTACHMENT_TYPES = [
  ...IMAGE_TYPES,
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "application/zip",
  "application/x-rar-compressed",
  "application/vnd.rar",
  "video/mp4",
  "video/quicktime",
  "audio/mpeg",
  "audio/wav",
];

const IMAGE_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const MAIL_ATTACHMENT_MAX_SIZE = 25 * 1024 * 1024; // 25MB

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

    const isMailAttachment = folder === "mail-attachments";
    const allowedTypes = isMailAttachment ? MAIL_ATTACHMENT_TYPES : IMAGE_TYPES;
    const maxSize = isMailAttachment ? MAIL_ATTACHMENT_MAX_SIZE : IMAGE_MAX_SIZE;

    if (!allowedTypes.includes(contentType)) {
      return errorResponse(
        isMailAttachment
          ? "Bu dosya tipi desteklenmiyor"
          : "Sadece JPEG, PNG, WebP, AVIF ve HEIC dosyaları yüklenebilir",
        400
      );
    }

    if (typeof fileSize === "number" && fileSize > maxSize) {
      return errorResponse(
        isMailAttachment
          ? "Dosya boyutu 25MB'ı aşamaz"
          : "Dosya boyutu 10MB'ı aşamaz",
        400
      );
    }

    const key = isMailAttachment
      ? generateAttachmentKey(filename)
      : generateImageKey(folder, filename);
    const { uploadUrl, publicUrl } = await getPresignedUploadUrl(key, contentType);

    return successResponse({ uploadUrl, publicUrl, key });
  } catch (error) {
    console.error("[API] Presign error:", error);
    return errorResponse("Yükleme URL'i oluşturulamadı", 500);
  }
}
