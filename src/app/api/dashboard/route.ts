import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Sale, Lead, Appointment, Product } from "@/lib/db/models";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { getSessionUser } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse("Unauthorized", 401);

    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const userFilter = user.role === "SALES" ? { salesRepId: user.id } : {};
    const userLeadFilter = user.role === "SALES" ? { assignedUserId: user.id } : {};
    const userApptFilter = user.role === "SALES" ? { assignedUserId: user.id } : {};

    const [
      todaySalesCount,
      todaySalesRevenue,
      newLeadsCount,
      todayAppointments,
      totalInventoryValue,
      pipelineCounts,
      recentLeads,
      upcomingAppointments,
    ] = await Promise.all([
      // Today's sales
      Sale.countDocuments({ ...userFilter, soldAt: { $gte: today, $lt: tomorrow } }),
      Sale.aggregate([
        { $match: { ...userFilter, soldAt: { $gte: today, $lt: tomorrow } } },
        { $group: { _id: null, total: { $sum: "$salePrice" } } },
      ]),
      // New leads
      Lead.countDocuments({ ...userLeadFilter, status: "NEW" }),
      // Today's appointments
      Appointment.countDocuments({ ...userApptFilter, datetimeStart: { $gte: today, $lt: tomorrow } }),
      // Inventory value
      Product.aggregate([
        { $match: { availability: "AVAILABLE", published: true } },
        { $group: { _id: null, total: { $sum: "$price" } } },
      ]),
      // Pipeline
      Lead.aggregate([
        { $match: userLeadFilter },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      // Recent leads
      Lead.find(userLeadFilter).sort({ createdAt: -1 }).limit(5).lean(),
      // Upcoming appointments
      Appointment.find({
        ...userApptFilter,
        datetimeStart: { $gte: new Date() },
        status: { $in: ["PENDING", "CONFIRMED"] },
      })
        .sort({ datetimeStart: 1 })
        .limit(5)
        .lean(),
    ]);

    const pipeline: Record<string, number> = {};
    pipelineCounts.forEach((p: any) => {
      pipeline[p._id] = p.count;
    });

    return successResponse({
      kpis: {
        todaySales: todaySalesCount,
        todayRevenue: todaySalesRevenue[0]?.total || 0,
        newLeads: newLeadsCount,
        todayAppointments,
        inventoryValue: totalInventoryValue[0]?.total || 0,
      },
      pipeline,
      recentLeads,
      upcomingAppointments,
    });
  } catch (error) {
    console.error("[API] GET /api/dashboard error:", error);
    return errorResponse("Failed to fetch dashboard data", 500);
  }
}
