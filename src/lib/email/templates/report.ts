import { emailLayout } from "./base";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export function dailyReportEmail(date: Date): { subject: string; html: string } {
  const dateStr = format(date, "yyyy-MM-dd");
  const subject = `Daily Report | ${dateStr} | Ersan Diamond`;
  const html = emailLayout(`
    <h2>Günlük Rapor</h2>
    <p>${format(date, "d MMMM yyyy, EEEE", { locale: tr })} tarihli günlük rapor ekte yer almaktadır.</p>
    <p>PDF dosyasını indirip detaylı inceleyebilirsiniz.</p>
    <hr class="divider">
    <p style="font-size: 13px; color: #8A8A8A;">Bu rapor otomatik olarak oluşturulmuştur.</p>
  `);
  return { subject, html };
}
