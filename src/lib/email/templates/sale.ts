import { emailLayout, signatureBlock } from "./base";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface SaleEmailData {
  buyerName: string;
  productTitle: string;
  salePrice: number;
  currency: string;
  salesRepName: string;
  signatureTitle?: string;
  phone?: string;
  soldAt: Date;
}

export function saleReceipt(data: SaleEmailData): { subject: string; html: string } {
  const subject = `Satışınız Hakkında | Ersan Diamond`;
  const priceFormatted = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: data.currency,
    minimumFractionDigits: 0,
  }).format(data.salePrice);

  const html = emailLayout(`
    <h2>Teşekkür Ederiz</h2>
    <p>Sayın ${data.buyerName},</p>
    <p>Ersan Diamond'ı tercih ettiğiniz için teşekkür ederiz.</p>
    <div class="info-box">
      <div style="padding: 8px 0; border-bottom: 1px solid #2A2A2A;">
        <span style="color: #8A8A8A;">Ürün:</span>
        <span style="float: right; color: #FAFAFA;">${data.productTitle}</span>
      </div>
      <div style="padding: 8px 0; border-bottom: 1px solid #2A2A2A;">
        <span style="color: #8A8A8A;">Tutar:</span>
        <span style="float: right; color: #FAFAFA;">${priceFormatted}</span>
      </div>
      <div style="padding: 8px 0;">
        <span style="color: #8A8A8A;">Tarih:</span>
        <span style="float: right; color: #FAFAFA;">${format(data.soldAt, "d MMMM yyyy", { locale: tr })}</span>
      </div>
    </div>
    <p>Ürününüz ile ilgili herhangi bir sorunuz olursa bize ulaşmaktan çekinmeyin.</p>
    ${signatureBlock(data.salesRepName, data.signatureTitle, data.phone)}
  `);
  return { subject, html };
}
