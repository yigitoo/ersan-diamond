import { wrapTemplate } from "./base";

export const EMAIL_TEMPLATES: Record<string, { subject: string; html: string }> = {
  "appointment-received": {
    subject: "Randevu Talebiniz Alındı | Ersan Diamond Concierge",
    html: wrapTemplate(`
      <p>Merhaba <strong>{customerName}</strong>,</p>
      <p>Merhaba, ben {salesRepName}. Ersan Diamond Concierge ekibinden yazıyorum.</p>
      <p>Randevu talebiniz başarıyla alınmıştır. En kısa sürede talebiniz değerlendirilecek ve sizinle iletişime geçilecektir.</p>
      <table class="details-table">
        <tr><td>Hizmet</td><td>{serviceType}</td></tr>
        <tr><td>Tarih</td><td>{date}</td></tr>
        <tr><td>Saat</td><td>{time}</td></tr>
      </table>
      <p>Herhangi bir sorunuz olursa lütfen bu maile cevap verin.</p>
    `),
  },

  "appointment-confirmed": {
    subject: "Randevunuz Onaylandı | {date} {time}",
    html: wrapTemplate(`
      <p>Merhaba <strong>{customerName}</strong>,</p>
      <p>Merhaba, ben {salesRepName}. Ersan Diamond Concierge ekibinden yazıyorum.</p>
      <p>Randevunuz <span class="highlight">onaylanmıştır</span>.</p>
      <table class="details-table">
        <tr><td>Hizmet</td><td>{serviceType}</td></tr>
        <tr><td>Tarih</td><td>{date}</td></tr>
        <tr><td>Saat</td><td>{time}</td></tr>
        <tr><td>Adres</td><td>İstanbul, Türkiye</td></tr>
      </table>
      <p>Randevunuzu takviminize ekleyebilirsiniz.</p>
    `),
  },

  "appointment-rescheduled": {
    subject: "Randevunuz Yeniden Planlandı | {newDate} {newTime}",
    html: wrapTemplate(`
      <p>Merhaba <strong>{customerName}</strong>,</p>
      <p>Merhaba, ben {salesRepName}. Ersan Diamond Concierge ekibinden yazıyorum.</p>
      <p>Randevunuz yeniden planlanmıştır.</p>
      <table class="details-table">
        <tr><td>Yeni Tarih</td><td>{newDate}</td></tr>
        <tr><td>Yeni Saat</td><td>{newTime}</td></tr>
        <tr><td>Hizmet</td><td>{serviceType}</td></tr>
      </table>
      <p>Herhangi bir sorunuz olursa lütfen bizimle iletişime geçin.</p>
    `),
  },

  "appointment-cancelled": {
    subject: "Randevunuz İptal Edildi | Ersan Diamond",
    html: wrapTemplate(`
      <p>Merhaba <strong>{customerName}</strong>,</p>
      <p>Merhaba, ben {salesRepName}. Ersan Diamond Concierge ekibinden yazıyorum.</p>
      <p>{date} tarihli randevunuz iptal edilmiştir.</p>
      <p>Yeni bir randevu oluşturmak isterseniz:</p>
      <a href="https://ersandiamond.com/concierge" class="cta">Yeni Randevu Al</a>
    `),
  },

  "reminder-24h": {
    subject: "Hatırlatma: Randevunuza 24 Saat Kaldı",
    html: wrapTemplate(`
      <p>Merhaba <strong>{customerName}</strong>,</p>
      <p>Merhaba, ben {salesRepName}. Ersan Diamond Concierge ekibinden yazıyorum.</p>
      <p>Yarınki randevunuzu hatırlatmak istiyoruz.</p>
      <table class="details-table">
        <tr><td>Tarih</td><td>{date}</td></tr>
        <tr><td>Saat</td><td>{time}</td></tr>
        <tr><td>Hizmet</td><td>{serviceType}</td></tr>
      </table>
      <p>Sizi bekliyoruz!</p>
    `),
  },

  "reminder-2h": {
    subject: "Hatırlatma: Randevunuza 2 Saat Kaldı",
    html: wrapTemplate(`
      <p>Merhaba <strong>{customerName}</strong>,</p>
      <p>Randevunuza 2 saat kaldı. Sizi bekliyoruz!</p>
      <table class="details-table">
        <tr><td>Saat</td><td>{time}</td></tr>
        <tr><td>Hizmet</td><td>{serviceType}</td></tr>
      </table>
    `),
  },

  "sell-to-us-received": {
    subject: "Ürün Satış Talebiniz Alındı | Ersan Diamond",
    html: wrapTemplate(`
      <p>Merhaba <strong>{customerName}</strong>,</p>
      <p>Merhaba, ben {salesRepName}. Ersan Diamond Concierge ekibinden yazıyorum.</p>
      <p>Ürün satış talebiniz başarıyla alınmıştır. Uzman ekibimiz değerlendirme yapacak ve en kısa sürede sizinle iletişime geçecektir.</p>
      <table class="details-table">
        <tr><td>Ürün</td><td>{productBrand} {productModel}</td></tr>
        <tr><td>Referans</td><td>{productReference}</td></tr>
      </table>
    `),
  },

  "inventory-inquiry-received": {
    subject: "Ürün Talebiniz | {productBrand} {productModel} {productReference}",
    html: wrapTemplate(`
      <p>Merhaba <strong>{customerName}</strong>,</p>
      <p>Merhaba, ben {salesRepName}. Ersan Diamond Concierge ekibinden yazıyorum.</p>
      <p>İlgilendiğiniz ürün hakkındaki talebiniz alınmıştır.</p>
      <table class="details-table">
        <tr><td>Ürün</td><td>{productBrand} {productModel}</td></tr>
        <tr><td>Referans</td><td>{productReference}</td></tr>
      </table>
      <p>Detaylı bilgi ve fiyat için sizinle en kısa sürede iletişime geçeceğiz.</p>
    `),
  },

  "daily-report": {
    subject: "Daily Report | {date} | Ersan Diamond",
    html: wrapTemplate(`
      <p>Günlük rapor ekte sunulmuştur.</p>
      <table class="details-table">
        <tr><td>Tarih</td><td>{date}</td></tr>
        <tr><td>Satış</td><td>{salesCount} adet</td></tr>
        <tr><td>Ciro</td><td>{totalRevenue}</td></tr>
        <tr><td>Yeni Lead</td><td>{newLeads}</td></tr>
        <tr><td>Randevu</td><td>{appointments}</td></tr>
      </table>
    `),
  },

  "sale-receipt": {
    subject: "Satışınız Hakkında | Ersan Diamond",
    html: wrapTemplate(`
      <p>Merhaba <strong>{buyerName}</strong>,</p>
      <p>Merhaba, ben {salesRepName}. Ersan Diamond Concierge ekibinden yazıyorum.</p>
      <p>Satışınız için teşekkür ederiz. İşlem detayları aşağıdadır:</p>
      <table class="details-table">
        <tr><td>Ürün</td><td>{productBrand} {productModel}</td></tr>
        <tr><td>Referans</td><td>{productReference}</td></tr>
        <tr><td>Fiyat</td><td>{salePrice}</td></tr>
        <tr><td>Tarih</td><td>{date}</td></tr>
      </table>
      <p>Herhangi bir sorunuz olursa lütfen bizimle iletişime geçin.</p>
    `),
  },
};
