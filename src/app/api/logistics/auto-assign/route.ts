import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { requireRole } from "@/lib/auth";
import Delivery from "@/lib/db/models/delivery";
import User from "@/lib/db/models/user";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { scoreCourierForDelivery, resolveAddressCoords } from "@/lib/utils/geo";
import { DEFAULT_PICKUP_COORDS } from "@/lib/utils/constants";
import { logAudit, getRequestMeta } from "@/lib/audit/logger";

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await requireRole(["OWNER", "ADMIN"]);
    await connectDB();

    const body = await req.json();
    const deliveryIds: string[] = body.deliveryIds
      ? body.deliveryIds
      : body.deliveryId
        ? [body.deliveryId]
        : [];

    if (deliveryIds.length === 0) {
      return errorResponse("deliveryId or deliveryIds required", 400);
    }

    // Load pending deliveries
    const deliveries = await Delivery.find({
      _id: { $in: deliveryIds },
      status: "PENDING",
    }).lean();

    if (deliveries.length === 0) {
      return errorResponse("No PENDING deliveries found", 400);
    }

    // Load all team members that can be couriers (SALES, ADMIN, OWNER)
    const couriers = await User.find({
      role: { $in: ["SALES", "ADMIN", "OWNER"] },
      active: { $ne: false },
    }).lean();

    if (couriers.length === 0) {
      return errorResponse("No available couriers", 400);
    }

    // For each courier, get active delivery count and delivery coords
    const courierStats = await Promise.all(
      couriers.map(async (c) => {
        const activeDeliveries = await Delivery.find({
          courierId: c._id,
          status: { $nin: ["DELIVERED", "CANCELLED"] },
        }).lean();

        const stopCoords = activeDeliveries
          .map((d) => resolveAddressCoords(d.deliveryAddress))
          .filter(Boolean) as Array<{ lat: number; lng: number }>;

        // Get last known location from most recent delivery with courierLocation
        const lastLocDelivery = activeDeliveries.find((d) => d.courierLocation?.lat);
        const courierLoc = lastLocDelivery?.courierLocation
          ? { lat: lastLocDelivery.courierLocation.lat, lng: lastLocDelivery.courierLocation.lng }
          : null;

        return {
          courier: c,
          activeCount: activeDeliveries.length,
          stopCoords,
          courierLoc,
        };
      }),
    );

    const assignments: Array<{ deliveryId: string; courierId: string; courierName: string }> = [];

    for (const delivery of deliveries) {
      const deliveryCoords = resolveAddressCoords(delivery.deliveryAddress);
      if (!deliveryCoords) continue;

      const pickupCoords = resolveAddressCoords(delivery.pickupAddress) || DEFAULT_PICKUP_COORDS;

      // Score each courier
      let bestCourier = courierStats[0];
      let bestScore = Infinity;

      for (const cs of courierStats) {
        const score = scoreCourierForDelivery(
          cs.courierLoc,
          pickupCoords,
          deliveryCoords,
          cs.stopCoords,
          cs.activeCount,
        );
        if (score < bestScore) {
          bestScore = score;
          bestCourier = cs;
        }
      }

      // Assign
      await Delivery.findByIdAndUpdate(delivery._id, {
        courierId: bestCourier.courier._id,
        status: "ASSIGNED",
        $push: {
          statusHistory: {
            status: "ASSIGNED",
            timestamp: new Date(),
            note: `Auto-assigned (score: ${bestScore.toFixed(1)})`,
            userId: sessionUser.id,
          },
        },
      });

      // Update courier stats in-memory for next iteration
      bestCourier.activeCount += 1;
      bestCourier.stopCoords.push(deliveryCoords);

      logAudit({
        actorUserId: sessionUser.id, actorRole: sessionUser.role,
        actionType: "LOGISTICS:auto_assigned",
        entityType: "Delivery", entityId: String(delivery._id),
        after: { courierId: String(bestCourier.courier._id), courierName: (bestCourier.courier as any).name || "", score: Math.round(bestScore * 10) / 10 },
        route: "/api/logistics/auto-assign",
        ...getRequestMeta(req),
      });

      assignments.push({
        deliveryId: String(delivery._id),
        courierId: String(bestCourier.courier._id),
        courierName: (bestCourier.courier as any).name || "",
      });
    }

    return successResponse({ assigned: assignments.length, assignments });
  } catch (error: any) {
    return errorResponse(error.message || "Auto-assign failed", 400);
  }
}
