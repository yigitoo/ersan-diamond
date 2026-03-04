import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { requireRole } from "@/lib/auth";
import Delivery from "@/lib/db/models/delivery";
import Product from "@/lib/db/models/product";
import { paginatedResponse, successResponse, errorResponse, parseSearchParams } from "@/lib/utils/api-response";

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(["OWNER", "ADMIN", "SALES"]);
    await connectDB();

    const { page, limit, sort, order, search, skip } = parseSearchParams(req.nextUrl.searchParams);

    const filter: Record<string, unknown> = {};

    const status = req.nextUrl.searchParams.get("status");
    if (status) filter.status = status;

    const priority = req.nextUrl.searchParams.get("priority");
    if (priority) filter.priority = priority;

    const courierId = req.nextUrl.searchParams.get("courierId");
    if (courierId) filter.courierId = courierId;

    const from = req.nextUrl.searchParams.get("from");
    const to = req.nextUrl.searchParams.get("to");
    if (from || to) {
      filter.scheduledDate = {};
      if (from) (filter.scheduledDate as Record<string, unknown>).$gte = new Date(from);
      if (to) (filter.scheduledDate as Record<string, unknown>).$lte = new Date(to);
    }

    if (search) {
      filter.$or = [
        { recipientName: { $regex: search, $options: "i" } },
        { recipientPhone: { $regex: search, $options: "i" } },
      ];
    }

    const [deliveries, total] = await Promise.all([
      Delivery.find(filter)
        .sort({ [sort]: order })
        .skip(skip)
        .limit(limit)
        .populate("productId", "brand model slug images category")
        .populate("courierId", "name email")
        .populate("createdById", "name email")
        .lean(),
      Delivery.countDocuments(filter),
    ]);

    return paginatedResponse(deliveries, total, page, limit);
  } catch (error: any) {
    return errorResponse(error.message || "Teslimatlar yüklenemedi", 403);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["OWNER", "ADMIN", "SALES"]);
    await connectDB();

    const body = await req.json();

    const delivery = await Delivery.create({
      ...body,
      createdById: user.id,
      status: "PENDING",
      statusHistory: [
        {
          status: "PENDING",
          timestamp: new Date(),
          note: "Teslimat oluşturuldu",
          userId: user.id,
        },
      ],
    });

    // Teslimat olusturulunca urunu siteden kaldir
    if (body.productId) {
      await Product.findByIdAndUpdate(body.productId, { published: false });
    }

    const populated = await Delivery.findById(delivery._id)
      .populate("productId", "brand model slug images category")
      .populate("courierId", "name email")
      .populate("createdById", "name email")
      .lean();

    return successResponse(populated, 201);
  } catch (error: any) {
    return errorResponse(error.message || "Teslimat oluşturulamadı", 400);
  }
}
