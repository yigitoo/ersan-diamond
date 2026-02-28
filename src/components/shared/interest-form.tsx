"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Heart, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface InterestFormProps {
  productId: string;
  productTitle: string;
}

export function InterestForm({ productId, productTitle }: InterestFormProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", note: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = t("Ad zorunlu", "Name is required");
    if (!form.email.trim()) errs.email = t("E-posta zorunlu", "Email is required");
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = t("Geçerli bir e-posta girin", "Enter a valid email");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          notes: form.note.trim()
            ? `${t("İlgilenilen ürün", "Interested in product")}: ${productTitle}\n\n${form.note.trim()}`
            : `${t("İlgilenilen ürün", "Interested in product")}: ${productTitle}`,
          type: "INQUIRY",
          source: "WEBSITE",
          relatedProductId: productId,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || t("Gönderilemedi", "Failed to submit"));
        return;
      }
      setSubmitted(true);
    } catch {
      alert(t("Bağlantı hatası", "Network error"));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="border border-green-500/30 bg-green-500/5 rounded-sm p-6 text-center space-y-2">
        <Check size={32} className="mx-auto text-green-400" />
        <p className="text-sm font-medium text-green-400">
          {t("İlginiz kaydedildi!", "Your interest has been recorded!")}
        </p>
        <p className="text-xs text-mist">
          {t(
            "Ürün tekrar stoka girdiğinde sizinle iletişime geçeceğiz.",
            "We'll contact you when this piece becomes available again."
          )}
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="space-y-3 pt-2">
        <Button variant="primary" size="lg" className="w-full" onClick={() => setOpen(true)}>
          <Heart size={16} className="mr-2" />
          {t("Bu Ürünle İlgileniyorum", "I'm Interested in This Piece")}
        </Button>
        <p className="text-xs text-mist text-center">
          {t(
            "Ürün tekrar stoka girdiğinde bilgilendirileceksiniz",
            "You'll be notified when this piece becomes available"
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2 border border-slate/30 rounded-sm p-4 bg-charcoal/30">
      <p className="text-sm font-medium">
        {t("İlginizi Bildirin", "Express Your Interest")}
      </p>
      <Input
        label={t("Ad Soyad", "Full Name")}
        value={form.name}
        onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); if (errors.name) setErrors((p) => ({ ...p, name: "" })); }}
        error={errors.name}
        placeholder={t("Adınız Soyadınız", "Your full name")}
      />
      <Input
        label={t("E-posta", "Email")}
        type="email"
        value={form.email}
        onChange={(e) => { setForm((p) => ({ ...p, email: e.target.value })); if (errors.email) setErrors((p) => ({ ...p, email: "" })); }}
        error={errors.email}
        placeholder="email@ornek.com"
      />
      <Input
        label={`${t("Telefon", "Phone")} (${t("Opsiyonel", "Optional")})`}
        type="tel"
        value={form.phone}
        onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
        placeholder="+90 5XX XXX XX XX"
      />
      <Textarea
        label={`${t("Not", "Note")} (${t("Opsiyonel", "Optional")})`}
        rows={3}
        value={form.note}
        onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
        placeholder={t("Eklemek istediğiniz bir not varsa...", "Any additional notes...")}
      />
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          {t("Vazgeç", "Cancel")}
        </Button>
        <Button variant="primary" size="sm" loading={loading} onClick={handleSubmit} className="flex-1">
          {t("Gönder", "Submit")}
        </Button>
      </div>
    </div>
  );
}
