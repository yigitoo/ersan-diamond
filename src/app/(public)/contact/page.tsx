"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  CalendarDays,
  Send,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import {
  BRAND_PHONE,
  BRAND_EMAIL,
  BRAND_ADDRESS,
  BRAND_WORKING_HOURS,
} from "@/lib/utils/constants";
import { fadeUp, staggerContainer, staggerItem } from "@/lib/animations";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function ContactPage() {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const canSubmit =
    name.trim().length >= 2 &&
    email.includes("@") &&
    message.trim().length >= 10;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "INQUIRY",
          name,
          phone,
          email,
          notes: message,
          source: "WEBSITE",
        }),
      });
      setSent(true);
    } catch {
      // Silently handle error for now
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Contact info items
  // ---------------------------------------------------------------------------
  const CONTACT_ITEMS = [
    {
      icon: Phone,
      label: t("Telefon", "Phone"),
      value: BRAND_PHONE,
      href: `tel:${BRAND_PHONE.replace(/\s/g, "")}`,
    },
    {
      icon: Mail,
      label: t("E-posta", "Email"),
      value: BRAND_EMAIL,
      href: `mailto:${BRAND_EMAIL}`,
    },
    {
      icon: MapPin,
      label: t("Adres", "Address"),
      value: BRAND_ADDRESS,
      href: undefined,
    },
    {
      icon: Clock,
      label: t("Çalışma Saatleri", "Working Hours"),
      value: BRAND_WORKING_HOURS,
      href: undefined,
    },
  ];

  return (
    <div className="min-h-screen pt-32 pb-20">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 text-center mb-16">
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="font-serif text-4xl md:text-5xl mb-4"
        >
          {t("İletişim", "Contact")}
        </motion.h1>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.15 }}
          className="text-mist text-sm tracking-wider"
        >
          {t("Sizden haber almak isteriz", "We would love to hear from you")}
        </motion.p>
      </section>

      {/* Main content: 2-column */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: Contact info cards */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div variants={staggerItem}>
              <h2 className="font-serif text-2xl mb-6">{t("Bize Ulaşın", "Get in Touch")}</h2>
              <p className="text-sm text-mist leading-relaxed mb-8">
                {t(
                  "Belirli bir parça hakkında sorunuz mu var, hizmetlerimiz hakkında daha fazla bilgi mi almak istiyorsunuz veya özel bir gösterim planlamak mı istiyorsunuz? Ekibimiz size yardımcı olmak için burada.",
                  "Whether you have a question about a specific piece, want to learn more about our services, or wish to schedule a private viewing, our team is here to help."
                )}
              </p>
            </motion.div>

            {CONTACT_ITEMS.map((item) => (
              <motion.div key={item.label} variants={staggerItem}>
                <div className="flex items-start gap-4 bg-charcoal border border-slate/50 rounded-sm p-5 transition-all duration-500 hover:border-soft-white/20">
                  <div className="w-10 h-10 rounded-full border border-slate flex items-center justify-center shrink-0">
                    <item.icon size={18} className="text-brand-gold" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-mist mb-1">
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-sm text-brand-white hover:text-brand-gold transition-colors"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm text-brand-white">{item.value}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            <motion.div variants={staggerItem} className="pt-2">
              <Link href="/concierge">
                <Button variant="primary" size="lg" className="w-full">
                  <CalendarDays size={16} className="mr-2" />
                  {t("Randevu Al", "Book Appointment")}
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right: Contact form */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            {sent ? (
              <div className="bg-charcoal border border-slate/50 rounded-sm p-8 md:p-12 text-center h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-brand-white text-brand-black flex items-center justify-center mx-auto mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <Check size={28} />
                  </motion.div>
                </div>
                <h3 className="font-serif text-2xl mb-3">{t("Mesajınız Gönderildi", "Message Sent")}</h3>
                <p className="text-sm text-mist mb-6">
                  {t(
                    "Bize ulaştığınız için teşekkürler. En kısa sürede size döneceğiz.",
                    "Thank you for reaching out. We will get back to you as soon as possible."
                  )}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSent(false);
                    setName("");
                    setEmail("");
                    setPhone("");
                    setMessage("");
                  }}
                >
                  {t("Başka Mesaj Gönder", "Send Another Message")}
                </Button>
              </div>
            ) : (
              <div className="bg-charcoal border border-slate/50 rounded-sm p-8 md:p-10 space-y-6">
                <h2 className="font-serif text-2xl mb-2">{t("Mesaj Gönderin", "Send a Message")}</h2>
                <Input
                  label={t("Ad Soyad", "Full Name")}
                  placeholder={t("Ahmet Yılmaz", "John Doe")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    label={t("E-posta", "Email")}
                    placeholder="you@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Input
                    label={t("Telefon (isteğe bağlı)", "Phone (optional)")}
                    placeholder="+90 (5XX) XXX XX XX"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <Textarea
                  label={t("Mesaj", "Message")}
                  placeholder={t("Size nasıl yardımcı olabiliriz...", "Tell us how we can help...")}
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleSubmit}
                  loading={loading}
                  disabled={!canSubmit}
                >
                  <Send size={16} className="mr-2" />
                  {t("Mesaj Gönder", "Send Message")}
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Map placeholder */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="aspect-video bg-charcoal border border-slate/50 rounded-sm flex items-center justify-center"
        >
          <div className="text-center">
            <MapPin size={32} className="mx-auto text-mist/30 mb-3" />
            <p className="text-sm text-mist">{t("Harita", "Map")}</p>
            <p className="text-xs text-mist/50 mt-1">{BRAND_ADDRESS}</p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
