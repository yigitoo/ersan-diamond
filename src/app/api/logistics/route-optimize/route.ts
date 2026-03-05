import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { requireRole } from "@/lib/auth";
import Delivery from "@/lib/db/models/delivery";
import User from "@/lib/db/models/user";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { buildOptimizedRouteAsync } from "@/lib/utils/geo";

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await requireRole(["OWNER", "ADMIN", "SALES"]);
    await connectDB();

    const courierId = req.nextUrl.searchParams.get("courierId");
    const resolvedCourierId = courierId === "me" ? sessionUser.id : courierId;

    if (!resolvedCourierId) {
      return errorResponse("courierId parameter required", 400);
    }

    const courier = await User.findById(resolvedCourierId).lean();
    if (!courier) return errorResponse("Courier not found", 404);

    // Get active deliveries for this courier
    const deliveries = await Delivery.find({
      courierId: resolvedCourierId,
      status: { $in: ["ASSIGNED", "PICKED_UP", "IN_TRANSIT"] },
    })
      .populate("productId", "brand model")
      .lean();

    if (deliveries.length === 0) {
      return successResponse({
        courierId: resolvedCourierId,
        courierName: (courier as any).name || "",
        origin: null,
        stops: [],
        totalDistanceKm: 0,
        totalEtaMinutes: 0,
        routeSource: "haversine",
      });
    }

    // Get courier's last known location
    const withLocation = deliveries.find((d) => d.courierLocation?.lat);
    const courierLoc = withLocation?.courierLocation
      ? { lat: withLocation.courierLocation.lat, lng: withLocation.courierLocation.lng }
      : null;

    const t0 = Date.now();
    const route = await buildOptimizedRouteAsync(
      resolvedCourierId,
      (courier as any).name || "",
      courierLoc,
      deliveries.map((d) => ({
        _id: String(d._id),
        recipientName: d.recipientName,
        deliveryAddress: d.deliveryAddress,
        status: d.status,
      })),
    );
    console.log(`[RouteOptimize] ${deliveries.length} deliveries → ${route.routeSource} (${Date.now() - t0}ms)`);

    return successResponse(route);
  } catch (error: any) {
    return errorResponse(error.message || "Route optimization failed", 400);
  }
}
