import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { requireRole } from "@/lib/auth";
import Delivery from "@/lib/db/models/delivery";
import { successResponse, errorResponse } from "@/lib/utils/api-response";

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(["OWNER", "ADMIN", "SALES"]);
    await connectDB();

    const showCompleted = req.nextUrl.searchParams.get("completed") === "true";

    const filter: Record<string, unknown> = {
      courierId: user.id,
    };

    if (!showCompleted) {
      filter.status = { $nin: ["DELIVERED", "CANCELLED"] };
    }

    const deliveries = await Delivery.find(filter)
      .sort({ scheduledDate: 1, priority: -1 })
      .populate("productId", "brand model slug images category")
      .populate("createdById", "name email")
      .lean();

    return successResponse(deliveries);
  } catch (error: any) {
    return errorResponse(error.message || "Teslimatlar yüklenemedi", 403);
  }
}
