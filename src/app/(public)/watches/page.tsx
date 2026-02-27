"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { SectionHeading } from "@/components/shared/section-heading";
import { StatusBadge } from "@/components/shared/status-badge";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { useSwrFetch } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { WATCH_BRANDS, CONDITION_LABELS } from "@/lib/utils/constants";
import { formatPrice } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import type { IProduct } from "@/types";

export default function WatchesPage() {
  const { t } = useI18n();
  const [filterOpen, setFilterOpen] = useState(false);
  const [brand, setBrand] = useState("");
  const [condition, setCondition] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [search, setSearch] = useState("");

  const params = new URLSearchParams({ category: "WATCH", published: "true" });
  if (brand) params.set("brand", brand);
  if (condition) params.set("condition", condition);
  if (sort) params.set("sort", sort);
  if (search) params.set("search", search);

  const { data: products, isLoading } = useSwrFetch<IProduct[]>(`/api/products?${params.toString()}`);

  const brandOptions = WATCH_BRANDS.map((b) => ({ value: b, label: b }));
  const conditionOptions = Object.entries(CONDITION_LABELS).map(([v, l]) => ({ value: v, label: l }));
  const sortOptions = [
    { value: "createdAt", label: t("En Yeni", "Newest") },
    { value: "price_asc", label: t("Fiyat: Düşükten Yukarıya", "Price: Low to High") },
    { value: "price_desc", label: t("Fiyat: Yüksekten Aşağıya", "Price: High to Low") },
    { value: "year", label: t("Yıl", "Year") },
  ];

  return (
    <div className="pt-28 pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <SectionHeading
          title={t("Saatler", "Watches")}
          subtitle={t(
            "Dünyanın en iyi saatlerinden oluşturduğumuz seçkin koleksiyon",
            "Curated collection of the world's finest timepieces"
          )}
          align="left"
        />

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <div className="hidden lg:flex items-center gap-4 flex-1">
            <Select options={brandOptions} placeholder={t("Tüm Markalar", "All Brands")} value={brand} onChange={(e) => setBrand(e.target.value)} className="w-48" />
            <Select options={conditionOptions} placeholder={t("Tüm Durumlar", "All Conditions")} value={condition} onChange={(e) => setCondition(e.target.value)} className="w-48" />
            <Input placeholder={t("Ara...", "Search...")} value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
          </div>
          <div className="flex items-center gap-3">
            <Select options={sortOptions} value={sort} onChange={(e) => setSort(e.target.value)} className="w-48" />
            <button
              onClick={() => setFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 text-sm text-mist hover:text-brand-white transition-colors"
            >
              <SlidersHorizontal size={16} />
              {t("Filtreler", "Filters")}
            </button>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-charcoal animate-pulse rounded-sm" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
          >
            {products.map((product) => (
              <motion.div key={product._id} variants={staggerItem}>
                <Link href={`/watches/${product.slug}`} className="group block">
                  <div className="relative aspect-[3/4] bg-charcoal border border-slate/50 overflow-hidden mb-3 transition-all duration-500 hover:border-soft-white/30">
                    {product.images[0] ? (
                      <img
                        src={product.images[0].url}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-mist text-xs">{t("Görsel Yok", "No Image")}</div>
                    )}
                    <div className="absolute top-3 left-3">
                      <StatusBadge status={product.availability} type="availability" />
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-brand-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <p className="text-xs text-mist">{product.reference} · {product.year}</p>
                      <p className="text-xs text-mist">{CONDITION_LABELS[product.condition] || product.condition}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-mist tracking-wider uppercase">{product.brand}</p>
                    <h3 className="font-serif text-base group-hover:text-brand-gold transition-colors">{product.model}</h3>
                    <p className="text-sm text-soft-white">
                      {product.priceOnRequest ? t("Fiyat Sorunuz", "Price on Request") : product.price ? formatPrice(product.price, product.currency) : ""}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <p className="text-mist">{t("Kriterlerinize uygun saat bulunamadı.", "No watches found matching your criteria.")}</p>
          </div>
        )}
      </div>

      {/* Mobile Filter Sheet */}
      <Sheet open={filterOpen} onClose={() => setFilterOpen(false)} title={t("Filtreler", "Filters")}>
        <div className="space-y-6">
          <Select options={brandOptions} placeholder={t("Tüm Markalar", "All Brands")} label={t("Marka", "Brand")} value={brand} onChange={(e) => setBrand(e.target.value)} />
          <Select options={conditionOptions} placeholder={t("Tüm Durumlar", "All Conditions")} label={t("Durum", "Condition")} value={condition} onChange={(e) => setCondition(e.target.value)} />
          <Input label={t("Ara", "Search")} placeholder={t("Saat ara...", "Search watches...")} value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button variant="primary" className="w-full" onClick={() => setFilterOpen(false)}>{t("Filtreleri Uygula", "Apply Filters")}</Button>
        </div>
      </Sheet>
    </div>
  );
}
