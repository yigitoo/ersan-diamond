import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { getSessionUser } from "@/lib/auth";
import { hasPermission } from "@/lib/auth/rbac";
import Product from "@/lib/db/models/product";
import { createProductSchema } from "@/lib/validations/product";
import { successResponse, errorResponse, paginatedResponse, parseSearchParams } from "@/lib/utils/api-response";
import { logCrud } from "@/lib/audit";
import { generateSlug } from "@/lib/utils/slug";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse("Unauthorized", 401);

    await connectDB();
    const { page, limit, sort, order, search, skip } = parseSearchParams(req.nextUrl.searchParams);

    const filter: Record<string, unknown> = {};
    const category = req.nextUrl.searchParams.get("category");
    if (category) filter.category = category;
    const availability = req.nextUrl.searchParams.get("availability");
    if (availability) filter.availability = availability;
    const published = req.nextUrl.searchParams.get("published");
    if (published !== null) filter.published = published === "true";
    if (search) filter.$text = { $search: search };

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ [sort]: order }).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    return paginatedResponse(products, total, page, limit);
  } catch (error) {
    return errorResponse("Envanter yüklenemedi", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !hasPermission(user.role, "inventory:manage")) {
      return errorResponse("Unauthorized", 403);
    }

    await connectDB();
    const body = await req.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || "Geçersiz veri", 400);
    }

    const data = parsed.data;
    const slug = generateSlug(data.brand, data.model, data.reference, Date.now().toString());

    const product = await Product.create({ ...data, slug, availability: "AVAILABLE" });

    await logCrud(user.id, user.role, "create", "Product", product._id.toString(), {
      after: { brand: data.brand, model: data.model, price: data.price } as Record<string, unknown>,
    });

    return successResponse(product, 201);
  } catch (error) {
    return errorResponse("Ürün oluşturulamadı", 500);
  }
}
