import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { requireRole } from "@/lib/auth";
import Delivery from "@/lib/db/models/delivery";
import { successResponse, errorResponse } from "@/lib/utils/api-response";

export async function GET(req: NextRequest) {
  try {
    await requireRole(["OWNER", "ADMIN", "SALES"]);
    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [statusCounts, todayCount, couriers] = await Promise.all([
      Delivery.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Delivery.countDocuments({
        scheduledDate: { $gte: today, $lt: tomorrow },
      }),
      Delivery.aggregate([
        { $match: { courierId: { $exists: true, $ne: null }, status: { $nin: ["DELIVERED", "CANCELLED"] } } },
        { $group: { _id: "$courierId", activeCount: { $sum: 1 } } },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            _id: 1,
            activeCount: 1,
            name: "$user.name",
            email: "$user.email",
          },
        },
      ]),
    ]);

    const statusMap: Record<string, number> = {};
    let total = 0;
    for (const s of statusCounts) {
      statusMap[s._id] = s.count;
      total += s.count;
    }

    return successResponse({
      total,
      today: todayCount,
      byStatus: statusMap,
      activeCouriers: couriers,
    });
  } catch (error: any) {
    return errorResponse(error.message || "İstatistikler yüklenemedi", 403);
  }
}
