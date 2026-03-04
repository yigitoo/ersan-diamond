"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  CalendarDays,
  Video,
  Phone,
  ChevronLeft,
  Gem,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { SectionHeading } from "@/components/shared/section-heading";
import { useI18n } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils/formatters";
import { CONDITION_LABELS, BRAND_WHATSAPP, tl } from "@/lib/utils/constants";
import { WishlistButton } from "@/components/shared/wishlist-button";
import { InterestForm } from "@/components/shared/interest-form";
import { fadeUp, staggerContainer, staggerItem } from "@/lib/animations";
import type { IProduct, JewelrySpecs } from "@/types";

// ---------------------------------------------------------------------------
// Spec row
// ---------------------------------------------------------------------------
function SpecRow({ label, value }: { label: string; value?: string | React.ReactNode }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="spec-table-row">
      <span className="text-xs uppercase tracking-wider text-mist">{label}</span>
      <span className="text-sm text-brand-white">{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lightbox
// ---------------------------------------------------------------------------
function Lightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="lightbox-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-6 right-6 z-50 text-white/80 hover:text-white transition-colors"
      >
        <X size={28} />
      </button>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 250 }}
        onClick={(e) => e.stopPropagation()}
        className="max-w-[90vw] max-h-[90vh]"
      >
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[90vh] object-contain rounded-sm"
        />
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main detail component
// ---------------------------------------------------------------------------
export function JewelryDetailClient({ product }: { product: IProduct }) {
  const { t } = useI18n();
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const specs = (product.specs || {}) as JewelrySpecs;

  const images = product.images.length > 0 ? product.images : [];

  return (
    <div className="min-h-screen pt-28 pb-20">
      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && images[selectedImage] && (
          <Lightbox
            src={images[selectedImage].url}
            alt={product.title}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Back link */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-8">
        <Link
          href="/jewelry"
          className="inline-flex items-center gap-2 text-sm text-mist hover:text-brand-white transition-colors"
        >
          <ChevronLeft size={16} />
          {t("Mücevherata Dön", "Back to Jewelry")}
        </Link>
      </div>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: Images */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="flex flex-col-reverse lg:flex-row gap-4">
              {/* Thumbnails */}
              <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible no-scrollbar">
                {images.length > 1
                  ? images.slice(0, 6).map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(i)}
                        className={cn(
                          "w-20 h-20 flex-shrink-0 border rounded-sm overflow-hidden transition-all duration-300",
                          selectedImage === i
                            ? "border-brand-white"
                            : "border-slate/50 hover:border-soft-white/30"
                        )}
                      >
                        <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                      </button>
                    ))
                  : [0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-20 h-20 flex-shrink-0 bg-charcoal border rounded-sm flex items-center justify-center",
                          i === 0 ? "border-brand-white" : "border-slate/50"
                        )}
                      >
                        <Gem size={20} className="text-mist/40" />
                      </div>
                    ))}
              </div>

              {/* Main image */}
              <div
                className="aspect-[3/4] bg-charcoal border border-slate/50 rounded-sm overflow-hidden cursor-zoom-in flex-1"
                onClick={() => images[selectedImage] && setLightboxOpen(true)}
              >
                {images[selectedImage] ? (
                  <img
                    src={images[selectedImage].url}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Gem size={64} className="text-mist/30" />
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right: Details */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.15 }}
            className="space-y-6"
          >
            {/* Brand & Model */}
            <div>
              <p className="text-xs uppercase tracking-wider text-mist mb-2">{product.brand}</p>
              <h1 className="font-serif text-3xl md:text-4xl mb-2">
                {product.model}{specs.type ? ` - ${specs.type}` : ""}
              </h1>
              <p className="text-sm text-mist">
                {specs.metal}
                {specs.gemstone ? ` · ${specs.gemstone}` : ""}
                {specs.carat ? ` · ${specs.carat} ct` : ""}
              </p>
            </div>

            {/* Price */}
            <div>
              {product.priceOnRequest ? (
                <Button variant="outline" size="lg">
                  {t("Fiyat Sorunuz", "Price on Request")}
                </Button>
              ) : product.price ? (
                <p className="font-serif text-3xl tracking-tight">{formatPrice(product.price, product.currency)}</p>
              ) : null}
            </div>

            {/* Availability & Condition */}
            <div className="flex items-center gap-3">
              <StatusBadge status={product.availability} type="availability" />
              <Badge>{tl(t, CONDITION_LABELS[product.condition]) || product.condition}</Badge>
              <WishlistButton productId={product._id} />
            </div>

            {/* WhatsApp CTA — desktop only */}
            <a
              href={`https://wa.me/908505621313?text=${encodeURIComponent(`Merhaba, bu ürünle ilgileniyorum: ${product.brand} ${product.model}${specs.type ? ` - ${specs.type}` : ""} — ${typeof window !== "undefined" ? window.location.href : ""}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center justify-center gap-2 w-full py-3 rounded-sm text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: "#25D366" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1EBE5A")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#25D366")}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              {t("WhatsApp ile Bilgi Al", "Get Info via WhatsApp")}
            </a>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-soft-white leading-relaxed">{product.description}</p>
            )}

            {/* Specs table */}
            <div className="border-t border-slate/40 pt-2">
              <SpecRow label={t("Tip", "Type")} value={specs.type} />
              <SpecRow label={t("Metal", "Metal")} value={specs.metal} />
              <SpecRow label={t("Taş", "Gemstone")} value={specs.gemstone} />
              <SpecRow label={t("Karat", "Carat")} value={specs.carat ? `${specs.carat} ct` : undefined} />
              <SpecRow label={t("Beden", "Size")} value={specs.size} />
              <SpecRow label={t("Ağırlık", "Weight")} value={specs.weight} />
              <SpecRow label={t("Sertifika", "Certification")} value={specs.certification} />
              <SpecRow label={t("Durum", "Condition")} value={tl(t, CONDITION_LABELS[product.condition]) || product.condition} />
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-3 py-4 border-l-2 border-brand-gold rounded-sm px-4 bg-charcoal/50">
              <Shield size={20} className="text-brand-gold flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">{t("Orijinallik Garantisi", "Authenticity Guaranteed")}</p>
                <p className="text-xs text-mist">
                  {t(
                    "Her parça titiz orijinallik kontrolümüzden geçirilir",
                    "Every piece undergoes our rigorous authentication process"
                  )}
                </p>
              </div>
            </div>

            {/* CTA buttons */}
            {product.availability === "SOLD" || product.availability === "RESERVED" ? (
              <InterestForm productId={product._id} productTitle={product.title} />
            ) : (
              <div className="space-y-3 pt-2">
                <Link href="/concierge" className="block">
                  <Button variant="primary" size="lg" className="w-full">
                    <CalendarDays size={16} className="mr-2" />
                    {t("Randevu Al", "Book Appointment")}
                  </Button>
                </Link>
                <Link href="/concierge" className="block">
                  <Button variant="outline" size="lg" className="w-full">
                    <Video size={16} className="mr-2" />
                    {t("Görüntülü Görüşme", "Request Video Call")}
                  </Button>
                </Link>
                <a
                  href={BRAND_WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" size="lg" className="w-full">
                    <Phone size={16} className="mr-2" />
                    WhatsApp
                  </Button>
                </a>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Similar Pieces */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mt-24">
        <SectionHeading title={t("Benzer Ürünler", "Similar Pieces")} subtitle={t("Bunları da beğenebilirsiniz", "You may also like")} />
        <div className="text-center py-12">
          <p className="text-mist text-sm">{t("Koleksiyonumuzdan daha fazla ürün yakında.", "More pieces from our collection coming soon.")}</p>
          <Link href="/jewelry" className="inline-block mt-4">
            <Button variant="outline" size="sm">
              {t("Tüm Mücevherleri Gör", "Browse All Jewelry")}
            </Button>
          </Link>
        </div>
      </section>

      {/* Mobile sticky WhatsApp bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-brand-black/90 backdrop-blur-sm border-t border-slate/30">
        <a
          href={`https://wa.me/908505621313?text=${encodeURIComponent(`Merhaba, bu ürünle ilgileniyorum: ${product.brand} ${product.model}${specs.type ? ` - ${specs.type}` : ""} — ${typeof window !== "undefined" ? window.location.href : ""}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-sm text-sm font-medium text-white"
          style={{ backgroundColor: "#25D366" }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          {t("WhatsApp ile Bilgi Al", "Get Info via WhatsApp")}
        </a>
      </div>
    </div>
  );
}
