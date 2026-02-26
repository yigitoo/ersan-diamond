import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import Product from "@/lib/db/models/product";
import { successResponse, errorResponse } from "@/lib/utils/api-response";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await params;
    const product = await Product.findOne({ slug, published: true }).select("-__v").lean();

    if (!product) {
      return errorResponse("Ürün bulunamadı", 404);
    }

    return successResponse(product);
  } catch (error) {
    console.error("[API] Product detail error:", error);
    return errorResponse("Ürün yüklenirken hata oluştu", 500);
  }
}
