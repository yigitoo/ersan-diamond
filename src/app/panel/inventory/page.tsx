"use client";

import { useState, useCallback } from "react";
import { useSwrPaginated } from "@/lib/hooks";
import { useSWRConfig } from "swr";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet } from "@/components/ui/sheet";
import { Dialog } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { Pagination } from "@/components/shared/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils/formatters";
import { CONDITION_LABELS, tl } from "@/lib/utils/constants";
import { cn } from "@/lib/utils/cn";
import { Plus, Pencil, Trash2, Eye, EyeOff, ImagePlus } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const emptyProductForm = {
  category: "WATCH",
  brand: "",
  model: "",
  reference: "",
  year: "",
  condition: "EXCELLENT",
  price: "",
  currency: "EUR",
  priceOnRequest: false,
  title: "",
  description: "",
  published: false,
  featured: false,
  images: [] as { url: string; alt: string; order: number }[],
};

export default function InventoryPage() {
  const { mutate } = useSWRConfig();
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("");
  const [availability, setAvailability] = useState("");
  const [search, setSearch] = useState("");

  // Add/Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProductForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Image URL input
  const [imageUrlInput, setImageUrlInput] = useState("");

  // Delete confirm dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const CATEGORY_OPTIONS = [
    { value: "WATCH", label: t("Saat", "Watch") },
    { value: "HERMES", label: "Hermes" },
  ];

  const CONDITION_OPTIONS = [
    { value: "UNWORN", label: t("Kullanılmamış", "Unworn") },
    { value: "EXCELLENT", label: t("Mükemmel", "Excellent") },
    { value: "VERY_GOOD", label: t("Çok İyi", "Very Good") },
    { value: "GOOD", label: t("İyi", "Good") },
    { value: "FAIR", label: t("Orta", "Fair") },
  ];

  const CURRENCY_OPTIONS = [
    { value: "EUR", label: "EUR" },
    { value: "USD", label: "USD" },
    { value: "TRY", label: "TRY" },
    { value: "GBP", label: "GBP" },
  ];

  const { data, isLoading } = useSwrPaginated("/api/products", { page, limit: 20, category: category || undefined, availability: availability || undefined, search: search || undefined });
  const products = (data as any)?.data || [];
  const meta = (data as any)?.meta;

  const refreshData = useCallback(() => {
    mutate((key: string) => typeof key === "string" && key.startsWith("/api/products"), undefined, { revalidate: true });
    mutate((key: string) => typeof key === "string" && key.startsWith("/api/inventory"), undefined, { revalidate: true });
  }, [mutate]);

  const updateForm = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const openAddDialog = () => {
    setEditingId(null);
    setForm(emptyProductForm);
    setFormErrors({});
    setImageUrlInput("");
    setDialogOpen(true);
  };

  const openEditDialog = async (product: any) => {
    setEditingId(product._id);
    setForm({
      category: product.category || "WATCH",
      brand: product.brand || "",
      model: product.model || "",
      reference: product.reference || "",
      year: product.year?.toString() || "",
      condition: product.condition || "EXCELLENT",
      price: product.price?.toString() || "",
      currency: product.currency || "EUR",
      priceOnRequest: product.priceOnRequest || false,
      title: product.title || "",
      description: product.description || "",
      published: product.published || false,
      featured: product.featured || false,
      images: product.images || [],
    });
    setFormErrors({});
    setImageUrlInput("");
    setDialogOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.brand.trim()) errors.brand = t("Marka gerekli", "Brand is required");
    if (!form.model.trim()) errors.model = t("Model gerekli", "Model is required");
    if (!form.title.trim()) errors.title = t("Başlık gerekli", "Title is required");
    if (!form.priceOnRequest && form.price && (isNaN(Number(form.price)) || Number(form.price) < 0)) {
      errors.price = t("Geçerli bir fiyat gerekli", "Valid price is required");
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        ...form,
        price: form.price ? Number(form.price) : undefined,
        year: form.year ? Number(form.year) : undefined,
      };

      const url = editingId ? `/api/inventory/${editingId}` : "/api/inventory";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || t("Ürün kaydedilemedi", "Failed to save product"));
        return;
      }

      refreshData();
      setDialogOpen(false);
      setForm(emptyProductForm);
      setEditingId(null);
    } catch {
      alert(t("Bağlantı hatası", "Network error"));
    } finally {
      setSubmitting(false);
    }
  };

  const togglePublish = async (product: any) => {
    try {
      const res = await fetch(`/api/inventory/${product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !product.published }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || t("Güncellenemedi", "Failed to update"));
        return;
      }
      refreshData();
    } catch {
      alert(t("Bağlantı hatası", "Network error"));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/inventory/${deleteTarget._id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || t("Ürün silinemedi", "Failed to delete product"));
        return;
      }
      refreshData();
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch {
      alert(t("Bağlantı hatası", "Network error"));
    } finally {
      setDeleteLoading(false);
    }
  };

  const addImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    try {
      new URL(imageUrlInput);
    } catch {
      return;
    }
    const newImages = [...form.images, { url: imageUrlInput.trim(), alt: "", order: form.images.length }];
    updateForm("images", newImages);
    setImageUrlInput("");
  };

  const removeImage = (index: number) => {
    const newImages = form.images.filter((_, i) => i !== index).map((img, i) => ({ ...img, order: i }));
    updateForm("images", newImages);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="font-serif text-xl">{t("Envanter", "Inventory")}</h2>
        <Button variant="primary" size="sm" onClick={openAddDialog}><Plus size={16} className="mr-1" /> {t("Ürün Ekle", "Add Product")}</Button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Input placeholder={t("Ara...", "Search...")} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full sm:w-48" />
        <Select options={[{ value: "WATCH", label: t("Saatler", "Watches") }, { value: "HERMES", label: "Hermes" }]} placeholder={t("Tüm Kategoriler", "All Categories")} value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="w-full sm:w-40" />
        <Select options={[{ value: "AVAILABLE", label: t("Mevcut", "Available") }, { value: "RESERVED", label: t("Rezerve", "Reserved") }, { value: "SOLD", label: t("Satıldı", "Sold") }]} placeholder={t("Tüm Durumlar", "All Status")} value={availability} onChange={(e) => { setAvailability(e.target.value); setPage(1); }} className="w-full sm:w-40" />
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Görsel", "Image")}</TableHead>
                <TableHead>{t("Ürün", "Product")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("Kategori", "Category")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("Durum", "Condition")}</TableHead>
                <TableHead>{t("Fiyat", "Price")}</TableHead>
                <TableHead>{t("Stok Durumu", "Status")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("Yayın", "Published")}</TableHead>
                <TableHead className="text-right">{t("İşlemler", "Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product: any) => (
                <TableRow key={product._id}>
                  <TableCell>
                    {product.images?.[0] ? (
                      <img src={product.images[0].url} alt="" className="w-12 h-12 object-cover rounded-sm" />
                    ) : (
                      <div className="w-12 h-12 bg-slate rounded-sm" />
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{product.brand} {product.model}</span>
                    <br/><span className="text-xs text-mist">{product.reference}{product.year ? ` (${product.year})` : ""}</span>
                  </TableCell>
                  <TableCell className="text-xs text-mist hidden md:table-cell">{product.category}</TableCell>
                  <TableCell className="text-xs hidden md:table-cell">{tl(t, CONDITION_LABELS[product.condition]) || product.condition}</TableCell>
                  <TableCell>{product.priceOnRequest ? t("SOR", "POR") : product.price ? formatPrice(product.price, product.currency) : "-"}</TableCell>
                  <TableCell><StatusBadge status={product.availability} type="availability" /></TableCell>
                  <TableCell className="hidden md:table-cell">
                    <button
                      onClick={() => togglePublish(product)}
                      className={cn(
                        "inline-flex items-center gap-1 text-xs transition-colors",
                        product.published ? "text-green-400 hover:text-green-300" : "text-mist hover:text-brand-white"
                      )}
                    >
                      {product.published ? <><Eye size={12} /> {t("Yayında", "Published")}</> : <><EyeOff size={12} /> {t("Taslak", "Draft")}</>}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(product)}>
                        <Pencil size={14} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setDeleteTarget(product); setDeleteDialogOpen(true); }} className="text-red-400 hover:text-red-300">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {meta && <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />}
        </>
      )}

      {/* Add/Edit Product Dialog */}
      <Sheet open={dialogOpen} onClose={() => setDialogOpen(false)} title={editingId ? t("Ürün Düzenle", "Edit Product") : t("Ürün Ekle", "Add Product")}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Select label={t("Kategori", "Category")} options={CATEGORY_OPTIONS} value={form.category} onChange={(e) => updateForm("category", e.target.value)} />
            <Select label={t("Durum", "Condition")} options={CONDITION_OPTIONS} value={form.condition} onChange={(e) => updateForm("condition", e.target.value)} />
          </div>

          <Input label={t("Marka", "Brand")} value={form.brand} onChange={(e) => updateForm("brand", e.target.value)} error={formErrors.brand} placeholder={t("ör. Rolex", "e.g. Rolex")} />
          <Input label={t("Model", "Model")} value={form.model} onChange={(e) => updateForm("model", e.target.value)} error={formErrors.model} placeholder={t("ör. Submariner", "e.g. Submariner")} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Input label={t("Referans", "Reference")} value={form.reference} onChange={(e) => updateForm("reference", e.target.value)} placeholder={t("ör. 126610LN", "e.g. 126610LN")} />
            <Input label={t("Yıl", "Year")} type="number" value={form.year} onChange={(e) => updateForm("year", e.target.value)} placeholder={t("ör. 2024", "e.g. 2024")} />
          </div>

          <Input label={t("Başlık", "Title")} value={form.title} onChange={(e) => updateForm("title", e.target.value)} error={formErrors.title} placeholder={t("Ürünün görüntüleme başlığı", "Display title for the product")} />
          <Textarea label={t("Açıklama", "Description")} rows={3} value={form.description} onChange={(e) => updateForm("description", e.target.value)} placeholder={t("Ürün açıklaması...", "Product description...")} />

          {/* Price */}
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Input
                label={t("Fiyat", "Price")}
                type="number"
                value={form.price}
                onChange={(e) => updateForm("price", e.target.value)}
                disabled={form.priceOnRequest}
                error={formErrors.price}
              />
              <Select label={t("Para Birimi", "Currency")} options={CURRENCY_OPTIONS} value={form.currency} onChange={(e) => updateForm("currency", e.target.value)} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.priceOnRequest}
                onChange={(e) => updateForm("priceOnRequest", e.target.checked)}
                className="rounded border-slate bg-transparent"
              />
              <span className="text-xs text-mist">{t("Fiyat Sorunuz", "Price on Request")}</span>
            </label>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <label className="block text-xs font-medium tracking-wider uppercase text-mist">{t("Görseller", "Images")}</label>
            {form.images.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {form.images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img src={img.url} alt={img.alt} className="w-16 h-16 object-cover rounded-sm border border-slate" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder={t("Görsel URL yapıştırın...", "Paste image URL...")}
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImageUrl(); } }}
              />
              <Button variant="outline" size="sm" onClick={addImageUrl} type="button">
                <ImagePlus size={14} />
              </Button>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => updateForm("published", e.target.checked)}
                className="rounded border-slate bg-transparent"
              />
              <span className="text-xs text-mist">{t("Yayında", "Published")}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => updateForm("featured", e.target.checked)}
                className="rounded border-slate bg-transparent"
              />
              <span className="text-xs text-mist">{t("Öne Çıkan", "Featured")}</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate">
            <Button variant="ghost" size="sm" onClick={() => setDialogOpen(false)}>{t("Vazgeç", "Cancel")}</Button>
            <Button variant="primary" size="sm" loading={submitting} onClick={handleSubmit}>
              {editingId ? t("Değişiklikleri Kaydet", "Save Changes") : t("Ürün Ekle", "Add Product")}
            </Button>
          </div>
        </div>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} title={t("Ürünü Sil", "Delete Product")}>
        <div className="space-y-4">
          <p className="text-sm text-mist">
            {t(
              `${deleteTarget?.brand} ${deleteTarget?.model} ürününü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
              `Are you sure you want to delete ${deleteTarget?.brand} ${deleteTarget?.model}? This action cannot be undone.`
            )}
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setDeleteDialogOpen(false)}>{t("Vazgeç", "Cancel")}</Button>
            <Button variant="primary" size="sm" loading={deleteLoading} onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">
              {t("Sil", "Delete")}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
