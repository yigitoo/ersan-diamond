"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronRight,
  ArrowRight,
  Shield,
  Award,
  Eye,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  heroReveal,
  fadeUp,
  staggerContainer,
  staggerItem,
} from "@/lib/animations";

/* ─── Data ─── */
const CATEGORIES = [
  {
    title: "Watches",
    description: "Curated timepieces from the world's finest maisons",
    href: "/watches",
  },
  {
    title: "Hermes",
    description: "Iconic leather goods, authenticated and pristine",
    href: "/hermes",
  },
  {
    title: "Sell to Us",
    description: "Consign or sell your luxury pieces with confidence",
    href: "/sell",
  },
];

const TRUST_ITEMS = [
  {
    icon: Shield,
    title: "Authentication",
    description: "Multi-point verification by certified experts",
  },
  {
    icon: Award,
    title: "Provenance",
    description: "Complete history and documentation verified",
  },
  {
    icon: Eye,
    title: "Inspection",
    description: "Movement and case examination under magnification",
  },
  {
    icon: Star,
    title: "Guarantee",
    description: "Full authenticity guarantee with every purchase",
  },
];

const PLACEHOLDER_PRODUCTS = [
  { brand: "Rolex", model: "Daytona Cosmograph", price: "Price on Request" },
  {
    brand: "Patek Philippe",
    model: "Nautilus 5711/1A",
    price: "Price on Request",
  },
  {
    brand: "Audemars Piguet",
    model: "Royal Oak 15500ST",
    price: "Price on Request",
  },
  {
    brand: "Richard Mille",
    model: "RM 011 Felipe Massa",
    price: "Price on Request",
  },
  { brand: "Rolex", model: 'Submariner "Hulk"', price: "Price on Request" },
  {
    brand: "Patek Philippe",
    model: "Aquanaut 5167A",
    price: "Price on Request",
  },
  {
    brand: "Vacheron Constantin",
    model: "Overseas Dual Time",
    price: "Price on Request",
  },
  {
    brand: "A. Lange & Sohne",
    model: "Lange 1",
    price: "Price on Request",
  },
];

/* ─── Page ─── */
export default function HomePage() {
  return (
    <>
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 40%, #1A1A1A 0%, #0A0A0A 70%, #000 100%)",
          }}
        />

        {/* Subtle gold light bleed */}
        <div
          className="absolute inset-0 -z-10 opacity-[0.03]"
          style={{
            background:
              "radial-gradient(circle at 50% 30%, #C9A84C 0%, transparent 60%)",
          }}
        />

        <motion.div
          variants={heroReveal}
          initial="hidden"
          animate="visible"
          className="text-center px-6 max-w-3xl"
        >
          {/* Pre-heading */}
          <p className="text-xs tracking-[0.3em] uppercase text-mist mb-6">
            ERSAN DIAMOND
          </p>

          {/* Main heading */}
          <h1 className="font-serif text-5xl md:text-7xl font-normal leading-[1.08] tracking-tight">
            Where Rarity Meets
            <br />
            Authenticity
          </h1>

          {/* Subtitle */}
          <p className="text-mist text-base md:text-lg max-w-xl mx-auto mt-6 leading-relaxed">
            Istanbul&apos;s premier destination for authenticated luxury
            timepieces and Hermes
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link href="/concierge">
              <Button variant="primary" size="lg">
                Book Appointment
              </Button>
            </Link>
            <Link href="/watches">
              <Button variant="outline" size="lg">
                Explore Collection
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
            Scroll
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
          <SectionHeading title="The Collection" />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-6"
          >
            {CATEGORIES.map((cat) => (
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
            title="Only Original"
            subtitle="Every piece authenticated through our rigorous 5-step process"
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
          <SectionHeading title="Latest Arrivals" />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {PLACEHOLDER_PRODUCTS.map((product, i) => (
              <motion.div key={`${product.brand}-${i}`} variants={staggerItem}>
                <div
                  className={cn(
                    "bg-charcoal border border-slate/50 rounded overflow-hidden",
                    "transition-all duration-700",
                    "hover:border-soft-white/30"
                  )}
                >
                  {/* Placeholder image area */}
                  <div className="aspect-square bg-slate/20 flex items-center justify-center">
                    <span className="text-mist/30 text-xs uppercase tracking-[0.15em]">
                      Image
                    </span>
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <p className="text-[11px] uppercase tracking-[0.15em] text-mist mb-1">
                      {product.brand}
                    </p>
                    <p className="font-serif text-base md:text-lg leading-tight mb-2 line-clamp-1">
                      {product.model}
                    </p>
                    <p className="text-xs text-mist">{product.price}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

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
              View All Timepieces
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
            Private Concierge
          </h2>
          <p className="text-mist text-base mb-10 max-w-md mx-auto">
            Book your personal appointment in 30 seconds
          </p>
          <Link href="/concierge">
            <Button variant="gold" size="lg">
              Book Now
            </Button>
          </Link>
        </motion.div>
      </section>
    </>
  );
}
