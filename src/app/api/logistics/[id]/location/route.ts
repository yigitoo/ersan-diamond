import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { requireRole } from "@/lib/auth";
import Delivery from "@/lib/db/models/delivery";
import { successResponse, errorResponse } from "@/lib/utils/api-response";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole(["OWNER", "ADMIN", "SALES"]);
    await connectDB();

    const { id } = await params;
    const { lat, lng } = await req.json();

    if (typeof lat !== "number" || typeof lng !== "number") {
      return errorResponse("Geçersiz konum verisi", 400);
    }

    const delivery = await Delivery.findById(id);
    if (!delivery) return errorResponse("Teslimat bulunamadı", 404);

    // Only the assigned courier can update location
    if (delivery.courierId?.toString() !== user.id) {
      return errorResponse("Bu teslimat için yetkiniz yok", 403);
    }

    delivery.courierLocation = {
      lat,
      lng,
      updatedAt: new Date(),
    };
    await delivery.save();

    return successResponse({ lat, lng, updatedAt: delivery.courierLocation.updatedAt });
  } catch (error: any) {
    return errorResponse(error.message || "Konum güncellenemedi", 400);
  }
}
