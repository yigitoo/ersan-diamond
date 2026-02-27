"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";
import { StatusBadge } from "@/components/shared/status-badge";
import { useI18n } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils/formatters";
import { staggerContainer, staggerItem, fadeUp } from "@/lib/animations";
import { cn } from "@/lib/utils/cn";
import type { IProduct } from "@/types";

/* ─── localStorage helpers ─── */
const STORAGE_KEY = "ersan-wishlist";

function getWishlistIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function removeFromWishlist(productId: string) {
  const ids = getWishlistIds().filter((id) => id !== productId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("wishlist-change"));
}

/* ─── Page ─── */
export default function WishlistPage() {
  const { t } = useI18n();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlistProducts = async () => {
    const ids = getWishlistIds();
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/products?ids=${ids.join(",")}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : data.data || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlistProducts();

    const onWishlistChange = () => fetchWishlistProducts();
    window.addEventListener("wishlist-change", onWishlistChange);
    return () => window.removeEventListener("wishlist-change", onWishlistChange);
  }, []);

  const handleRemove = (productId: string) => {
    removeFromWishlist(productId);
    setProducts((prev) => prev.filter((p) => p._id !== productId));
  };

  const isEmpty = !loading && products.length === 0;

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <SectionHeading
          title={t("Favorilerim", "My Wishlist")}
          subtitle={t(
            "Beğendiğiniz ürünleri buradan takip edin",
            "Keep track of pieces you love"
          )}
          align="left"
        />

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-charcoal animate-pulse rounded-sm" />
            ))}
          </div>
        ) : isEmpty ? (
          /* ─── Empty state ─── */
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-center py-24"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-slate/40 mb-6">
              <Heart size={28} className="text-mist" />
            </div>
            <h3 className="font-serif text-xl mb-3">
              {t("Henüz favori ürününüz yok", "Your wishlist is empty")}
            </h3>
            <p className="text-mist text-sm mb-8 max-w-sm mx-auto">
              {t(
                "Koleksiyonumuzu keşfederken beğendiğiniz ürünleri favorilere ekleyin",
                "Browse our collection and save pieces you love"
              )}
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/watches">
                <Button variant="primary" size="lg">
                  {t("Saatleri Keşfet", "Explore Watches")}
                </Button>
              </Link>
              <Link href="/hermes">
                <Button variant="outline" size="lg">
                  Hermès
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          /* ─── Product grid ─── */
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
          >
            {products.map((product) => (
              <motion.div key={product._id} variants={staggerItem} className="group relative">
                <Link
                  href={`/${product.category === "HERMES" ? "hermes" : "watches"}/${product.slug}`}
                  className="block"
                >
                  <div className="relative aspect-[3/4] bg-charcoal border border-slate/50 overflow-hidden mb-3 transition-all duration-500 hover:border-soft-white/30">
                    {product.images[0] ? (
                      <img
                        src={product.images[0].url}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-mist text-xs">
                        {t("Görsel Yok", "No Image")}
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <StatusBadge status={product.availability} type="availability" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-mist tracking-wider uppercase">{product.brand}</p>
                    <h3 className="font-serif text-base group-hover:text-brand-gold transition-colors">
                      {product.model}
                    </h3>
                    <p className="text-sm text-soft-white">
                      {product.priceOnRequest
                        ? t("Fiyat Sorunuz", "Price on Request")
                        : product.price
                          ? formatPrice(product.price, product.currency)
                          : ""}
                    </p>
                  </div>
                </Link>

                {/* Remove button */}
                <button
                  onClick={() => handleRemove(product._id)}
                  className="absolute top-3 right-3 p-2 bg-brand-black/60 backdrop-blur-sm rounded-full text-mist hover:text-red-400 transition-colors z-10"
                  aria-label={t("Favorilerden kaldır", "Remove from wishlist")}
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Continue shopping CTA */}
        {!isEmpty && !loading && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <Link
              href="/watches"
              className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-mist hover:text-brand-white transition-colors duration-500"
            >
              {t("Koleksiyonu Keşfetmeye Devam Et", "Continue Browsing")}
              <ArrowRight size={14} strokeWidth={1.5} />
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
