import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Sale, Product } from "@/lib/db/models";
import { successResponse, errorResponse, paginatedResponse, parseSearchParams } from "@/lib/utils/api-response";
import { getSessionUser } from "@/lib/auth/session";
import { logCrud } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse("Unauthorized", 401);

    await connectDB();
    const { page, limit, sort, order, skip } = parseSearchParams(req.nextUrl.searchParams);

    const filter: Record<string, unknown> = {};

    // SALES role can only see own sales
    if (user.role === "SALES") {
      filter.salesRepId = user.id;
    }

    const salesRepId = req.nextUrl.searchParams.get("salesRepId");
    if (salesRepId && user.role !== "SALES") filter.salesRepId = salesRepId;

    const dateFrom = req.nextUrl.searchParams.get("dateFrom");
    const dateTo = req.nextUrl.searchParams.get("dateTo");
    if (dateFrom || dateTo) {
      filter.soldAt = {};
      if (dateFrom) (filter.soldAt as any).$gte = new Date(dateFrom);
      if (dateTo) (filter.soldAt as any).$lte = new Date(dateTo);
    }

    const [sales, total] = await Promise.all([
      Sale.find(filter).sort({ [sort]: order }).skip(skip).limit(limit).populate("productId", "brand model reference images").populate("salesRepId", "name").lean(),
      Sale.countDocuments(filter),
    ]);

    return paginatedResponse(sales, total, page, limit);
  } catch (error) {
    console.error("[API] GET /api/sales error:", error);
    return errorResponse("Failed to fetch sales", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse("Unauthorized", 401);
    if (user.role === "VIEWER") return errorResponse("Forbidden", 403);

    await connectDB();
    const body = await req.json();

    const sale = await Sale.create(body);

    // Auto-mark product as SOLD
    await Product.findByIdAndUpdate(body.productId, { availability: "SOLD" });

    await logCrud(user.id, user.role, "create", "Sale", sale._id.toString(), {
      after: { productId: body.productId, salePrice: body.salePrice, buyerName: body.buyerName },
    });

    return successResponse(sale, 201);
  } catch (error) {
    console.error("[API] POST /api/sales error:", error);
    return errorResponse("Failed to create sale", 500);
  }
}
