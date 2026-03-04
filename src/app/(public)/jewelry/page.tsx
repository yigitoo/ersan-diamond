"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { useSwrFetch } from "@/lib/hooks";
import { WishlistButton } from "@/components/shared/wishlist-button";
import { useI18n } from "@/lib/i18n";
import { JEWELRY_TYPES, CONDITION_LABELS, tl } from "@/lib/utils/constants";
import { formatPrice } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import type { IProduct, JewelrySpecs } from "@/types";

// ---------------------------------------------------------------------------
// Metal options
// ---------------------------------------------------------------------------
const METAL_OPTIONS_DATA: { value: string; tr: string; en: string }[] = [
  { value: "18K Yellow Gold", tr: "18K Sarı Altın", en: "18K Yellow Gold" },
  { value: "18K White Gold", tr: "18K Beyaz Altın", en: "18K White Gold" },
  { value: "18K Rose Gold", tr: "18K Rose Altın", en: "18K Rose Gold" },
  { value: "Platinum", tr: "Platin", en: "Platinum" },
  { value: "Sterling Silver", tr: "925 Gümüş", en: "Sterling Silver" },
];

const GEMSTONE_OPTIONS_DATA: { value: string; tr: string; en: string }[] = [
  { value: "Diamond", tr: "Pırlanta", en: "Diamond" },
  { value: "Emerald", tr: "Zümrüt", en: "Emerald" },
  { value: "Ruby", tr: "Yakut", en: "Ruby" },
  { value: "Sapphire", tr: "Safir", en: "Sapphire" },
  { value: "Pearl", tr: "İnci", en: "Pearl" },
  { value: "Amethyst", tr: "Ametist", en: "Amethyst" },
];

export default function JewelryPage() {
  const { t } = useI18n();
  const [filterOpen, setFilterOpen] = useState(false);
  const [type, setType] = useState("");
  const [metal, setMetal] = useState("");
  const [gemstone, setGemstone] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [search, setSearch] = useState("");

  const params = new URLSearchParams({ category: "JEWELRY", published: "true" });
  if (type) params.set("type", type);
  if (metal) params.set("metal", metal);
  if (gemstone) params.set("gemstone", gemstone);
  if (sort) params.set("sort", sort);
  if (search) params.set("search", search);

  const { data: products, isLoading } = useSwrFetch<IProduct[]>(`/api/products?${params.toString()}`);

  const typeOptions = JEWELRY_TYPES.map((j) => ({ value: j, label: j }));
  const conditionOptions = Object.entries(CONDITION_LABELS).map(([v, l]) => ({ value: v, label: tl(t, l) }));
  const METAL_OPTIONS = METAL_OPTIONS_DATA.map((m) => ({ value: m.value, label: t(m.tr, m.en) }));
  const GEMSTONE_OPTIONS = GEMSTONE_OPTIONS_DATA.map((g) => ({ value: g.value, label: t(g.tr, g.en) }));
  const sortOptions = [
    { value: "createdAt", label: t("En Yeni", "Newest") },
    { value: "price_asc", label: t("Fiyat: Düşükten Yükseğe", "Price: Low to High") },
    { value: "price_desc", label: t("Fiyat: Yüksekten Düşüğe", "Price: High to Low") },
  ];

  const productCount = products?.length ?? 0;

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Category Banner */}
        <div className="mb-10 border-b border-slate/40 pb-8">
          <p className="eyebrow mb-3">{t("Koleksiyon", "Collection")}</p>
          <div className="flex items-end justify-between gap-4">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl">{t("Mücevherat", "Jewelry")}</h1>
            {!isLoading && (
              <p className="text-mist text-sm mb-1">
                {productCount} {t("ürün", productCount === 1 ? "piece" : "pieces")}
              </p>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-slate/30 mb-8 py-5 gap-4">
          <div className="hidden lg:flex items-center gap-4 flex-1">
            <Select options={typeOptions} placeholder={t("Tüm Tipler", "All Types")} value={type} onChange={(e) => setType(e.target.value)} className="w-44" />
            <Select options={METAL_OPTIONS} placeholder={t("Tüm Metaller", "All Metals")} value={metal} onChange={(e) => setMetal(e.target.value)} className="w-44" />
            <Select options={GEMSTONE_OPTIONS} placeholder={t("Tüm Taşlar", "All Gemstones")} value={gemstone} onChange={(e) => setGemstone(e.target.value)} className="w-44" />
            <Input placeholder={t("Ara...", "Search...")} value={search} onChange={(e) => setSearch(e.target.value)} className="w-52" />
          </div>
          <div className="flex items-center gap-3">
            <Select options={sortOptions} value={sort} onChange={(e) => setSort(e.target.value)} className="w-48" />
            <button
              onClick={() => setFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 text-sm text-mist hover:text-brand-white transition-colors min-h-[44px]"
            >
              <SlidersHorizontal size={16} />
              {t("Filtreler", "Filters")}
            </button>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 xl:gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] skeleton-shimmer rounded-sm" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 xl:gap-8"
          >
            {products.map((product) => {
              const specs = product.specs as JewelrySpecs;
              return (
                <motion.div key={product._id} variants={staggerItem}>
                  <Link href={`/jewelry/${product.slug}`} className="group block">
                    <div className="relative aspect-[3/4] bg-charcoal border border-slate/50 overflow-hidden mb-3 transition-all duration-500 hover:border-soft-white/30">
                      {product.images[0] ? (
                        <img
                          src={product.images[0].url}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-mist/30">
                          <Gem size={40} />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <StatusBadge status={product.availability} type="availability" />
                      </div>
                      <div className="absolute top-3 right-3">
                        <WishlistButton productId={product._id} size={16} />
                      </div>
                      {/* Permanent bottom shadow — always visible */}
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
                      {/* Info always visible at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-[11px] text-white font-medium drop-shadow-lg">
                          {specs?.metal}
                          {specs?.gemstone ? ` · ${specs.gemstone}` : ""}
                          {specs?.carat ? ` · ${specs.carat} ct` : ""}
                        </p>
                        <p className="text-[11px] text-white/80 drop-shadow-lg">{tl(t, CONDITION_LABELS[product.condition]) || product.condition}</p>
                      </div>
                      {/* Gold accent line */}
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-mist tracking-wider uppercase">{product.brand}</p>
                      <h3 className="font-serif text-base group-hover:text-brand-gold transition-colors">
                        {product.model}{specs?.type ? ` - ${specs.type}` : ""}
                      </h3>
                      <p className="text-sm text-soft-white">
                        {product.priceOnRequest ? t("Fiyat Sorunuz", "Price on Request") : product.price ? formatPrice(product.price, product.currency) : ""}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full border border-slate/50 flex items-center justify-center mx-auto mb-6">
              <Gem size={32} className="text-mist/30" />
            </div>
            <h3 className="font-serif text-2xl mb-3">{t("Sonuç Bulunamadı", "No Results Found")}</h3>
            <p className="text-mist text-sm mb-6">{t("Kriterlerinize uygun mücevher bulunamadı.", "No jewelry pieces found matching your criteria.")}</p>
            <Button
              variant="outline"
              onClick={() => { setType(""); setMetal(""); setGemstone(""); setSearch(""); }}
            >
              {t("Filtreleri Temizle", "Clear Filters")}
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Filter Sheet */}
      <Sheet open={filterOpen} onClose={() => setFilterOpen(false)} title={t("Filtreler", "Filters")}>
        <div className="space-y-6">
          <Select options={typeOptions} placeholder={t("Tüm Tipler", "All Types")} label={t("Tip", "Type")} value={type} onChange={(e) => setType(e.target.value)} />
          <Select options={METAL_OPTIONS} placeholder={t("Tüm Metaller", "All Metals")} label={t("Metal", "Metal")} value={metal} onChange={(e) => setMetal(e.target.value)} />
          <Select options={GEMSTONE_OPTIONS} placeholder={t("Tüm Taşlar", "All Gemstones")} label={t("Taş", "Gemstone")} value={gemstone} onChange={(e) => setGemstone(e.target.value)} />
          <Input label={t("Ara", "Search")} placeholder={t("Ara...", "Search...")} value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button variant="primary" className="w-full" onClick={() => setFilterOpen(false)}>{t("Filtreleri Uygula", "Apply Filters")}</Button>
        </div>
      </Sheet>
    </div>
  );
}
