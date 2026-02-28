"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Menu, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Logo } from "@/components/shared/logo";
import { Sheet } from "@/components/ui/sheet";
import { LanguageToggle } from "@/components/shared/language-toggle";
import { useI18n } from "@/lib/i18n";
import { navSlide } from "@/lib/animations";
import { WATCH_BRANDS, HERMES_MODELS, JEWELRY_TYPES, BRAND_WHATSAPP, BRAND_INSTAGRAM } from "@/lib/utils/constants";

/* ─── Component ─── */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const pathname = usePathname();
  const { t } = useI18n();

  /* Navigation data (uses t for labels) */
  const NAV_ITEMS = [
    { label: t("Saatler", "Watches"), href: "/watches", key: "Watches" },
    { label: t("Hermès", "Hermès"), href: "/hermes", key: "Hermes" },
    { label: t("Mücevherat", "Jewelry"), href: "/jewelry", key: "Jewelry" },
    { label: t("Bize Satın", "Sell to Us"), href: "/sell", key: "Sell" },
    { label: t("Konsiyerj", "Concierge"), href: "/concierge", key: "Concierge" },
    { label: t("Hakkımızda", "About"), href: "/about", key: "About" },
    { label: t("İletişim", "Contact"), href: "/contact", key: "Contact" },
  ];

  const MEGA_MENUS: Record<
    string,
    { title: string; links: { label: string; href: string }[] }
  > = {
    Watches: {
      title: t("Saatler", "Timepieces"),
      links: WATCH_BRANDS.slice(0, 8).map((b) => ({
        label: b,
        href: `/watches?brand=${encodeURIComponent(b)}`,
      })),
    },
    Hermes: {
      title: t("Hermès Koleksiyon", "Hermès Collection"),
      links: HERMES_MODELS.slice(0, 8).map((m) => ({
        label: m,
        href: `/hermes?model=${encodeURIComponent(m)}`,
      })),
    },
    Jewelry: {
      title: t("Mücevherat", "Jewelry"),
      links: JEWELRY_TYPES.map((j) => ({
        label: j,
        href: `/jewelry?type=${encodeURIComponent(j)}`,
      })),
    },
  };

  /* Scroll listener */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Close mobile menu on route change */
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const closeMega = useCallback(() => setActiveMenu(null), []);

  /* Mega menu key lookup */
  const getMegaKey = (navKey: string) => {
    if (navKey === "Watches" || navKey === "Hermes" || navKey === "Jewelry") return navKey;
    return null;
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-700",
          scrolled
            ? "bg-black border-b border-slate/40"
            : "bg-black"
        )}
      >
        <nav className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* ── Left: Logo ── */}
            <div className="flex-shrink-0">
              <Logo variant="horizontal" width={140} height={55} />
            </div>

            {/* ── Center: Desktop links ── */}
            <ul className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const megaKey = getMegaKey(item.key);
                const hasMega = megaKey !== null;
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");

                return (
                  <li
                    key={item.key}
                    className="relative"
                    onMouseEnter={() => hasMega && setActiveMenu(item.key)}
                    onMouseLeave={closeMega}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "px-4 py-2 text-[13px] tracking-[0.12em] uppercase transition-colors duration-500",
                        isActive
                          ? "text-white"
                          : "text-white/70 hover:text-white"
                      )}
                    >
                      {item.label}
                    </Link>

                    {/* Mega-menu dropdown */}
                    <AnimatePresence>
                      {hasMega && activeMenu === item.key && MEGA_MENUS[megaKey!] && (
                        <motion.div
                          variants={navSlide}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="absolute top-full left-1/2 -translate-x-1/2 pt-4"
                        >
                          <div className="w-[320px] bg-charcoal/95 glass border border-slate/60 rounded p-6">
                            <p className="text-xs uppercase tracking-[0.2em] text-mist mb-4">
                              {MEGA_MENUS[megaKey!].title}
                            </p>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                              {MEGA_MENUS[megaKey!].links.map((link) => (
                                <Link
                                  key={link.label}
                                  href={link.href}
                                  className="text-sm text-soft-white/70 hover:text-brand-white transition-colors duration-300 py-1"
                                >
                                  {link.label}
                                </Link>
                              ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate/40">
                              <Link
                                href={item.href}
                                className="text-xs uppercase tracking-[0.15em] text-brand-gold hover:text-brand-gold/80 transition-colors duration-300 flex items-center gap-1"
                              >
                                {t("Tümünü Gör", "View All")}
                                <ChevronRight size={12} />
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>

            {/* ── Right: Icons ── */}
            <div className="flex items-center gap-1">
              <LanguageToggle className="mr-2" />
              <Link
                href="/wishlist"
                className="p-2.5 text-white hover:text-brand-gold transition-colors duration-500"
                aria-label={t("Favoriler", "Wishlist")}
              >
                <Heart size={18} strokeWidth={1.5} />
              </Link>

              {/* Mobile hamburger */}
              <button
                className="lg:hidden p-2.5 text-white hover:text-brand-gold transition-colors duration-500 ml-1"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={20} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* ── Mobile drawer ── */}
      <Sheet
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        side="right"
      >
        <div className="flex flex-col h-full">
          {/* Language toggle in mobile */}
          <div className="mb-4" onClick={(e) => e.stopPropagation()}>
            <LanguageToggle className="text-base gap-2 py-2" />
          </div>

          {/* Menu items */}
          <nav className="flex-1 flex flex-col justify-center -mt-8">
            {NAV_ITEMS.map((item, i) => (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: i * 0.06,
                  duration: 0.4,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="group flex items-center justify-between py-4 border-b border-slate/30"
                >
                  <span className="font-serif text-2xl sm:text-3xl text-brand-white group-hover:text-brand-gold transition-colors duration-500">
                    {item.label}
                  </span>
                  <ChevronRight
                    size={18}
                    className="text-mist group-hover:text-brand-gold group-hover:translate-x-1 transition-all duration-500"
                  />
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Bottom section */}
          <div className="mt-auto pb-2">
            <div className="flex items-center gap-6 mb-6">
              <Link
                href="/wishlist"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-sm text-mist hover:text-brand-white transition-colors duration-300"
              >
                <Heart size={16} strokeWidth={1.5} />
                {t("Favoriler", "Wishlist")}
              </Link>
            </div>
            <div className="flex items-center gap-4 text-xs text-mist">
              <a
                href={BRAND_INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-white transition-colors duration-300"
              >
                Instagram
              </a>
              <span className="w-px h-3 bg-slate/60" />
              <a
                href={BRAND_WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-white transition-colors duration-300"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </Sheet>
    </>
  );
}
