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
  Watch,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { SectionHeading } from "@/components/shared/section-heading";
import { useI18n } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils/formatters";
import { CONDITION_LABELS, WATCH_BRANDS, BRAND_WHATSAPP, tl } from "@/lib/utils/constants";
import { WishlistButton } from "@/components/shared/wishlist-button";
import { InterestForm } from "@/components/shared/interest-form";
import { fadeUp, staggerContainer, staggerItem } from "@/lib/animations";
import type { IProduct, WatchSpecs } from "@/types";

// ---------------------------------------------------------------------------
// Spec row component
// ---------------------------------------------------------------------------
function SpecRow({ label, value }: { label: string; value?: string | boolean }) {
  const { t } = useI18n();
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="spec-table-row">
      <span className="text-xs uppercase tracking-wider text-mist">{label}</span>
      <span className="text-sm text-brand-white">
        {typeof value === "boolean" ? (value ? t("Evet", "Yes") : t("Hayır", "No")) : value}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Thumbnail
// ---------------------------------------------------------------------------
function Thumbnail({
  url,
  alt,
  active,
  onClick,
}: {
  url?: string;
  alt: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-20 h-20 flex-shrink-0 bg-charcoal border rounded-sm overflow-hidden transition-all duration-300",
        active ? "border-brand-white" : "border-slate/50 hover:border-soft-white/30"
      )}
    >
      {url ? (
        <img src={url} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Watch size={20} className="text-mist/40" />
        </div>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Lightbox
// ---------------------------------------------------------------------------
function Lightbox({ url, alt, onClose }: { url: string; alt: string; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="lightbox-backdrop flex items-center justify-center p-4"
        onClick={onClose}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
        >
          <X size={28} />
        </button>
        <motion.img
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          src={url}
          alt={alt}
          className="max-w-full max-h-[90vh] object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </motion.div>
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Similar piece card
// ---------------------------------------------------------------------------
function SimilarCard({ product }: { product: IProduct }) {
  const { t } = useI18n();
  return (
    <motion.div variants={staggerItem}>
      <Link href={`/watches/${product.slug}`} className="group block">
        <div className="relative aspect-[3/4] bg-charcoal border border-slate/50 rounded-sm overflow-hidden transition-all duration-500 group-hover:border-soft-white/30">
          {product.images[0] ? (
            <img
              src={product.images[0].url}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Watch size={40} className="text-mist/30" />
            </div>
          )}
        </div>
        <div className="mt-3 space-y-1">
          <p className="text-xs text-mist tracking-wider uppercase">{product.brand}</p>
          <h4 className="font-serif text-base group-hover:text-brand-gold transition-colors">
            {product.model}
          </h4>
          <p className="text-sm text-soft-white">
            {product.priceOnRequest
              ? t("Fiyat Sorunuz", "Price on Request")
              : product.price
                ? formatPrice(product.price, product.currency)
                : ""}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main detail component
// ---------------------------------------------------------------------------
export function WatchDetailClient({ product }: { product: IProduct }) {
  const { t } = useI18n();
  const specs = (product.specs || {}) as WatchSpecs;
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const images = product.images.length > 0 ? product.images : [null, null, null, null];
  const activeUrl = product.images[activeImage]?.url;

  const boxPapersLabel: Record<string, string> = {
    FULL_SET: t("Tam Set (Kutu & Belgeler)", "Full Set (Box & Papers)"),
    BOX_ONLY: t("Sadece Kutu", "Box Only"),
    PAPERS_ONLY: t("Sadece Belgeler", "Papers Only"),
    NONE: t("Yok", "None"),
  };

  return (
    <div className="min-h-screen pt-28 pb-20">
      {/* Lightbox */}
      {lightboxOpen && activeUrl && (
        <Lightbox url={activeUrl} alt={product.title} onClose={() => setLightboxOpen(false)} />
      )}

      {/* Back link */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-8">
        <Link
          href="/watches"
          className="inline-flex items-center gap-2 text-sm text-mist hover:text-brand-white transition-colors"
        >
          <ChevronLeft size={16} />
          {t("Saatlere Dön", "Back to Watches")}
        </Link>
      </div>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left column: Images */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="flex flex-col-reverse lg:flex-row gap-4">
              {/* Thumbnails — vertical on desktop */}
              <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible no-scrollbar">
                {images.slice(0, 4).map((img, i) => (
                  <Thumbnail
                    key={i}
                    url={img?.url}
                    alt={`${product.title} ${i + 1}`}
                    active={activeImage === i}
                    onClick={() => setActiveImage(i)}
                  />
                ))}
              </div>

              {/* Main image */}
              <div
                className="flex-1 aspect-[3/4] bg-charcoal border border-slate/50 rounded-sm overflow-hidden cursor-zoom"
                onClick={() => activeUrl && setLightboxOpen(true)}
              >
                {activeUrl ? (
                  <img
                    src={activeUrl}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Watch size={64} className="text-mist/30" />
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right column: Details */}
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
              <h1 className="font-serif text-3xl md:text-4xl mb-2">{product.model}</h1>
              <p className="text-sm text-mist">
                Ref. {product.reference}
                {product.year ? ` · ${product.year}` : ""}
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

            {/* Availability */}
            <div className="flex items-center gap-3">
              <StatusBadge status={product.availability} type="availability" />
              <Badge>{tl(t, CONDITION_LABELS[product.condition]) || product.condition}</Badge>
              <WishlistButton productId={product._id} />
            </div>

            {/* WhatsApp CTA — desktop only */}
            <a
              href={`https://wa.me/908505621313?text=${encodeURIComponent(`Merhaba, bu ürünle ilgileniyorum: ${product.brand} ${product.model}${product.reference ? ` (Ref. ${product.reference})` : ""} — ${typeof window !== "undefined" ? window.location.href : ""}`)}`}
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
            <div className="spec-table border-t border-slate/40 pt-2">
              <SpecRow label={t("Kasa Boyutu", "Case Size")} value={specs.caseSize} />
              <SpecRow label={t("Kasa Malzemesi", "Case Material")} value={specs.caseMaterial} />
              <SpecRow label={t("Kadran", "Dial")} value={specs.dialColor} />
              <SpecRow label={t("Kordon", "Bracelet")} value={specs.bracelet} />
              <SpecRow label={t("Mekanizma", "Movement")} value={specs.movement} />
              <SpecRow label={t("Kalibre", "Caliber")} value={specs.caliber} />
              <SpecRow label={t("Su Geçirmezlik", "Water Resistance")} value={specs.waterResistance} />
              <SpecRow
                label={t("Kutu & Belgeler", "Box & Papers")}
                value={specs.boxPapers ? boxPapersLabel[specs.boxPapers] : undefined}
              />
              <SpecRow label={t("Seri No", "Serial")} value={specs.serial} />
            </div>

            {/* Trust badge — gold left border */}
            <div className="flex items-center gap-3 py-4 border-l-2 border-brand-gold rounded-sm px-4 bg-charcoal/50">
              <Shield size={20} className="text-brand-gold flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">{t("Orijinallik Garantisi", "Authenticity Guaranteed")}</p>
                <p className="text-xs text-mist">
                  {t(
                    "Her parça 5 adımlı orijinallik kontrolümüzden geçirilir",
                    "Every piece undergoes our 5-step authentication process"
                  )}
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
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
          <Link href="/watches" className="inline-block mt-4">
            <Button variant="outline" size="sm">
              {t("Tüm Saatlere Göz At", "Browse All Watches")}
            </Button>
          </Link>
        </div>
      </section>

      {/* Mobile sticky WhatsApp bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-brand-black/90 backdrop-blur-sm border-t border-slate/30">
        <a
          href={`https://wa.me/908505621313?text=${encodeURIComponent(`Merhaba, bu ürünle ilgileniyorum: ${product.brand} ${product.model}${product.reference ? ` (Ref. ${product.reference})` : ""} — ${typeof window !== "undefined" ? window.location.href : ""}`)}`}
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
