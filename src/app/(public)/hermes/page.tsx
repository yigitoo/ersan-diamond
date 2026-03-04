"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { StatusBadge } from "@/components/shared/status-badge";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { useSwrFetch } from "@/lib/hooks";
import { WishlistButton } from "@/components/shared/wishlist-button";
import { useI18n } from "@/lib/i18n";
import { HERMES_MODELS, CONDITION_LABELS, tl } from "@/lib/utils/constants";
import { formatPrice } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import type { IProduct, HermesSpecs } from "@/types";

// ---------------------------------------------------------------------------
// Material & color options
// ---------------------------------------------------------------------------
const MATERIAL_OPTIONS = [
  { value: "Togo", label: "Togo" },
  { value: "Epsom", label: "Epsom" },
  { value: "Clemence", label: "Clemence" },
  { value: "Swift", label: "Swift" },
  { value: "Ostrich", label: "Ostrich" },
  { value: "Crocodile", label: "Crocodile" },
  { value: "Chevre", label: "Chevre" },
];

const COLOR_OPTIONS = [
  { value: "Noir", label: "Noir" },
  { value: "Gold", label: "Gold" },
  { value: "Etoupe", label: "Etoupe" },
  { value: "Rouge Casaque", label: "Rouge Casaque" },
  { value: "Bleu Nuit", label: "Bleu Nuit" },
  { value: "Rose Sakura", label: "Rose Sakura" },
  { value: "Gris Etain", label: "Gris Etain" },
  { value: "Craie", label: "Craie" },
  { value: "Vert Amande", label: "Vert Amande" },
];

export default function HermesPage() {
  const { t } = useI18n();
  const [filterOpen, setFilterOpen] = useState(false);
  const [model, setModel] = useState("");
  const [material, setMaterial] = useState("");
  const [color, setColor] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [search, setSearch] = useState("");

  const params = new URLSearchParams({ category: "HERMES", published: "true" });
  if (model) params.set("model", model);
  if (material) params.set("material", material);
  if (color) params.set("color", color);
  if (sort) params.set("sort", sort);
  if (search) params.set("search", search);

  const { data: products, isLoading } = useSwrFetch<IProduct[]>(`/api/products?${params.toString()}`);

  const modelOptions = HERMES_MODELS.map((m) => ({ value: m, label: m }));
  const conditionOptions = Object.entries(CONDITION_LABELS).map(([v, l]) => ({ value: v, label: tl(t, l) }));
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
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl">Hermès</h1>
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
            <Select options={modelOptions} placeholder={t("Tüm Modeller", "All Models")} value={model} onChange={(e) => setModel(e.target.value)} className="w-44" />
            <Select options={MATERIAL_OPTIONS} placeholder={t("Tüm Malzemeler", "All Materials")} value={material} onChange={(e) => setMaterial(e.target.value)} className="w-44" />
            <Select options={COLOR_OPTIONS} placeholder={t("Tüm Renkler", "All Colors")} value={color} onChange={(e) => setColor(e.target.value)} className="w-44" />
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
              const specs = product.specs as HermesSpecs;
              return (
                <motion.div key={product._id} variants={staggerItem}>
                  <Link href={`/hermes/${product.slug}`} className="group block">
                    <div className="relative aspect-[3/4] bg-charcoal border border-slate/50 overflow-hidden mb-3 transition-all duration-500 hover:border-soft-white/30">
                      {product.images[0] ? (
                        <img
                          src={product.images[0].url}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-mist/30">
                          <ShoppingBag size={40} />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <StatusBadge status={product.availability} type="availability" />
                      </div>
                      <div className="absolute top-3 right-3">
                        <WishlistButton productId={product._id} size={16} />
                      </div>
                      {/* Hover overlay — gradient */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="mt-auto">
                          <p className="text-xs text-white font-medium">
                            {specs?.material} · {specs?.color}
                            {specs?.hardware ? ` · ${specs.hardware} HW` : ""}
                          </p>
                          <p className="text-xs text-white/70">{tl(t, CONDITION_LABELS[product.condition]) || product.condition}</p>
                        </div>
                      </div>
                      {/* Gold accent line */}
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-mist tracking-wider uppercase">{product.brand}</p>
                      <h3 className="font-serif text-base group-hover:text-brand-gold transition-colors">
                        {product.model}{specs?.size ? ` ${specs.size}` : ""}
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
              <ShoppingBag size={32} className="text-mist/30" />
            </div>
            <h3 className="font-serif text-2xl mb-3">{t("Sonuç Bulunamadı", "No Results Found")}</h3>
            <p className="text-mist text-sm mb-6">{t("Kriterlerinize uygun Hermès ürünü bulunamadı.", "No Hermès pieces found matching your criteria.")}</p>
            <Button
              variant="outline"
              onClick={() => { setModel(""); setMaterial(""); setColor(""); setSearch(""); }}
            >
              {t("Filtreleri Temizle", "Clear Filters")}
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Filter Sheet */}
      <Sheet open={filterOpen} onClose={() => setFilterOpen(false)} title={t("Filtreler", "Filters")}>
        <div className="space-y-6">
          <Select options={modelOptions} placeholder={t("Tüm Modeller", "All Models")} label={t("Model", "Model")} value={model} onChange={(e) => setModel(e.target.value)} />
          <Select options={MATERIAL_OPTIONS} placeholder={t("Tüm Malzemeler", "All Materials")} label={t("Malzeme", "Material")} value={material} onChange={(e) => setMaterial(e.target.value)} />
          <Select options={COLOR_OPTIONS} placeholder={t("Tüm Renkler", "All Colors")} label={t("Renk", "Color")} value={color} onChange={(e) => setColor(e.target.value)} />
          <Input label={t("Ara", "Search")} placeholder={t("Ara...", "Search...")} value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button variant="primary" className="w-full" onClick={() => setFilterOpen(false)}>{t("Filtreleri Uygula", "Apply Filters")}</Button>
        </div>
      </Sheet>
    </div>
  );
}
