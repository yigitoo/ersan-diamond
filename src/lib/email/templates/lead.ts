import { emailLayout, signatureBlock, personalGreeting, getAppUrl } from "./base";

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
    <a href="${getAppUrl()}/concierge" class="cta-btn">Randevu Al</a>
    ${signatureBlock(data.salesRepName, data.signatureTitle, data.phone)}
  `);
  return { subject, html };
}

export function contactReceived(data: { customerName: string; leadId: string }): { subject: string; html: string } {
  const subject = `İletişim Talebiniz Alındı | Ersan Diamond [ED-${data.leadId}]`;
  const html = emailLayout(`
    <h2>Mesajınız Bize Ulaştı</h2>
    <p>Sayın ${data.customerName},</p>
    <p>İletişim talebinizi aldık. Ekibimiz mesajınızı inceleyip en kısa sürede size geri dönüş yapacaktır.</p>
    <p>Genellikle 24 saat içinde yanıt veriyoruz. Acil konularda bizi doğrudan arayabilirsiniz:</p>
    <div class="info-box">
      <p style="margin: 0;"><span style="color: #8A8A8A;">Telefon:</span> <span class="highlight">0850 562 13 13</span></p>
      <p style="margin: 8px 0 0;"><span style="color: #8A8A8A;">WhatsApp:</span> <a href="https://wa.me/908505621313" style="color: #C9A84C;">+90 850 562 13 13</a></p>
    </div>
    <p>Bize ulaştığınız için teşekkür ederiz.</p>
    ${signatureBlock("Ersan Diamond Concierge")}
  `);
  return { subject, html };
}

interface OwnerLeadNotifyData {
  customerName: string;
  type: string;
  phone?: string;
  email?: string;
  leadId: string;
  notes?: string;
  productBrand?: string;
  productModel?: string;
}

export function newLeadNotifyOwner(data: OwnerLeadNotifyData): { subject: string; html: string } {
  const typeLabel = data.type === "SELL_TO_US" ? "Satış Talebi" : data.type === "INVENTORY_INQUIRY" ? "Ürün Sorgusu" : "İletişim";
  const productStr = [data.productBrand, data.productModel].filter(Boolean).join(" ");
  const subject = `Yeni Lead: ${data.customerName} | ${typeLabel}`;
  const html = emailLayout(`
    <h2>Yeni Lead Geldi</h2>
    <p>Yeni bir müşteri adayı oluşturuldu:</p>
    <table class="details-table">
      <tr><td>Müşteri</td><td>${data.customerName}</td></tr>
      <tr><td>Tür</td><td>${typeLabel}</td></tr>
      ${data.email ? `<tr><td>E-posta</td><td>${data.email}</td></tr>` : ""}
      ${data.phone ? `<tr><td>Telefon</td><td>${data.phone}</td></tr>` : ""}
      ${productStr ? `<tr><td>Ürün</td><td>${productStr}</td></tr>` : ""}
      ${data.notes ? `<tr><td>Notlar</td><td>${data.notes}</td></tr>` : ""}
    </table>
    <a href="${getAppUrl()}/panel/leads" class="cta-btn">Panelde Görüntüle</a>
  `);
  return { subject, html };
}

interface AssignmentEmailData {
  salesRepName: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  leadType: string;
  leadId: string;
  notes?: string;
  productBrand?: string;
  productModel?: string;
}

export function newLeadAssigned(data: AssignmentEmailData): { subject: string; html: string } {
  const typeLabel = data.leadType === "SELL_TO_US" ? "Satış Talebi" : "Ürün Sorgusu";
  const productStr = [data.productBrand, data.productModel].filter(Boolean).join(" ");
  const subject = `Yeni Lead Atandı: ${data.customerName} | ${typeLabel}`;
  const html = emailLayout(`
    <h2>Yeni Lead Atandı</h2>
    <p>Merhaba ${data.salesRepName},</p>
    <p>Size yeni bir lead atandı. Detaylar aşağıda:</p>
    <table class="details-table">
      <tr><td>Müşteri</td><td>${data.customerName}</td></tr>
      <tr><td>E-posta</td><td><a href="mailto:${data.customerEmail}" style="color: #C9A84C;">${data.customerEmail}</a></td></tr>
      ${data.customerPhone ? `<tr><td>Telefon</td><td>${data.customerPhone}</td></tr>` : ""}
      <tr><td>Tür</td><td>${typeLabel}</td></tr>
      ${productStr ? `<tr><td>Ürün</td><td>${productStr}</td></tr>` : ""}
      ${data.notes ? `<tr><td>Notlar</td><td>${data.notes}</td></tr>` : ""}
    </table>
    <a href="${getAppUrl()}/panel/leads" class="cta-btn">Panelde Görüntüle</a>
  `);
  return { subject, html };
}
