"use client";

import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils/cn";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();

  return (
    <button
      onClick={() => setLocale(locale === "tr" ? "en" : "tr")}
      className={cn(
        "flex items-center gap-1 text-xs font-medium tracking-wider uppercase transition-colors duration-300 hover:text-brand-gold",
        className
      )}
      aria-label={locale === "tr" ? "Switch to English" : "Türkçeye geç"}
    >
      <span className={cn(locale === "tr" ? "text-brand-gold" : "text-mist")}>
        TR
      </span>
      <span className="text-slate">|</span>
      <span className={cn(locale === "en" ? "text-brand-gold" : "text-mist")}>
        EN
      </span>
    </button>
  );
}
