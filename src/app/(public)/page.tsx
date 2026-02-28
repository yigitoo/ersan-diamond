"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ChevronRight,
  ArrowRight,
  Shield,
  Award,
  Eye,
  Star,
  Watch,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";
import { useI18n } from "@/lib/i18n";
import { useSwrFetch } from "@/lib/hooks";
import { formatPrice } from "@/lib/utils/formatters";
import {
  heroReveal,
  fadeUp,
  staggerContainer,
  staggerItem,
} from "@/lib/animations";
import type { IProduct, ProductCategory } from "@/types";

/* ─── Page ─── */
export default function HomePage() {
  const { t } = useI18n();

  /* ─── Dynamic data ─── */
  const { data: latestProducts } = useSwrFetch<IProduct[]>(
    "/api/products?limit=8&sort=createdAt&published=true"
  );

  /* ─── Helpers ─── */
  const categoryPath = (category: ProductCategory): string => {
    switch (category) {
      case "WATCH":
        return "/watches";
      case "HERMES":
        return "/hermes";
      case "JEWELRY":
        return "/jewelry";
    }
  };

  /* ─── Data ─── */
  const CATEGORIES = [
    {
      title: t("Saatler", "Watches"),
      description: t(
        "Dünyanın en prestijli markalarından seçilmiş saatler",
        "Curated timepieces from the world's finest maisons"
      ),
      href: "/watches",
    },
    {
      title: t("Hermès", "Hermès"),
      description: t(
        "Orijinalliği onaylanmış ikonik deri ürünler",
        "Iconic leather goods, authenticated and pristine"
      ),
      href: "/hermes",
    },
    {
      title: t("Mücevherat", "Jewelry"),
      description: t(
        "Özenle seçilmiş değerli taş ve mücevherat koleksiyonu",
        "A curated collection of fine gemstones and jewelry"
      ),
      href: "/jewelry",
    },
    {
      title: t("Bize Satın", "Sell to Us"),
      description: t(
        "Lüks parçalarınızı güvenle bize satın veya konsinye bırakın",
        "Consign or sell your luxury pieces with confidence"
      ),
      href: "/sell",
    },
  ];

  const TRUST_ITEMS = [
    {
      icon: Shield,
      title: t("Orijinallik Kontrolü", "Authentication"),
      description: t(
        "Sertifikalı uzmanlar tarafından çoklu doğrulama",
        "Multi-point verification by certified experts"
      ),
    },
    {
      icon: Award,
      title: t("Köken", "Provenance"),
      description: t(
        "Tam geçmiş ve belgelendirme doğrulanmış",
        "Complete history and documentation verified"
      ),
    },
    {
      icon: Eye,
      title: t("İnceleme", "Inspection"),
      description: t(
        "Mekanizma ve kasa büyüteç altında incelenir",
        "Movement and case examination under magnification"
      ),
    },
    {
      icon: Star,
      title: t("Garanti", "Guarantee"),
      description: t(
        "Her satın alımda tam orijinallik garantisi",
        "Full authenticity guarantee with every purchase"
      ),
    },
  ];

  return (
    <>
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <Image
          src="/imgs/hero-bg.jpg"
          alt=""
          fill
          priority
          className="object-cover -z-20 opacity-80"
          sizes="100vw"
        />


        {/* Subtle gold light bleed */}
        <div
          className="absolute inset-0 -z-10 opacity-[0.04]"
          style={{
            background:
              "radial-gradient(circle at 50% 40%, #C9A84C 0%, transparent 50%)",
          }}
        />

        <motion.div
          variants={heroReveal}
          initial="hidden"
          animate="visible"
          className="text-center px-6 max-w-3xl"
        >
          {/* Pre-heading */}
          <p className="text-xs tracking-[0.3em] uppercase text-white font-bold mb-6">
            ERSAN DIAMOND
          </p>

          {/* Main heading */}
          <h1 className="font-serif text-5xl md:text-7xl font-normal leading-[1.08] tracking-tight text-white">
            {t("Nadirlik ve Orijinalliğin", "Where Rarity Meets")}
            <br />
            {t("Buluştuğu Yer", "Authenticity")}
          </h1>

          {/* Subtitle */}
          <p className="md:mt-10 text-white font-bold text-base md:text-lg max-w-xl mx-auto mt-6 leading-relaxed">
            {t(
              "İstanbul'un en güvenilir adresi",
              "Istanbul's premier destination for authenticated luxury timepieces and Hermès"
            )}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link href="/concierge">
              <Button variant="primary" size="lg">
                {t("Randevu Al", "Book Appointment")}
              </Button>
            </Link>
            <Link href="/watches">
              <Button variant="outline" size="lg" className="text-brand-gold hover:border-brand-gold hover:bg-brand-gold hover:text-white">
                {t("Koleksiyonu Keşfet", "Explore Collection")}
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-mist/60">
            {t("Kaydır", "Scroll")}
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronRight size={16} className="rotate-90 text-mist/40" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════ CATEGORY TILES ═══════════════════ */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <SectionHeading title={t("Koleksiyon", "The Collection")} />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-6"
          >
            {CATEGORIES.slice(0,-1).map((cat) => (
              <motion.div key={cat.title} variants={staggerItem}>
                <Link href={cat.href} className="group block">
                  <div
                    className={cn(
                      "bg-charcoal border border-slate/50 rounded p-8 h-full",
                      "transition-all duration-700",
                      "hover:border-soft-white/30 hover:bg-charcoal/80"
                    )}
                  >
                    <h3 className="font-serif text-2xl md:text-3xl mb-3">
                      {cat.title}
                    </h3>
                    <p className="text-mist text-sm leading-relaxed mb-8">
                      {cat.description}
                    </p>
                    <ArrowRight
                      size={18}
                      strokeWidth={1.5}
                      className="text-mist group-hover:text-brand-gold group-hover:translate-x-1 transition-all duration-500"
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ TRUST BLOCK ═══════════════════ */}
      <section className="py-24 bg-charcoal">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            title={t("Sadece Orijinal", "Only Original")}
            subtitle={t(
              "Her parça titiz 5 adımlı sürecimizle orijinallik kontrolünden geçirilir",
              "Every piece authenticated through our rigorous 5-step process"
            )}
          />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12"
          >
            {TRUST_ITEMS.map((item) => (
              <motion.div
                key={item.title}
                variants={staggerItem}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-brand-gold/20 mb-5">
                  <item.icon
                    size={20}
                    strokeWidth={1.5}
                    className="text-brand-gold"
                  />
                </div>
                <h3 className="font-serif text-lg mb-2">{item.title}</h3>
                <p className="text-mist text-sm leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ LATEST DROPS ═══════════════════ */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <SectionHeading title={t("Son Gelenler", "Latest Arrivals")} />

          {latestProducts && latestProducts.length > 0 ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
            >
              {latestProducts.map((product) => (
                <motion.div key={product._id} variants={staggerItem}>
                  <Link
                    href={`${categoryPath(product.category)}/${product.slug}`}
                    className="group block"
                  >
                    <div
                      className={cn(
                        "bg-charcoal border border-slate/50 rounded overflow-hidden",
                        "transition-all duration-700",
                        "hover:border-soft-white/30"
                      )}
                    >
                      {/* Product image */}
                      <div className="aspect-square bg-slate/20 relative overflow-hidden">
                        {product.images[0]?.url ? (
                          <img
                            src={product.images[0].url}
                            alt={product.images[0].alt || `${product.brand} ${product.model}`}
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Watch size={32} strokeWidth={1} className="text-mist/20" />
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="p-4">
                        <p className="text-[11px] uppercase tracking-[0.15em] text-mist mb-1">
                          {product.brand}
                        </p>
                        <p className="font-serif text-base md:text-lg leading-tight mb-2 line-clamp-1">
                          {product.model}
                        </p>
                        <p className="text-xs text-mist">
                          {product.priceOnRequest
                            ? t("Fiyat Sorunuz", "Price on Request")
                            : product.price
                              ? formatPrice(product.price, product.currency)
                              : t("Fiyat Sorunuz", "Price on Request")}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* Empty / loading state */
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "bg-charcoal border border-slate/50 rounded overflow-hidden",
                    "animate-pulse"
                  )}
                >
                  <div className="aspect-square bg-slate/20" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-slate/20 rounded w-1/3" />
                    <div className="h-4 bg-slate/20 rounded w-2/3" />
                    <div className="h-3 bg-slate/20 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* View all link */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Link
              href="/watches"
              className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-mist hover:text-brand-white transition-colors duration-500"
            >
              {t("Tümünü Gör", "View All")}
              <ArrowRight size={14} strokeWidth={1.5} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ CONCIERGE CTA ═══════════════════ */}
      <section className="py-24 px-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center"
        >
          <h2 className="font-serif text-4xl md:text-5xl mb-4">
            {t("Özel Konsiyerj", "Private Concierge")}
          </h2>
          <p className="text-mist text-base mb-10 max-w-md mx-auto">
            {t(
              "30 saniyede kişisel randevunuzu oluşturun",
              "Book your personal appointment in 30 seconds"
            )}
          </p>
          <Link href="/concierge">
            <Button variant="gold" size="lg">
              {t("Hemen Randevu Al", "Book Now")}
            </Button>
          </Link>
        </motion.div>
      </section>
    </>
  );
}
