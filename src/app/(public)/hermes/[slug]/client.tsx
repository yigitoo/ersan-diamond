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
  ShoppingBag,
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
import { CONDITION_LABELS, BRAND_WHATSAPP } from "@/lib/utils/constants";
import { fadeUp, staggerContainer, staggerItem } from "@/lib/animations";
import type { IProduct, HermesSpecs } from "@/types";

// ---------------------------------------------------------------------------
// Spec row
// ---------------------------------------------------------------------------
function SpecRow({ label, value }: { label: string; value?: string | React.ReactNode }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate/40">
      <span className="text-xs uppercase tracking-wider text-mist">{label}</span>
      <span className="text-sm text-brand-white">{value}</span>
    </div>
  );
}

function BooleanValue({ value }: { value: boolean }) {
  const { t } = useI18n();
  return value ? (
    <span className="inline-flex items-center gap-1 text-green-400">
      <Check size={14} /> {t("Evet", "Yes")}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-mist">
      <X size={14} /> {t("Hayır", "No")}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main detail component
// ---------------------------------------------------------------------------
export function HermesDetailClient({ product }: { product: IProduct }) {
  const { t } = useI18n();
  const [selectedImage, setSelectedImage] = useState(0);
  const specs = (product.specs || {}) as HermesSpecs;

  const images = product.images.length > 0 ? product.images : [];

  return (
    <div className="min-h-screen pt-28 pb-20">
      {/* Back link */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-8">
        <Link
          href="/hermes"
          className="inline-flex items-center gap-2 text-sm text-mist hover:text-brand-white transition-colors"
        >
          <ChevronLeft size={16} />
          {t("Hermès'e Dön", "Back to Hermès")}
        </Link>
      </div>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: Images */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            {/* Main image */}
            <div className="aspect-square bg-charcoal border border-slate/50 rounded-sm overflow-hidden mb-4">
              {images[selectedImage] ? (
                <img
                  src={images[selectedImage].url}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag size={64} className="text-mist/30" />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
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
                      <ShoppingBag size={20} className="text-mist/40" />
                    </div>
                  ))}
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
                {product.model}{specs.size ? ` ${specs.size}` : ""}
              </h1>
              <p className="text-sm text-mist">
                {specs.material}
                {specs.color ? ` · ${specs.color}` : ""}
                {specs.hardware ? ` · ${specs.hardware} Hardware` : ""}
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

            {/* Availability & Condition */}
            <div className="flex items-center gap-3">
              <StatusBadge status={product.availability} type="availability" />
              <Badge>{CONDITION_LABELS[product.condition] || product.condition}</Badge>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-soft-white leading-relaxed">{product.description}</p>
            )}

            {/* Specs table */}
            <div className="border-t border-slate/40 pt-2">
              <SpecRow label={t("Model", "Model")} value={product.model} />
              <SpecRow label={t("Boyut", "Size")} value={specs.size ? `${specs.size} cm` : undefined} />
              <SpecRow label={t("Malzeme", "Material")} value={specs.material} />
              <SpecRow label={t("Renk", "Color")} value={specs.color} />
              <SpecRow label={t("Aksesuar Metali", "Hardware")} value={specs.hardware} />
              <SpecRow label={t("Damga", "Stamp")} value={specs.stamp} />
              <SpecRow label={t("Aksesuarlar", "Accessories")} value={specs.accessories} />
              <SpecRow
                label={t("Toz Torbası", "Dustbag")}
                value={
                  specs.dustbag !== undefined ? (
                    <BooleanValue value={specs.dustbag} />
                  ) : undefined
                }
              />
              <SpecRow
                label={t("Kutu", "Box")}
                value={
                  specs.box !== undefined ? (
                    <BooleanValue value={specs.box} />
                  ) : undefined
                }
              />
              <SpecRow label={t("Durum", "Condition")} value={CONDITION_LABELS[product.condition] || product.condition} />
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-3 py-4 border border-slate/30 rounded-sm px-4 bg-charcoal/50">
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
          </motion.div>
        </div>
      </div>

      {/* Similar Pieces */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mt-24">
        <SectionHeading title={t("Benzer Ürünler", "Similar Pieces")} subtitle={t("Bunları da beğenebilirsiniz", "You may also like")} />
        <div className="text-center py-12">
          <p className="text-mist text-sm">{t("Koleksiyonumuzdan daha fazla ürün yakında.", "More pieces from our collection coming soon.")}</p>
          <Link href="/hermes" className="inline-block mt-4">
            <Button variant="outline" size="sm">
              {t("Tüm Hermès Ürünlerini Gör", "Browse All Hermès")}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
