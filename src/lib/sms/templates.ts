export const smsTemplates = {
  sellToUsReceived(name: string) {
    return `Sayın ${name}, ürün satış talebiniz alındı. 24-48 saat içinde değerlendirip döneceğiz. Ersan Diamond`;
  },

  inventoryInquiryReceived(name: string, product: string) {
    return `Sayın ${name}, ${product} hakkındaki talebiniz alındı. En kısa sürede bilgi vereceğiz. Ersan Diamond`;
  },

  contactReceived(name: string) {
    return `Sayın ${name}, mesajınız alındı. 24 saat içinde dönüş yapacağız. Ersan Diamond 0850 562 13 13`;
  },

  newLeadAssigned(customerName: string, type: string) {
    return `Yeni lead: ${customerName} (${type}). Panelden inceleyin. Ersan Diamond`;
  },

  newLeadOwner(name: string, type: string) {
    const typeLabel = type === "SELL_TO_US" ? "Satış Talebi" : type === "INVENTORY_INQUIRY" ? "Ürün Sorgusu" : "İletişim";
    return `Yeni müşteri adayı: ${name} (${typeLabel}). Paneli kontrol edin. Ersan Diamond`;
  },

  newAppointmentOwner(name: string, date: string) {
    return `Yeni randevu talebi: ${name} (${date}). Panelden onaylayın. Ersan Diamond`;
  },

  appointmentReceived(name: string, date: string) {
    return `Sayın ${name}, randevu talebiniz alındı (${date}). Onay için sizinle iletişime geçeceğiz. Ersan Diamond`;
  },

  appointmentConfirmed(name: string, date: string) {
    return `Sayın ${name}, randevunuz onaylandı: ${date}. Sizi bekliyoruz! Ersan Diamond`;
  },

  appointmentRescheduled(name: string, newDate: string) {
    return `Sayın ${name}, randevunuz ${newDate} tarihine taşındı. Ersan Diamond`;
  },

  appointmentCancelled(name: string) {
    return `Sayın ${name}, randevunuz iptal edildi. Yeni randevu: ersandiamond.com/concierge Ersan Diamond`;
  },

  reminder24h(time: string) {
    return `Hatırlatma: Yarın randevunuz var (${time}). Sizi bekliyoruz! Ersan Diamond`;
  },

  reminder2h(time: string) {
    return `Hatırlatma: 2 saat sonra randevunuz var (${time}). Ersan Diamond`;
  },

  saleReceipt(name: string) {
    return `Sayın ${name}, Ersan Diamond'ı tercih ettiğiniz için teşekkürler. Ürününüz hakkında bilgi için bize ulaşın.`;
  },

  wishlistSend() {
    return `Favori listeniz e-postanıza gönderildi. Ersan Diamond`;
  },
};
