import Link from "next/link";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import {
  BRAND_NAME,
  BRAND_EMAIL,
  BRAND_PHONE,
  BRAND_ADDRESS,
  BRAND_WORKING_HOURS,
} from "@/lib/utils/constants";

/* ─── Link columns ─── */
const COLUMNS = [
  {
    title: "Collection",
    links: [
      { label: "Watches", href: "/watches" },
      { label: "Hermes", href: "/hermes" },
      { label: "New Arrivals", href: "/watches?sort=newest" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Concierge", href: "/concierge" },
      { label: "Sell to Us", href: "/sell" },
      { label: "Authentication", href: "/about#authentication" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-black border-t border-slate/40">
      {/* ── Top: Logo + tagline ── */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-16 pb-12">
        <div className="flex flex-col items-start gap-4">
          <Logo variant="horizontal" width={140} height={55} link={false} />
          <p className="text-mist text-sm max-w-xs leading-relaxed">
            Istanbul&apos;s premier destination for authenticated luxury
            timepieces and Hermes. Only Original.
          </p>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="h-px bg-slate/40" />
      </div>

      {/* ── Middle: Link columns ── */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 lg:gap-16">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs uppercase tracking-[0.2em] text-mist mb-5">
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-soft-white/70 hover:text-brand-white transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="h-px bg-slate/40" />
      </div>

      {/* ── Bottom: Contact + copyright ── */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          {/* Contact info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-mist">
            <a
              href={`tel:${BRAND_PHONE.replace(/\s/g, "")}`}
              className="flex items-center gap-2 hover:text-brand-white transition-colors duration-300"
            >
              <Phone
                size={14}
                strokeWidth={1.5}
                className="text-brand-gold/70"
              />
              {BRAND_PHONE}
            </a>
            <a
              href={`mailto:${BRAND_EMAIL}`}
              className="flex items-center gap-2 hover:text-brand-white transition-colors duration-300"
            >
              <Mail
                size={14}
                strokeWidth={1.5}
                className="text-brand-gold/70"
              />
              {BRAND_EMAIL}
            </a>
            <span className="flex items-center gap-2">
              <MapPin
                size={14}
                strokeWidth={1.5}
                className="text-brand-gold/70"
              />
              {BRAND_ADDRESS}
            </span>
            <span className="flex items-center gap-2">
              <Clock
                size={14}
                strokeWidth={1.5}
                className="text-brand-gold/70"
              />
              {BRAND_WORKING_HOURS}
            </span>
          </div>

          {/* Socials */}
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs uppercase tracking-[0.15em] text-mist hover:text-brand-white transition-colors duration-300"
            >
              Instagram
            </a>
            <span className="w-px h-3 bg-slate/60" />
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs uppercase tracking-[0.15em] text-mist hover:text-brand-white transition-colors duration-300"
            >
              WhatsApp
            </a>
          </div>
        </div>

        {/* Copyright */}
        <p className="mt-8 text-xs text-mist/60">
          &copy; {year} {BRAND_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
