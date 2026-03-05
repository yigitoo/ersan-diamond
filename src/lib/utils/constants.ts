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

// Delivery status config
export const DELIVERY_STATUS_CONFIG: Record<string, { label: BiLabel; color: string }> = {
  PENDING:    { label: { tr: "Beklemede", en: "Pending" }, color: "bg-yellow-500/20 text-yellow-400" },
  ASSIGNED:   { label: { tr: "Atandı", en: "Assigned" }, color: "bg-blue-500/20 text-blue-400" },
  PICKED_UP:  { label: { tr: "Teslim Alındı", en: "Picked Up" }, color: "bg-indigo-500/20 text-indigo-400" },
  IN_TRANSIT: { label: { tr: "Yolda", en: "In Transit" }, color: "bg-purple-500/20 text-purple-400" },
  DELIVERED:  { label: { tr: "Teslim Edildi", en: "Delivered" }, color: "bg-green-500/20 text-green-400" },
  CANCELLED:  { label: { tr: "İptal Edildi", en: "Cancelled" }, color: "bg-red-500/20 text-red-400" },
};

export const DELIVERY_PRIORITY_CONFIG: Record<string, { label: BiLabel; color: string }> = {
  NORMAL: { label: { tr: "Normal", en: "Normal" }, color: "bg-slate text-soft-white" },
  HIGH:   { label: { tr: "Yüksek", en: "High" }, color: "bg-orange-500/20 text-orange-400" },
  URGENT: { label: { tr: "Acil", en: "Urgent" }, color: "bg-red-500/20 text-red-400" },
};

export const DELIVERY_TIME_SLOT_LABELS: Record<string, BiLabel> = {
  MORNING:   { tr: "Sabah (09:00-12:00)", en: "Morning (09:00-12:00)" },
  AFTERNOON: { tr: "Öğleden Sonra (12:00-17:00)", en: "Afternoon (12:00-17:00)" },
  EVENING:   { tr: "Akşam (17:00-20:00)", en: "Evening (17:00-20:00)" },
  FLEXIBLE:  { tr: "Esnek", en: "Flexible" },
};

export const DEFAULT_PICKUP_ADDRESS = {
  label: "Ersan Diamond Showroom",
  street: "",
  city: "İstanbul",
  country: "Türkiye",
};

// Istanbul geographic data
export const ISTANBUL_CENTER = { lat: 41.0082, lng: 28.9784 };
export const DEFAULT_PICKUP_COORDS = { lat: 41.0422, lng: 29.0083 }; // Nişantaşı area

export const ISTANBUL_DISTRICTS: Record<string, { lat: number; lng: number }> = {
  "Kadıköy":     { lat: 40.9927, lng: 29.0230 },
  "Beşiktaş":    { lat: 41.0430, lng: 29.0056 },
  "Şişli":       { lat: 41.0602, lng: 28.9877 },
  "Beyoğlu":     { lat: 41.0370, lng: 28.9770 },
  "Nişantaşı":   { lat: 41.0480, lng: 28.9950 },
  "Etiler":      { lat: 41.0800, lng: 29.0340 },
  "Bebek":       { lat: 41.0770, lng: 29.0440 },
  "Sarıyer":     { lat: 41.1670, lng: 29.0570 },
  "Üsküdar":     { lat: 41.0230, lng: 29.0150 },
  "Bakırköy":    { lat: 40.9800, lng: 28.8770 },
  "Ataşehir":    { lat: 40.9923, lng: 29.1244 },
  "Levent":      { lat: 41.0820, lng: 29.0130 },
  "Fatih":       { lat: 41.0186, lng: 28.9397 },
  "Taksim":      { lat: 41.0370, lng: 28.9850 },
  "Maltepe":     { lat: 40.9350, lng: 29.1300 },
  "Kartal":      { lat: 40.8905, lng: 29.1872 },
};

// Map tile layer options
export const MAP_TILE_LAYERS = {
  dark: {
    name: { tr: "Koyu", en: "Dark" } as BiLabel,
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://osm.org/copyright">OSM</a> &copy; CartoDB',
  },
  light: {
    name: { tr: "Açık", en: "Light" } as BiLabel,
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://osm.org/copyright">OSM</a> &copy; CartoDB',
  },
  street: {
    name: { tr: "Sokak", en: "Street" } as BiLabel,
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>',
  },
  satellite: {
    name: { tr: "Uydu", en: "Satellite" } as BiLabel,
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; Esri',
  },
  topo: {
    name: { tr: "Topoğrafik", en: "Topographic" } as BiLabel,
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
  },
} as const;
export type MapTileKey = keyof typeof MAP_TILE_LAYERS;

// Turkey major cities (for address resolution outside Istanbul)
export const TURKEY_CITIES: Record<string, { lat: number; lng: number }> = {
  "İstanbul":   { lat: 41.0082, lng: 28.9784 },
  "Ankara":     { lat: 39.9334, lng: 32.8597 },
  "İzmir":      { lat: 38.4192, lng: 27.1287 },
  "Bursa":      { lat: 40.1885, lng: 29.0610 },
  "Antalya":    { lat: 36.8969, lng: 30.7133 },
  "Adana":      { lat: 37.0000, lng: 35.3213 },
  "Konya":      { lat: 37.8746, lng: 32.4932 },
  "Gaziantep":  { lat: 37.0662, lng: 37.3833 },
  "Mersin":     { lat: 36.8121, lng: 34.6415 },
  "Kayseri":    { lat: 38.7312, lng: 35.4787 },
  "Eskişehir":  { lat: 39.7767, lng: 30.5206 },
  "Trabzon":    { lat: 41.0027, lng: 39.7168 },
  "Samsun":     { lat: 41.2867, lng: 36.3300 },
  "Denizli":    { lat: 37.7765, lng: 29.0864 },
  "Muğla":      { lat: 37.2153, lng: 28.3636 },
  "Bodrum":     { lat: 37.0343, lng: 27.4305 },
  "Diyarbakır": { lat: 37.9144, lng: 40.2306 },
  "Erzurum":    { lat: 39.9055, lng: 41.2658 },
  "Malatya":    { lat: 38.3552, lng: 38.3095 },
  "Tekirdağ":   { lat: 40.9781, lng: 27.5116 },
};

export const DELIVERY_MAP_COLORS: Record<string, string> = {
  PENDING:    "#EAB308", // yellow
  ASSIGNED:   "#3B82F6", // blue
  PICKED_UP:  "#6366F1", // indigo
  IN_TRANSIT: "#A855F7", // purple
  DELIVERED:  "#22C55E", // green
  CANCELLED:  "#EF4444", // red
};

export const AUTO_ASSIGN_LABELS = {
  button: { tr: "Otomatik Ata", en: "Auto-Assign" } as BiLabel,
  buttonBatch: { tr: "Tümünü Ata", en: "Assign All" } as BiLabel,
  showRoute: { tr: "Rota Göster", en: "Show Route" } as BiLabel,
  myRoute: { tr: "Rotam", en: "My Route" } as BiLabel,
  noRoute: { tr: "Aktif teslimat yok", en: "No active deliveries" } as BiLabel,
  stops: { tr: "durak", en: "stop(s)" } as BiLabel,
  estimatedTime: { tr: "Tahmini süre", en: "Estimated time" } as BiLabel,
  totalDistance: { tr: "Toplam mesafe", en: "Total distance" } as BiLabel,
  routeSummary: { tr: "Rota Özeti", en: "Route Summary" } as BiLabel,
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
