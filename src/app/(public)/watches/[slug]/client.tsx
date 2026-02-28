"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  CalendarDays,
  Video,
  Phone,
  ChevronLeft,
  Watch,
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
    <div className="flex items-center justify-between py-3 border-b border-slate/40">
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
            {/* Main image */}
            <div className="aspect-square bg-charcoal border border-slate/50 rounded-sm overflow-hidden mb-4">
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

            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
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
                <p className="font-serif text-2xl">{formatPrice(product.price, product.currency)}</p>
              ) : null}
            </div>

            {/* Availability */}
            <div className="flex items-center gap-3">
              <StatusBadge status={product.availability} type="availability" />
              <Badge>{tl(t, CONDITION_LABELS[product.condition]) || product.condition}</Badge>
              <WishlistButton productId={product._id} />
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-soft-white leading-relaxed">{product.description}</p>
            )}

            {/* Specs table */}
            <div className="border-t border-slate/40 pt-2">
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

            {/* Trust badge */}
            <div className="flex items-center gap-3 py-4 border border-slate/30 rounded-sm px-4 bg-charcoal/50">
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
    </div>
  );
}
