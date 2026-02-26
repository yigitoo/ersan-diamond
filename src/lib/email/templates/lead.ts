import { emailLayout, signatureBlock, personalGreeting } from "./base";

interface LeadEmailData {
  customerName: string;
  salesRepName: string;
  signatureTitle?: string;
  phone?: string;
  leadId: string;
  brand?: string;
  model?: string;
  reference?: string;
}

export function sellToUsReceived(data: LeadEmailData): { subject: string; html: string } {
  const subject = `Ürün Satış Talebiniz Alındı | Ersan Diamond [ED-LEAD-${data.leadId}]`;
  const html = emailLayout(`
    ${personalGreeting(data.salesRepName)}
    <h2>Talebiniz Alındı</h2>
    <p>Sayın ${data.customerName},</p>
    <p>Ürün satış/consignment talebinizi aldık. Ekibimiz ürününüzü değerlendirip size en kısa sürede geri dönüş yapacaktır.</p>
    <p>Değerlendirme sürecimiz genellikle 24-48 saat içinde tamamlanır.</p>
    <p>Süreç hakkında sorularınız varsa lütfen bu maile cevap verin.</p>
    ${signatureBlock(data.salesRepName, data.signatureTitle, data.phone)}
  `);
  return { subject, html };
}

export function inventoryInquiryReceived(data: LeadEmailData): { subject: string; html: string } {
  const productStr = [data.brand, data.model, data.reference].filter(Boolean).join(" ");
  const subject = `Ürün Talebiniz | ${productStr || "Ersan Diamond"} [ED-LEAD-${data.leadId}]`;
  const html = emailLayout(`
    ${personalGreeting(data.salesRepName)}
    <h2>Ürün Talebiniz Alındı</h2>
    <p>Sayın ${data.customerName},</p>
    ${productStr ? `<p><strong>${productStr}</strong> ile ilgili talebinizi aldık.</p>` : "<p>Talebinizi aldık.</p>"}
    <p>Size en kısa sürede detaylı bilgi göndereceğiz. İsterseniz bir concierge randevusu da ayarlayabiliriz.</p>
    <a href="https://ersandiamond.com/concierge" class="cta-btn">Randevu Al</a>
    ${signatureBlock(data.salesRepName, data.signatureTitle, data.phone)}
  `);
  return { subject, html };
}
