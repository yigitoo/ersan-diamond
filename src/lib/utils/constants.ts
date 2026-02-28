// Bilingual label helper
export type BiLabel = { tr: string; en: string };
export function tl(t: (tr: string, en: string) => string, label?: BiLabel | string): string {
  if (!label) return "";
  if (typeof label === "string") return label;
  return t(label.tr, label.en);
}
export function enLabel(label?: BiLabel | string): string {
  if (!label) return "";
  if (typeof label === "string") return label;
  return label.en;
}

// Brand
export const BRAND_NAME = "Ersan Diamond";
export const BRAND_EMAIL = "info@ersandiamond.com";
export const BRAND_PHONE = "0850 562 13 13";
export const BRAND_WHATSAPP = "https://wa.me/908505621313";
export const BRAND_INSTAGRAM = "https://instagram.com/ersandiamond";
export const BRAND_ADDRESS = "İstanbul, Türkiye";
export const BRAND_WORKING_HOURS = "Pazartesi - Cumartesi: 10:00 - 19:00";

// Watch brands
export const WATCH_BRANDS = [
  "Rolex",
  "Patek Philippe",
  "Audemars Piguet",
  "Richard Mille",
  "Vacheron Constantin",
  "A. Lange & Söhne",
  "Omega",
  "Cartier",
  "IWC",
  "Jaeger-LeCoultre",
  "Hublot",
  "Breguet",
  "Panerai",
  "Tudor",
  "TAG Heuer",
] as const;

// Hermes models
export const HERMES_MODELS = [
  "Birkin",
  "Kelly",
  "Constance",
  "Picotin",
  "Evelyne",
  "Lindy",
  "Bolide",
  "Garden Party",
  "Herbag",
  "Halzan",
] as const;

// Jewelry brands
export const JEWELRY_TYPES = [
  "Yüzük",
  "Kolye",
  "Bilezik",
  "Küpe",
  "Broş",
  "Set",
] as const;

// Product conditions
export const CONDITION_LABELS: Record<string, BiLabel> = {
  UNWORN: { tr: "Kullanılmamış", en: "Unworn" },
  EXCELLENT: { tr: "Mükemmel", en: "Excellent" },
  VERY_GOOD: { tr: "Çok İyi", en: "Very Good" },
  GOOD: { tr: "İyi", en: "Good" },
  FAIR: { tr: "Orta", en: "Fair" },
};

// Availability labels
export const AVAILABILITY_LABELS: Record<string, BiLabel> = {
  AVAILABLE: { tr: "Mevcut", en: "Available" },
  RESERVED: { tr: "Rezerve", en: "Reserved" },
  SOLD: { tr: "Satıldı", en: "Sold" },
};

// Lead status labels and colors
export const LEAD_STATUS_CONFIG: Record<string, { label: BiLabel; color: string }> = {
  NEW: { label: { tr: "Yeni", en: "New" }, color: "bg-blue-500/20 text-blue-400" },
  CONTACTED: { label: { tr: "İletişime Geçildi", en: "Contacted" }, color: "bg-yellow-500/20 text-yellow-400" },
  QUALIFIED: { label: { tr: "Nitelikli", en: "Qualified" }, color: "bg-purple-500/20 text-purple-400" },
  PROPOSAL: { label: { tr: "Teklif", en: "Proposal" }, color: "bg-orange-500/20 text-orange-400" },
  WON: { label: { tr: "Kazanıldı", en: "Won" }, color: "bg-green-500/20 text-green-400" },
  LOST: { label: { tr: "Kaybedildi", en: "Lost" }, color: "bg-red-500/20 text-red-400" },
};

// Appointment status config
export const APPOINTMENT_STATUS_CONFIG: Record<string, { label: BiLabel; color: string }> = {
  PENDING: { label: { tr: "Beklemede", en: "Pending" }, color: "bg-yellow-500/20 text-yellow-400" },
  CONFIRMED: { label: { tr: "Onaylandı", en: "Confirmed" }, color: "bg-green-500/20 text-green-400" },
  RESCHEDULED: { label: { tr: "Yeniden Planlandı", en: "Rescheduled" }, color: "bg-blue-500/20 text-blue-400" },
  CANCELLED: { label: { tr: "İptal Edildi", en: "Cancelled" }, color: "bg-red-500/20 text-red-400" },
  COMPLETED: { label: { tr: "Tamamlandı", en: "Completed" }, color: "bg-emerald-500/20 text-emerald-400" },
  NO_SHOW: { label: { tr: "Gelmedi", en: "No Show" }, color: "bg-gray-500/20 text-gray-400" },
};

// Service type labels
export const SERVICE_TYPE_LABELS: Record<string, BiLabel> = {
  IN_STORE: { tr: "Mağaza Ziyareti", en: "In-Store Visit" },
  VIDEO_CALL: { tr: "Görüntülü Görüşme", en: "Video Call" },
  SOURCING: { tr: "Ürün Arama", en: "Sourcing Request" },
};

// Payment method labels
export const PAYMENT_METHOD_LABELS: Record<string, BiLabel> = {
  CASH: { tr: "Nakit", en: "Cash" },
  TRANSFER: { tr: "Havale/EFT", en: "Bank Transfer" },
  CARD: { tr: "Kredi Kartı", en: "Credit Card" },
  CRYPTO: { tr: "Kripto", en: "Crypto" },
  OTHER: { tr: "Diğer", en: "Other" },
};

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Calendar
export const SLOT_DURATION_MINUTES = 60;
export const SLOT_BUFFER_MINUTES = 15;
export const TIMEZONE = "Europe/Istanbul";

// Default business hours
export const DEFAULT_BUSINESS_HOURS = [
  { dayOfWeek: 0, open: "10:00", close: "19:00", closed: true },  // Sunday
  { dayOfWeek: 1, open: "10:00", close: "19:00", closed: false }, // Monday
  { dayOfWeek: 2, open: "10:00", close: "19:00", closed: false },
  { dayOfWeek: 3, open: "10:00", close: "19:00", closed: false },
  { dayOfWeek: 4, open: "10:00", close: "19:00", closed: false },
  { dayOfWeek: 5, open: "10:00", close: "19:00", closed: false },
  { dayOfWeek: 6, open: "10:00", close: "19:00", closed: false }, // Saturday
];
