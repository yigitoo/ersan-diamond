"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trash2, ArrowRight, Mail, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/shared/section-heading";
import { StatusBadge } from "@/components/shared/status-badge";
import { useI18n } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils/formatters";
import { staggerContainer, staggerItem, fadeUp } from "@/lib/animations";
import { useWishlist } from "@/lib/wishlist/wishlist-context";
import type { IProduct } from "@/types";

export default function WishlistPage() {
  const { t } = useI18n();
  const { ids, remove, mounted } = useWishlist();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Email send state
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (!mounted) return;

    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?ids=${ids.join(",")}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setProducts(Array.isArray(data) ? data : data.data || []);
        }
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProducts();
    return () => { cancelled = true; };
  }, [ids, mounted]);

  const handleRemove = (productId: string) => {
    remove(productId);
    setProducts((prev) => prev.filter((p) => p._id !== productId));
  };

  const handleSendEmail = async () => {
    if (!email.includes("@") || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/wishlist/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, productIds: ids }),
      });
      if (res.ok) {
        setEmailSent(true);
        setTimeout(() => {
          setEmailSent(false);
          setShowEmailForm(false);
          setEmail("");
        }, 3000);
      }
    } catch {
      // silently fail
    } finally {
      setSending(false);
    }
  };

  const isEmpty = !loading && products.length === 0;

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-start justify-between gap-4 mb-8">
          <SectionHeading
            title={t("Favorilerim", "My Wishlist")}
            subtitle={t(
              "Beğendiğiniz ürünleri buradan takip edin",
              "Keep track of pieces you love"
            )}
            align="left"
          />

          {/* Send to email button */}
          {!isEmpty && !loading && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEmailForm(!showEmailForm)}
              className="shrink-0 mt-2"
            >
              <Mail size={14} className="mr-2" />
              {t("E-posta Gönder", "Send to Email")}
            </Button>
          )}
        </div>

        {/* Email form */}
        <AnimatePresence>
          {showEmailForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-charcoal border border-slate/50 rounded-sm p-4 md:p-6">
                {emailSent ? (
                  <div className="flex items-center gap-3 text-green-400">
                    <Check size={18} />
                    <span className="text-sm">
                      {t("Favori listeniz e-postanıza gönderildi!", "Your wishlist has been sent to your email!")}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3 items-end">
                    <div className="flex-1 w-full">
                      <Input
                        label={t("E-posta Adresiniz", "Your Email")}
                        placeholder="you@example.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="primary"
                        onClick={handleSendEmail}
                        loading={sending}
                        disabled={!email.includes("@")}
                      >
                        {t("Gönder", "Send")}
                      </Button>
                      <button
                        onClick={() => setShowEmailForm(false)}
                        className="p-2 rounded-sm text-mist hover:text-brand-white transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-charcoal animate-pulse rounded-sm" />
            ))}
          </div>
        ) : isEmpty ? (
          /* Empty state */
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
          /* Product grid */
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
          >
            {products.map((product) => (
              <motion.div key={product._id} variants={staggerItem} className="group relative">
                <Link
                  href={`/${product.category === "HERMES" ? "hermes" : product.category === "JEWELRY" ? "jewelry" : "watches"}/${product.slug}`}
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
