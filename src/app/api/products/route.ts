import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import Product from "@/lib/db/models/product";
import { successResponse, errorResponse, paginatedResponse, parseSearchParams } from "@/lib/utils/api-response";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { page, limit, sort, order, search, skip } = parseSearchParams(req.nextUrl.searchParams);

    const filter: Record<string, unknown> = {};

    // IDs filter (for wishlist)
    const ids = req.nextUrl.searchParams.get("ids");
    if (ids) {
      const idList = ids.split(",").filter(Boolean);
      if (idList.length > 0) {
        filter._id = { $in: idList };
        // Don't apply published filter for id lookups
      }
    } else {
      filter.published = true;
    }

    // Published override
    const published = req.nextUrl.searchParams.get("published");
    if (published === "true") filter.published = true;
    if (published === "false") filter.published = false;

    // Category filter
    const category = req.nextUrl.searchParams.get("category");
    if (category) filter.category = category.toUpperCase();

    // Brand filter
    const brand = req.nextUrl.searchParams.get("brand");
    if (brand) filter.brand = { $regex: brand, $options: "i" };

    // Condition filter
    const condition = req.nextUrl.searchParams.get("condition");
    if (condition) filter.condition = condition;

    // Availability filter
    const availability = req.nextUrl.searchParams.get("availability");
    if (availability) filter.availability = availability;

    // Price range
    const minPrice = req.nextUrl.searchParams.get("minPrice");
    const maxPrice = req.nextUrl.searchParams.get("maxPrice");
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) (filter.price as Record<string, unknown>).$gte = Number(minPrice);
      if (maxPrice) (filter.price as Record<string, unknown>).$lte = Number(maxPrice);
    }

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ [sort]: order })
        .skip(skip)
        .limit(limit)
        .select("-__v")
        .lean(),
      Product.countDocuments(filter),
    ]);

    return paginatedResponse(products, total, page, limit);
  } catch (error) {
    console.error("[API] Products GET error:", error);
    return errorResponse("Ürünler yüklenirken hata oluştu", 500);
  }
}
