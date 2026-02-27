import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { tr } from "date-fns/locale";

export function formatPrice(price: number, currency = "EUR"): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return format(d, "dd MMM yyyy", { locale: tr });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return format(d, "dd MMM yyyy HH:mm", { locale: tr });
}

export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return format(d, "HH:mm", { locale: tr });
}

export function formatRelative(date: Date | string): string {
  const d = new Date(date);
  if (isToday(d)) return `Bugün ${format(d, "HH:mm")}`;
  if (isYesterday(d)) return `Dün ${format(d, "HH:mm")}`;
  return formatDistanceToNow(d, { addSuffix: true, locale: tr });
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith("90")) {
    return `+90 (${cleaned.slice(2, 5)}) ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  return phone;
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

export function capitalize(str: string): string {
  return str.charAt(0).toLocaleUpperCase("tr") + str.slice(1).toLocaleLowerCase("tr");
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toLocaleUpperCase("tr")
    .slice(0, 2);
}
