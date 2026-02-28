import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import Product from "@/lib/db/models/product";
import { sendEmail } from "@/lib/email/smtp";
import { sendSms } from "@/lib/sms/httpsms";
import { smsTemplates } from "@/lib/sms/templates";
import { emailLayout, getAppUrl } from "@/lib/email/templates/base";
import { successResponse, errorResponse } from "@/lib/utils/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, productIds } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return errorResponse("Geçerli bir e-posta adresi gerekli", 400);
    }

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return errorResponse("Favori listesi boş", 400);
    }

    if (productIds.length > 50) {
      return errorResponse("Çok fazla ürün", 400);
    }

    await connectDB();

    const products = await Product.find({
      _id: { $in: productIds },
      published: true,
    })
      .select("title brand model price currency priceOnRequest images slug category")
      .lean();

    if (products.length === 0) {
      return errorResponse("Ürün bulunamadı", 404);
    }

    const productRows = products
      .map((p: any) => {
        const img = p.images?.[0]?.url || "";
        const price = p.priceOnRequest
          ? "Fiyat Sorunuz"
          : p.price
            ? new Intl.NumberFormat("tr-TR", { style: "currency", currency: p.currency || "EUR", minimumFractionDigits: 0 }).format(p.price)
            : "";
        const category = p.category === "HERMES" ? "hermes" : p.category === "JEWELRY" ? "jewelry" : "watches";
        const appUrl = getAppUrl();
        const link = `${appUrl}/${category}/${p.slug}`;

        return `
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #2A2A2A;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  ${img ? `<td style="width: 80px; vertical-align: top;"><img src="${img}" alt="${p.title}" style="width: 72px; height: 72px; object-fit: cover; border: 1px solid #2A2A2A;" /></td>` : ""}
                  <td style="padding-left: 12px; vertical-align: top;">
                    <p style="margin: 0; color: #8A8A8A; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">${p.brand}</p>
                    <p style="margin: 4px 0; color: #FAFAFA; font-size: 14px;">${p.model}</p>
                    <p style="margin: 0; color: #C9A84C; font-size: 13px;">${price}</p>
                  </td>
                  <td style="vertical-align: middle; text-align: right;">
                    <a href="${link}" style="color: #C9A84C; font-size: 12px; text-decoration: none;">Detay &rarr;</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
      })
      .join("");

    const html = emailLayout(`
      <h2>Favori Listeniz</h2>
      <p>Ersan Diamond'da beğendiğiniz ürünler:</p>
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        ${productRows}
      </table>
      <div style="text-align: center; margin-top: 32px;">
        <a href="${getAppUrl()}/wishlist" class="cta-btn">Favori Listeme Git</a>
      </div>
      <p style="font-size: 12px; color: #8A8A8A; margin-top: 24px;">Bu e-posta sizin isteğiniz üzerine gönderilmiştir.</p>
    `);

    await sendEmail({
      to: email,
      subject: `Favori Listeniz (${products.length} ürün) | Ersan Diamond`,
      html,
    });

    // Send SMS if phone provided
    if (body.phone) {
      await sendSms({ to: body.phone, content: smsTemplates.wishlistSend() }).catch((err) =>
        console.error("[API] Wishlist SMS failed:", err)
      );
    }

    return successResponse({ sent: true });
  } catch (error) {
    console.error("[API] Wishlist send error:", error);
    return errorResponse("E-posta gönderilemedi", 500);
  }
}
