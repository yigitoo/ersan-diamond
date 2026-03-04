"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ChevronRight,
  ArrowRight,
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
    "/api/products?limit=6&sort=createdAt&published=true"
  );
  const { data: sliderProducts } = useSwrFetch<IProduct[]>(
    "/api/products?limit=12&sort=createdAt&published=true"
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
      image: "/imgs/cat-watches.jpg",
      featured: true,
    },
    {
      title: t("Hermès", "Hermès"),
      description: t(
        "Orijinalliği onaylanmış ikonik deri ürünler",
        "Iconic leather goods, authenticated and pristine"
      ),
      href: "/hermes",
      image: "/imgs/cat-hermes.jpg",
    },
    {
      title: t("Mücevherat", "Jewelry"),
      description: t(
        "Özenle seçilmiş değerli taş ve mücevherat koleksiyonu",
        "A curated collection of fine gemstones and jewelry"
      ),
      href: "/jewelry",
      image: "/imgs/cat-jewelry.jpg",
    },
  ];

  const TRUST_ITEMS = [
    {
      num: "01",
      title: t("Orijinallik Kontrolü", "Authentication"),
      description: t(
        "Sertifikalı uzmanlar tarafından çoklu doğrulama",
        "Multi-point verification by certified experts"
      ),
    },
    {
      num: "02",
      title: t("Köken", "Provenance"),
      description: t(
        "Tam geçmiş ve belgelendirme doğrulanmış",
        "Complete history and documentation verified"
      ),
    },
    {
      num: "03",
      title: t("İnceleme", "Inspection"),
      description: t(
        "Mekanizma ve kasa büyüteç altında incelenir",
        "Movement and case examination under magnification"
      ),
    },
    {
      num: "04",
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
          className="object-cover -z-20"
          sizes="100vw"
        />

        {/* Dark overlay for text contrast */}
        <div className="absolute inset-0 -z-10 bg-black/60" />

        {/* Vignette edges */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.5) 100%)",
          }}
        />

        <motion.div
          variants={heroReveal}
          initial="hidden"
          animate="visible"
          className="text-center px-6 max-w-3xl"
        >
          {/* Heritage eyebrow */}
          <p className="eyebrow text-white/70 mb-6">
            {t("İstanbul · Lüks Saatler ve Hermès", "Istanbul · Luxury Watches & Hermès")}
          </p>

          {/* Main heading */}
          <h1 className="font-serif text-6xl md:text-8xl font-normal leading-[1.05] tracking-tight text-white">
            {t("Nadirlik ve Orijinalliğin", "Where Rarity Meets")}
            <br />
            {t("Buluştuğu Yer", "Authenticity")}
          </h1>

          {/* Gold divider */}
          <div className="section-divider section-divider--center my-8" />

          {/* Subtitle */}
          <p className="font-light text-white/90 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            {t(
              "Türkiye'nin en güvenilir adresi",
              "Türkiye's premier destination for authenticated luxury timepieces and Hermès"
            )}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link href="/concierge">
              <Button variant="gold" className="rounded-sm" size="lg">
                {t("Randevu Al", "Book Appointment")}
              </Button>
            </Link>
            <Link href="/watches">
              <Button
                variant="outline"
                size="lg"
                className="rounded-sm border-white/40 text-white hover:border-white hover:bg-white/10 transition-all duration-500"
              >
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

      {/* ═══════════════════ CATEGORY TILES — Asymmetric ═══════════════════ */}
      <section className="pt-28 pb-20 px-6">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow={t("Koleksiyon", "The Collection")}
            title={t("Koleksiyon", "The Collection")}
            accent
          />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid lg:grid-cols-[2fr_1fr] gap-6"
          >
            {/* Featured: Watches (large left card with bg image) */}
            <motion.div variants={staggerItem}>
              <Link href={CATEGORIES[0].href} className="group block h-full">
                <div
                  className={cn(
                    "relative rounded overflow-hidden h-full min-h-[340px] md:min-h-[420px]",
                    "transition-all duration-700"
                  )}
                >
                  {/* Background image */}
                  <img
                    src={CATEGORIES[0].image}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-10">
                    <p className="eyebrow text-white/60 mb-3">{t("Koleksiyon", "Collection")}</p>
                    <h3 className="font-serif text-3xl md:text-5xl text-white mb-3">
                      {CATEGORIES[0].title}
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed mb-6 max-w-md">
                      {CATEGORIES[0].description}
                    </p>
                    <ArrowRight
                      size={18}
                      strokeWidth={1.5}
                      className="text-white/50 group-hover:text-brand-gold group-hover:translate-x-1 transition-all duration-500"
                    />
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Right column: Hermès + Jewelry stacked with bg images */}
            <div className="flex flex-col gap-6">
              {CATEGORIES.slice(1).map((cat) => (
                <motion.div key={cat.title} variants={staggerItem} className="flex-1">
                  <Link href={cat.href} className="group block h-full">
                    <div
                      className={cn(
                        "relative rounded overflow-hidden h-full min-h-[200px]",
                        "transition-all duration-700"
                      )}
                    >
                      {/* Background image */}
                      <img
                        src={cat.image}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* Dark gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/25" />
                      {/* Content */}
                      <div className="relative z-10 h-full flex flex-col justify-end p-7">
                        <h3 className="font-serif text-2xl md:text-3xl text-white mb-2">
                          {cat.title}
                        </h3>
                        <p className="text-white/60 text-sm leading-relaxed mb-4">
                          {cat.description}
                        </p>
                        <ArrowRight
                          size={18}
                          strokeWidth={1.5}
                          className="text-white/50 group-hover:text-brand-gold group-hover:translate-x-1 transition-all duration-500"
                        />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ HERITAGE STATEMENT ═══════════════════ */}
      <section className="surface-warm border-y border-slate/40 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-16 items-start"
          >
            {/* Left */}
            <div>
              <p className="eyebrow--gold mb-4">{t("Felsefemiz", "Our Philosophy")}</p>
              <div className="section-divider mb-5" />
              <h2 className="luxury-heading text-3xl md:text-4xl">
                {t("Sadece Orijinal", "Only Original")}
              </h2>
            </div>
            {/* Right */}
            <div>
              <p className="luxury-quote">
                {t(
                  "Sunduğumuz her parça, uzman ekibimizin titiz 5 adımlı orijinallik kontrolünden geçer. Kalite ve güvenden asla ödün vermeyiz — çünkü gerçek lüks, sahiciliğin ta kendisidir.",
                  "Every piece we offer undergoes our team's rigorous 5-step authentication process. We never compromise on quality or trust — because true luxury is authenticity itself."
                )}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ MARQUEE SLIDER ═══════════════════ */}
      {sliderProducts && sliderProducts.length > 0 && (
        <section className="py-16 overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 mb-10">
            <p className="eyebrow--gold text-center">
              {t("Vitrin", "Showcase")}
            </p>
          </div>
          {/* Marquee container with fade edges */}
          <div className="relative">
            {/* Left fade */}
            <div className="absolute left-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-r from-brand-black to-transparent z-10 pointer-events-none" />
            {/* Right fade */}
            <div className="absolute right-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-l from-brand-black to-transparent z-10 pointer-events-none" />
            {/* Scrolling track — items duplicated for seamless loop */}
            <div className="marquee-track">
              {[...sliderProducts, ...sliderProducts].map((product, i) => (
                <Link
                  key={`${product._id}-${i}`}
                  href={`${categoryPath(product.category)}/${product.slug}`}
                  className="group flex-shrink-0 w-[220px] md:w-[260px] mx-3"
                >
                  <div className="relative aspect-[3/4] bg-charcoal border border-slate/50 rounded-sm overflow-hidden transition-all duration-500 hover:border-soft-white/30">
                    {product.images[0]?.url ? (
                      <img
                        src={product.images[0].url}
                        alt={`${product.brand} ${product.model}`}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Watch size={28} strokeWidth={1} className="text-mist/20" />
                      </div>
                    )}
                    {/* Bottom shadow */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
                    {/* Gold accent line */}
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  </div>
                  <div className="mt-3 space-y-0.5">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-mist">
                      {product.brand}
                    </p>
                    <p className="font-serif text-sm leading-tight line-clamp-1">
                      {product.model}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════ TRUST BLOCK — Numbered ═══════════════════ */}
      <section className="py-28 bg-charcoal">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            eyebrow={t("Sürecimiz", "Our Process")}
            title={t("Güvenin 4 Adımı", "4 Steps of Trust")}
            accent
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
                <span className="font-serif text-5xl text-brand-gold/20 block mb-4">
                  {item.num}
                </span>
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
      <section className="pt-24 pb-32 px-6">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow={t("Yeni Gelenler", "New Arrivals")}
            title={t("Son Gelenler", "Latest Arrivals")}
            accent
          />

          {latestProducts && latestProducts.length > 0 ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 xl:gap-8"
            >
              {latestProducts.slice(0, 6).map((product) => (
                <motion.div key={product._id} variants={staggerItem}>
                  <Link
                    href={`${categoryPath(product.category)}/${product.slug}`}
                    className="group block"
                  >
                    <div
                      className={cn(
                        "bg-charcoal border border-slate/50 rounded overflow-hidden relative",
                        "transition-all duration-700",
                        "hover:border-soft-white/30"
                      )}
                    >
                      {/* Product image */}
                      <div className="aspect-[3/4] bg-slate/20 relative overflow-hidden">
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
                        {/* Permanent bottom shadow for readability */}
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
                      </div>
                      {/* Info */}
                      <div className="p-4 md:p-5">
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
                      {/* Gold accent line on hover */}
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
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
              className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-charcoal border border-slate/50 rounded overflow-hidden"
                >
                  <div className="aspect-[3/4] skeleton-shimmer" />
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

      {/* ═══════════════════ CONCIERGE CTA — Framed ═══════════════════ */}
      <section className="surface-paper py-20 px-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-3xl mx-auto text-center border border-brand-gold/15 rounded-sm py-16 px-8"
        >
          <p className="eyebrow--gold mb-4">{t("Özel Hizmet", "Private Service")}</p>
          <div className="section-divider section-divider--center mb-6" />
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
            <Button variant="gold" size="lg" className="rounded-sm">
              {t("Hemen Randevu Al", "Book Now")}
            </Button>
          </Link>
        </motion.div>
      </section>
    </>
  );
}
