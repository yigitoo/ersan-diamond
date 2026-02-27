"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store,
  Video,
  SearchCheck,
  ChevronRight,
  ChevronLeft,
  Check,
  CalendarDays,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { fadeUp, slideReveal } from "@/lib/animations";
import { SERVICE_TYPE_LABELS } from "@/lib/utils/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type ServiceType = "IN_STORE" | "VIDEO_CALL" | "SOURCING";

interface ServiceOption {
  type: ServiceType;
  icon: React.ReactNode;
  title: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------
function generateNext14Days(): Date[] {
  const days: Date[] = [];
  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

const TIME_SLOTS = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

function formatDateLabel(date: Date, locale: string): { day: string; weekday: string; month: string } {
  const day = date.getDate().toString();
  const weekday = date.toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", { weekday: "short" });
  const month = date.toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", { month: "short" });
  return { day, weekday, month };
}

function isSunday(date: Date) {
  return date.getDay() === 0;
}

// ---------------------------------------------------------------------------
// Step animation wrapper
// ---------------------------------------------------------------------------
const stepVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.3 } },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function ConciergePage() {
  const { t, locale } = useI18n();
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [product, setProduct] = useState("");
  const [notes, setNotes] = useState("");

  const dates = useMemo(() => generateNext14Days(), []);

  const canProceedStep1 = selectedService !== null;
  const canProceedStep2 = selectedDate !== null && selectedTime !== null;
  const canSubmit = name.trim().length >= 2 && (phone.trim().length >= 10 || email.includes("@"));

  // ---------------------------------------------------------------------------
  // Services (inside component for t() access)
  // ---------------------------------------------------------------------------
  const SERVICES: ServiceOption[] = [
    {
      type: "IN_STORE",
      icon: <Store size={28} />,
      title: t("Mağaza Ziyareti", "In-Store Visit"),
      description: t(
        "Özel ve kişisel bir izleme deneyimi için showroom'umuzu ziyaret edin. Uzman ekibimizle parçaları yakından inceleyin.",
        "Visit our showroom for a private, personalized viewing experience. Inspect pieces in hand with our expert team."
      ),
    },
    {
      type: "VIDEO_CALL",
      icon: <Video size={28} />,
      title: t("Görüntülü Görüşme", "Video Call"),
      description: t(
        "Uzmanlarımızla uzaktan bağlanın. Herhangi bir parçayı canlı video ile detaylı olarak gösteririz.",
        "Connect with our specialists remotely. We will showcase any piece in detail via live video."
      ),
    },
    {
      type: "SOURCING",
      icon: <SearchCheck size={28} />,
      title: t("Ürün Arama", "Sourcing Request"),
      description: t(
        "Belirli bir parça mı arıyorsunuz? Global ağımız sizin için nadir ve aranan ürünleri bulabilir.",
        "Looking for a specific piece? Our global sourcing network can locate rare and sought-after items for you."
      ),
    },
  ];

  // ---------------------------------------------------------------------------
  // Step indicator
  // ---------------------------------------------------------------------------
  function StepIndicator({ current }: { current: number }) {
    const steps = [
      t("Hizmet", "Service"),
      t("Tarih & Saat", "Date & Time"),
      t("Bilgileriniz", "Your Details"),
    ];
    return (
      <div className="flex items-center justify-center gap-2 mb-12">
        {steps.map((label, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === current;
          const isComplete = stepNum < current;
          return (
            <div key={label} className="flex items-center gap-2">
              {i > 0 && (
                <div
                  className={cn(
                    "w-8 md:w-12 h-px",
                    isComplete || isActive ? "bg-brand-white" : "bg-slate"
                  )}
                />
              )}
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-500",
                    isComplete
                      ? "bg-brand-white text-brand-black"
                      : isActive
                        ? "border-2 border-brand-white text-brand-white"
                        : "border border-slate text-mist"
                  )}
                >
                  {isComplete ? <Check size={14} /> : stepNum}
                </div>
                <span
                  className={cn(
                    "hidden md:block text-xs uppercase tracking-wider",
                    isActive ? "text-brand-white" : "text-mist"
                  )}
                >
                  {label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
    }, 1500);
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-md mx-auto px-6"
        >
          <div className="w-20 h-20 rounded-full bg-brand-white text-brand-black flex items-center justify-center mx-auto mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <Check size={36} />
            </motion.div>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl mb-4">
            {t("Randevu Talebiniz Alındı", "Appointment Request Received")}
          </h2>
          <p className="text-mist mb-2">
            {t(
              `Teşekkürler, ${name}. ${SERVICE_TYPE_LABELS[selectedService!]?.toLowerCase()} talebinizi aldık.`,
              `Thank you, ${name}. We have received your ${SERVICE_TYPE_LABELS[selectedService!]?.toLowerCase()} request.`
            )}
          </p>
          <p className="text-mist mb-8">
            {t(
              `Randevunuzu 24 saat içinde ${email ? "e-posta" : "telefon"} ile onaylayacağız.`,
              `We will confirm your appointment within 24 hours via ${email ? "email" : "phone"}.`
            )}
          </p>
          <div className="space-y-3">
            <Button variant="outline" size="lg" className="w-full">
              <CalendarDays size={16} className="mr-2" />
              {t("Takvime Ekle", "Add to Calendar")}
            </Button>
            <Link href="/" className="block">
              <Button variant="ghost" size="lg" className="w-full">
                <Home size={16} className="mr-2" />
                {t("Ana Sayfaya Dön", "Back to Home")}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-center mb-12"
        >
          <h1 className="font-serif text-4xl md:text-5xl mb-4">{t("Konsiyerj", "Concierge")}</h1>
          <p className="text-mist text-sm tracking-wider">
            {t(
              "Uzmanlarımızla özel bir randevu oluşturun",
              "Book a private appointment with our specialists"
            )}
          </p>
        </motion.div>

        {/* Step indicator */}
        <StepIndicator current={step} />

        {/* Steps */}
        <AnimatePresence mode="wait">
          {/* ---- STEP 1: Choose Service ---- */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {SERVICES.map((svc) => (
                  <button
                    key={svc.type}
                    onClick={() => setSelectedService(svc.type)}
                    className={cn(
                      "text-left p-6 bg-charcoal border rounded-sm transition-all duration-500",
                      selectedService === svc.type
                        ? "border-brand-gold bg-charcoal/80"
                        : "border-slate/50 hover:border-soft-white/30"
                    )}
                  >
                    <div
                      className={cn(
                        "mb-4 transition-colors",
                        selectedService === svc.type ? "text-brand-gold" : "text-mist"
                      )}
                    >
                      {svc.icon}
                    </div>
                    <h3 className="font-serif text-lg mb-2">{svc.title}</h3>
                    <p className="text-xs text-mist leading-relaxed">{svc.description}</p>
                  </button>
                ))}
              </div>

              <div className="flex justify-end mt-8">
                <Button
                  variant="primary"
                  size="lg"
                  disabled={!canProceedStep1}
                  onClick={() => setStep(2)}
                >
                  {t("Devam Et", "Continue")}
                  <ChevronRight size={16} className="ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ---- STEP 2: Date & Time ---- */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {/* Date picker */}
              <div className="mb-8">
                <p className="text-xs uppercase tracking-wider text-mist mb-4">{t("Tarih Seçin", "Select Date")}</p>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                  {dates.map((date) => {
                    const { day, weekday, month } = formatDateLabel(date, locale);
                    const sunday = isSunday(date);
                    const isSelected =
                      selectedDate?.toDateString() === date.toDateString();
                    return (
                      <button
                        key={date.toISOString()}
                        disabled={sunday}
                        onClick={() => setSelectedDate(date)}
                        className={cn(
                          "flex-shrink-0 w-16 py-3 rounded-sm text-center transition-all duration-300",
                          sunday
                            ? "opacity-30 cursor-not-allowed border border-slate/30"
                            : isSelected
                              ? "bg-brand-white text-brand-black"
                              : "border border-slate/50 hover:border-soft-white/30"
                        )}
                      >
                        <p className="text-[10px] uppercase tracking-wider text-current opacity-60">
                          {weekday}
                        </p>
                        <p className="text-lg font-serif">{day}</p>
                        <p className="text-[10px] uppercase tracking-wider text-current opacity-60">
                          {month}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time slots */}
              <div className="mb-8">
                <p className="text-xs uppercase tracking-wider text-mist mb-4">{t("Saat Seçin", "Select Time")}</p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {TIME_SLOTS.map((time) => {
                    const isSelected = selectedTime === time;
                    return (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={cn(
                          "py-3 rounded-sm text-sm transition-all duration-300",
                          isSelected
                            ? "bg-brand-white text-brand-black"
                            : "border border-slate/50 hover:border-soft-white/30 text-brand-white"
                        )}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between mt-8">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ChevronLeft size={16} className="mr-2" />
                  {t("Geri", "Back")}
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  disabled={!canProceedStep2}
                  onClick={() => setStep(3)}
                >
                  {t("Devam Et", "Continue")}
                  <ChevronRight size={16} className="ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ---- STEP 3: Your Details ---- */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <div className="space-y-6 max-w-lg mx-auto">
                <Input
                  label={t("Ad Soyad", "Full Name")}
                  placeholder={t("Ahmet Yılmaz", "John Doe")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  label={t("Telefon", "Phone")}
                  placeholder="+90 (5XX) XXX XX XX"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Input
                  label={t("E-posta", "Email")}
                  placeholder="you@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  label={t("İlgilendiğiniz Ürün (isteğe bağlı)", "Interested Product (optional)")}
                  placeholder={t("örn. Rolex Daytona 116500LN", "e.g. Rolex Daytona 116500LN")}
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                />
                <Textarea
                  label={t("Notlar (isteğe bağlı)", "Notes (optional)")}
                  placeholder={t("Ek detaylar veya istekleriniz...", "Any additional details or requests...")}
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between mt-8 max-w-lg mx-auto">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  <ChevronLeft size={16} className="mr-2" />
                  {t("Geri", "Back")}
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  disabled={!canSubmit}
                  loading={submitting}
                  onClick={handleSubmit}
                >
                  {t("Talebi Gönder", "Submit Request")}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
