// Brand
export const BRAND_NAME = "Ersan Diamond";
export const BRAND_EMAIL = "info@ersandiamond.com";
export const BRAND_PHONE = "+90 (212) 000 0000";
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

// Product conditions
export const CONDITION_LABELS: Record<string, string> = {
  UNWORN: "Unworn",
  EXCELLENT: "Excellent",
  VERY_GOOD: "Very Good",
  GOOD: "Good",
  FAIR: "Fair",
};

// Availability labels
export const AVAILABILITY_LABELS: Record<string, string> = {
  AVAILABLE: "Available",
  RESERVED: "Reserved",
  SOLD: "Sold",
};

// Lead status labels and colors
export const LEAD_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  NEW: { label: "New", color: "bg-blue-500/20 text-blue-400" },
  CONTACTED: { label: "Contacted", color: "bg-yellow-500/20 text-yellow-400" },
  QUALIFIED: { label: "Qualified", color: "bg-purple-500/20 text-purple-400" },
  PROPOSAL: { label: "Proposal", color: "bg-orange-500/20 text-orange-400" },
  WON: { label: "Won", color: "bg-green-500/20 text-green-400" },
  LOST: { label: "Lost", color: "bg-red-500/20 text-red-400" },
};

// Appointment status config
export const APPOINTMENT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "bg-yellow-500/20 text-yellow-400" },
  CONFIRMED: { label: "Confirmed", color: "bg-green-500/20 text-green-400" },
  RESCHEDULED: { label: "Rescheduled", color: "bg-blue-500/20 text-blue-400" },
  CANCELLED: { label: "Cancelled", color: "bg-red-500/20 text-red-400" },
  COMPLETED: { label: "Completed", color: "bg-emerald-500/20 text-emerald-400" },
  NO_SHOW: { label: "No Show", color: "bg-gray-500/20 text-gray-400" },
};

// Service type labels
export const SERVICE_TYPE_LABELS: Record<string, string> = {
  IN_STORE: "In-Store Visit",
  VIDEO_CALL: "Video Call",
  SOURCING: "Sourcing Request",
};

// Payment method labels
export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Nakit",
  TRANSFER: "Havale/EFT",
  CARD: "Kredi Kartı",
  CRYPTO: "Kripto",
  OTHER: "Diğer",
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
