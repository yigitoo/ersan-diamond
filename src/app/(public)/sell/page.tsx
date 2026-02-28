"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Upload,
  X,
  Check,
  Home,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { CONDITION_LABELS, tl } from "@/lib/utils/constants";
import { fadeUp } from "@/lib/animations";

// ---------------------------------------------------------------------------
// Validation schema (client-side, aligned with createLeadSchema structure)
// ---------------------------------------------------------------------------
const sellFormSchema = z.object({
  productType: z.enum(["WATCH", "HERMES"], { message: "Please select a product type" }),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  reference: z.string().optional(),
  year: z.string().optional(),
  condition: z.string().min(1, "Condition is required"),
  boxPapers: z.string().min(1, "Please select box & papers status"),
  askingPrice: z.string().optional(),
  currency: z.string().optional(),
  description: z.string().max(2000).optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
});

type SellFormValues = z.infer<typeof sellFormSchema>;

// CONDITION_OPTIONS will be built inside the component with t() for bilingual support

const CURRENCY_OPTIONS = [
  { value: "EUR", label: "EUR" },
  { value: "USD", label: "USD" },
  { value: "GBP", label: "GBP" },
  { value: "TRY", label: "TRY" },
  { value: "CHF", label: "CHF" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function SellPage() {
  const { t } = useI18n();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const CONDITION_OPTIONS = Object.entries(CONDITION_LABELS).map(([value, label]) => ({
    value,
    label: tl(t, label),
  }));

  const PRODUCT_TYPE_OPTIONS = [
    { value: "WATCH", label: t("Saat", "Watch") },
    { value: "HERMES", label: "Hermès" },
    { value: "JEWELRY", label: t("Mücevherat", "Jewelry") },
  ];

  const BOX_PAPERS_OPTIONS = [
    { value: "FULL_SET", label: t("Tam Set (Kutu & Belgeler)", "Full Set (Box & Papers)") },
    { value: "BOX_ONLY", label: t("Sadece Kutu", "Box Only") },
    { value: "PAPERS_ONLY", label: t("Sadece Belgeler", "Papers Only") },
    { value: "NONE", label: t("Yok", "None") },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SellFormValues>({
    resolver: zodResolver(sellFormSchema),
    defaultValues: {
      currency: "EUR",
    },
  });

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - photos.length;
    const toAdd = files.slice(0, remaining);

    const newPhotos = [...photos, ...toAdd];
    setPhotos(newPhotos);

    // Generate previews
    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotoPreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(data: SellFormValues) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "SELL_TO_US",
          name: data.name,
          email: data.email,
          phone: data.phone,
          productBrand: data.brand,
          productModel: data.model,
          productReference: data.reference,
          productYear: data.year,
          desiredPrice: data.askingPrice ? Number(data.askingPrice.replace(/[^0-9]/g, "")) : undefined,
          currency: data.currency,
          notes: data.description,
          source: "WEBSITE",
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || t("Bir hata oluştu", "An error occurred"));
        return;
      }
      setSuccess(true);
    } catch {
      alert(t("Bağlantı hatası", "Network error"));
    } finally {
      setSubmitting(false);
    }
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-md mx-auto px-6"
        >
          <div className="w-20 h-20 rounded-full bg-brand-white text-brand-black flex items-center justify-center mx-auto mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <Check size={36} />
            </motion.div>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl mb-4">{t("Başvurunuz Alındı", "Submission Received")}</h2>
          <p className="text-mist mb-2">
            {t(
              "Başvurunuz için teşekkürler. Ekibimiz parçanızı inceleyecek ve 48 saat içinde size dönecektir.",
              "Thank you for your submission. Our team will review your piece and get back to you within 48 hours."
            )}
          </p>
          <p className="text-mist mb-8">
            {t(
              "Belirttiğiniz e-posta adresi üzerinden sizinle iletişime geçeceğiz.",
              "We will contact you via the email address you provided."
            )}
          </p>
          <Link href="/" className="block">
            <Button variant="outline" size="lg" className="w-full">
              <Home size={16} className="mr-2" />
              {t("Ana Sayfaya Dön", "Back to Home")}
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      {/* Hero */}
      <section className="text-center mb-12 px-6">
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="font-serif text-4xl md:text-5xl mb-4"
        >
          {t("Bize Satın", "Sell to Us")}
        </motion.h1>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.15 }}
          className="text-mist text-sm tracking-wider"
        >
          {t("Lüks parçalarınızı konsinye bırakın veya bize satın", "Consign or sell your luxury pieces")}
        </motion.p>
      </section>

      {/* Form */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
        className="max-w-2xl mx-auto px-6"
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-charcoal border border-slate/50 rounded-sm p-6 md:p-10 space-y-8"
        >
          {/* Product Info */}
          <div>
            <h2 className="font-serif text-xl mb-6">{t("Ürün Bilgileri", "Product Information")}</h2>
            <div className="space-y-5">
              <Select
                label={t("Ürün Tipi", "Product Type")}
                options={PRODUCT_TYPE_OPTIONS}
                placeholder={t("Tip seçin", "Select type")}
                error={errors.productType?.message}
                {...register("productType")}
              />
              <Input
                label={t("Marka", "Brand")}
                placeholder={t("örn. Rolex, Hermès", "e.g. Rolex, Hermès")}
                error={errors.brand?.message}
                {...register("brand")}
              />
              <Input
                label={t("Model", "Model")}
                placeholder={t("örn. Daytona, Birkin 25", "e.g. Daytona, Birkin 25")}
                error={errors.model?.message}
                {...register("model")}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label={t("Referans (isteğe bağlı)", "Reference (optional)")}
                  placeholder={t("örn. 116500LN", "e.g. 116500LN")}
                  {...register("reference")}
                />
                <Input
                  label={t("Yıl (isteğe bağlı)", "Year (optional)")}
                  placeholder={t("örn. 2023", "e.g. 2023")}
                  type="text"
                  {...register("year")}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Select
                  label={t("Durum", "Condition")}
                  options={CONDITION_OPTIONS}
                  placeholder={t("Durum seçin", "Select condition")}
                  error={errors.condition?.message}
                  {...register("condition")}
                />
                <Select
                  label={t("Kutu & Belgeler", "Box & Papers")}
                  options={BOX_PAPERS_OPTIONS}
                  placeholder={t("Seçin", "Select")}
                  error={errors.boxPapers?.message}
                  {...register("boxPapers")}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="sm:col-span-2">
                  <Input
                    label={t("Talep Edilen Fiyat (isteğe bağlı)", "Asking Price (optional)")}
                    placeholder={t("örn. 150,000", "e.g. 150,000")}
                    type="text"
                    {...register("askingPrice")}
                  />
                </div>
                <Select
                  label={t("Para Birimi", "Currency")}
                  options={CURRENCY_OPTIONS}
                  {...register("currency")}
                />
              </div>
              <Textarea
                label={t("Açıklama (isteğe bağlı)", "Description (optional)")}
                placeholder={t(
                  "Parçanız hakkında ek bilgiler: geçmişi, değişiklikler, dikkat çeken özellikler...",
                  "Additional details about your piece: history, any modifications, notable characteristics..."
                )}
                rows={4}
                {...register("description")}
              />
            </div>
          </div>

          {/* Photos */}
          <div>
            <h2 className="font-serif text-xl mb-6">{t("Fotoğraflar", "Photos")}</h2>
            <p className="text-xs text-mist mb-4">
              {t(
                "Parçanızın en fazla 5 fotoğrafını yükleyin (ön, arka, yanlar, işaret/damgalar)",
                "Upload up to 5 photos of your piece (front, back, sides, markings)"
              )}
            </p>

            {/* Upload area */}
            <label
              className={cn(
                "block border-2 border-dashed border-slate rounded-sm p-8 text-center cursor-pointer transition-all duration-300 hover:border-soft-white/50",
                photos.length >= 5 && "opacity-50 cursor-not-allowed"
              )}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoChange}
                disabled={photos.length >= 5}
              />
              <Upload size={32} className="mx-auto text-mist mb-3" />
              <p className="text-sm text-mist">
                {photos.length >= 5
                  ? t("Maksimum 5 fotoğraf yüklendi", "Maximum 5 photos reached")
                  : t("Fotoğrafları sürükleyin veya yüklemek için tıklayın", "Drop photos here or click to upload")}
              </p>
              <p className="text-xs text-mist/50 mt-1">
                {photos.length}/5 {t("fotoğraf", "photos")}
              </p>
            </label>

            {/* Previews */}
            {photoPreviews.length > 0 && (
              <div className="flex gap-3 mt-4 overflow-x-auto no-scrollbar">
                {photoPreviews.map((src, i) => (
                  <div key={i} className="relative w-20 h-20 flex-shrink-0 bg-slate rounded-sm overflow-hidden">
                    <img src={src} alt={`${t("Fotoğraf", "Photo")} ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-brand-black/80 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact */}
          <div>
            <h2 className="font-serif text-xl mb-6">{t("İletişim Bilgileri", "Contact Information")}</h2>
            <div className="space-y-5">
              <Input
                label={t("Ad Soyad", "Full Name")}
                placeholder={t("Ahmet Yılmaz", "John Doe")}
                error={errors.name?.message}
                {...register("name")}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label={t("E-posta", "Email")}
                  placeholder="you@example.com"
                  type="email"
                  error={errors.email?.message}
                  {...register("email")}
                />
                <Input
                  label={t("Telefon", "Phone")}
                  placeholder="+90 (5XX) XXX XX XX"
                  type="tel"
                  error={errors.phone?.message}
                  {...register("phone")}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={submitting}
            >
              {t("İncelemeye Gönder", "Submit for Review")}
            </Button>
            <p className="text-xs text-mist text-center mt-4">
              {t(
                "Bilgileriniz kesinlikle gizli tutulur ve yalnızca bu değerlendirme için kullanılır.",
                "Your information is kept strictly confidential and will only be used for this evaluation."
              )}
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
