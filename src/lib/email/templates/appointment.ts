import { emailLayout, signatureBlock, personalGreeting } from "./base";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface AppointmentEmailData {
  customerName: string;
  serviceType: string;
  date: Date;
  salesRepName: string;
  signatureTitle?: string;
  phone?: string;
  appointmentId: string;
  newDate?: Date;
}

const serviceLabels: Record<string, string> = {
  IN_STORE: "Mağaza Ziyareti",
  VIDEO_CALL: "Video Görüşme",
  SOURCING: "Ürün Arama Talebi",
};

function formatAppointmentDate(date: Date): string {
  return format(date, "d MMMM yyyy, EEEE - HH:mm", { locale: tr });
}

export function appointmentReceived(data: AppointmentEmailData): { subject: string; html: string } {
  const subject = `Randevu Talebiniz Alındı | Ersan Diamond Concierge [ED-APPT-${data.appointmentId}]`;
  const html = emailLayout(`
    ${personalGreeting(data.salesRepName)}
    <h2>Randevu Talebiniz Alındı</h2>
    <p>Sayın ${data.customerName},</p>
    <p>Randevu talebinizi aldık. En kısa sürede sizinle iletişime geçeceğiz.</p>
    <div class="info-box">
      <div style="padding: 8px 0; border-bottom: 1px solid #2A2A2A;">
        <span style="color: #8A8A8A;">Hizmet:</span>
        <span style="float: right; color: #FAFAFA;">${serviceLabels[data.serviceType] || data.serviceType}</span>
      </div>
      <div style="padding: 8px 0;">
        <span style="color: #8A8A8A;">Tarih:</span>
        <span style="float: right; color: #FAFAFA;">${formatAppointmentDate(data.date)}</span>
      </div>
    </div>
    <p>Randevunuzu en geç 24 saat içinde onaylayacağız.</p>
    ${signatureBlock(data.salesRepName, data.signatureTitle, data.phone)}
  `);
  return { subject, html };
}

export function appointmentConfirmed(data: AppointmentEmailData): { subject: string; html: string } {
  const dateStr = format(data.date, "d MMMM yyyy HH:mm", { locale: tr });
  const subject = `Randevunuz Onaylandı | ${dateStr} [ED-APPT-${data.appointmentId}]`;
  const html = emailLayout(`
    ${personalGreeting(data.salesRepName)}
    <h2>Randevunuz Onaylandı</h2>
    <p>Sayın ${data.customerName},</p>
    <p>Randevunuz onaylanmıştır. Sizi bekliyoruz.</p>
    <div class="info-box">
      <div style="padding: 8px 0; border-bottom: 1px solid #2A2A2A;">
        <span style="color: #8A8A8A;">Hizmet:</span>
        <span style="float: right; color: #FAFAFA;">${serviceLabels[data.serviceType] || data.serviceType}</span>
      </div>
      <div style="padding: 8px 0;">
        <span style="color: #8A8A8A;">Tarih & Saat:</span>
        <span style="float: right; color: #FAFAFA;">${formatAppointmentDate(data.date)}</span>
      </div>
    </div>
    <p style="font-size: 13px; color: #8A8A8A;">İptal veya değişiklik için lütfen bu maile cevap verin.</p>
    ${signatureBlock(data.salesRepName, data.signatureTitle, data.phone)}
  `);
  return { subject, html };
}

export function appointmentRescheduled(data: AppointmentEmailData): { subject: string; html: string } {
  const newDateStr = data.newDate ? format(data.newDate, "d MMMM yyyy HH:mm", { locale: tr }) : "";
  const subject = `Randevunuz Yeniden Planlandı | ${newDateStr} [ED-APPT-${data.appointmentId}]`;
  const html = emailLayout(`
    ${personalGreeting(data.salesRepName)}
    <h2>Randevunuz Yeniden Planlandı</h2>
    <p>Sayın ${data.customerName},</p>
    <p>Randevunuz aşağıdaki yeni tarihe taşınmıştır:</p>
    <div class="info-box">
      <div style="padding: 8px 0;">
        <span style="color: #8A8A8A;">Yeni Tarih:</span>
        <span style="float: right; color: #FAFAFA;">${data.newDate ? formatAppointmentDate(data.newDate) : "Belirtilecek"}</span>
      </div>
    </div>
    <p>Herhangi bir sorunuz varsa lütfen bize yazın.</p>
    ${signatureBlock(data.salesRepName, data.signatureTitle, data.phone)}
  `);
  return { subject, html };
}

export function appointmentCancelled(data: AppointmentEmailData): { subject: string; html: string } {
  const subject = `Randevunuz İptal Edildi | Ersan Diamond [ED-APPT-${data.appointmentId}]`;
  const html = emailLayout(`
    ${personalGreeting(data.salesRepName)}
    <h2>Randevunuz İptal Edildi</h2>
    <p>Sayın ${data.customerName},</p>
    <p>Randevunuz iptal edilmiştir. Yeni bir randevu almak isterseniz web sitemizi ziyaret edebilirsiniz.</p>
    <a href="https://ersandiamond.com/concierge" class="cta-btn">Yeni Randevu Al</a>
    ${signatureBlock(data.salesRepName, data.signatureTitle, data.phone)}
  `);
  return { subject, html };
}

export function reminder24h(data: AppointmentEmailData): { subject: string; html: string } {
  const subject = `Hatırlatma: Randevunuza 24 Saat Kaldı [ED-APPT-${data.appointmentId}]`;
  const html = emailLayout(`
    <h2>Randevu Hatırlatması</h2>
    <p>Sayın ${data.customerName},</p>
    <p>Yarınki randevunuzu hatırlatmak isteriz.</p>
    <div class="info-box">
      <div style="padding: 8px 0; border-bottom: 1px solid #2A2A2A;">
        <span style="color: #8A8A8A;">Hizmet:</span>
        <span style="float: right; color: #FAFAFA;">${serviceLabels[data.serviceType] || data.serviceType}</span>
      </div>
      <div style="padding: 8px 0;">
        <span style="color: #8A8A8A;">Tarih & Saat:</span>
        <span style="float: right; color: #FAFAFA;">${formatAppointmentDate(data.date)}</span>
      </div>
    </div>
    <p style="font-size: 13px; color: #8A8A8A;">İptal veya değişiklik için bu maile cevap verebilirsiniz.</p>
    ${signatureBlock(data.salesRepName, data.signatureTitle, data.phone)}
  `);
  return { subject, html };
}

export function reminder2h(data: AppointmentEmailData): { subject: string; html: string } {
  const subject = `Hatırlatma: Randevunuza 2 Saat Kaldı [ED-APPT-${data.appointmentId}]`;
  const html = emailLayout(`
    <h2>Son Hatırlatma</h2>
    <p>Sayın ${data.customerName},</p>
    <p>Randevunuza 2 saat kaldı. Sizi bekliyoruz!</p>
    <div class="info-box">
      <div style="padding: 8px 0;">
        <span style="color: #8A8A8A;">Saat:</span>
        <span style="float: right; color: #FAFAFA;">${format(data.date, "HH:mm")}</span>
      </div>
    </div>
    ${signatureBlock(data.salesRepName, data.signatureTitle, data.phone)}
  `);
  return { subject, html };
}
