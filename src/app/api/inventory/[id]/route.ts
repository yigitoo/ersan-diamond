import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { getSessionUser } from "@/lib/auth";
import { hasPermission } from "@/lib/auth/rbac";
import Product from "@/lib/db/models/product";
import { updateProductSchema } from "@/lib/validations/product";
import { successResponse, errorResponse } from "@/lib/utils/api-response";
import { logCrud } from "@/lib/audit";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse("Unauthorized", 401);

    await connectDB();
    const { id } = await params;
    const product = await Product.findById(id).lean();
    if (!product) return errorResponse("Ürün bulunamadı", 404);

    return successResponse(product);
  } catch (error) {
    return errorResponse("Ürün yüklenemedi", 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user || !hasPermission(user.role, "inventory:manage")) {
      return errorResponse("Unauthorized", 403);
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || "Geçersiz veri", 400);
    }

    const before = await Product.findById(id).lean();
    if (!before) return errorResponse("Ürün bulunamadı", 404);

    const updated = await Product.findByIdAndUpdate(id, parsed.data, { new: true }).lean();

    await logCrud(user.id, user.role, "update", "Product", id, {
      before: { price: before.price, availability: before.availability, published: before.published } as Record<string, unknown>,
      after: parsed.data as Record<string, unknown>,
    });

    return successResponse(updated);
  } catch (error) {
    return errorResponse("Ürün güncellenemedi", 500);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user || !hasPermission(user.role, "inventory:manage")) {
      return errorResponse("Unauthorized", 403);
    }

    await connectDB();
    const { id } = await params;
    const product = await Product.findById(id).lean();
    if (!product) return errorResponse("Ürün bulunamadı", 404);

    await Product.findByIdAndDelete(id);

    await logCrud(user.id, user.role, "delete", "Product", id, {
      before: { brand: product.brand, model: product.model } as Record<string, unknown>,
    });

    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponse("Ürün silinemedi", 500);
  }
}
