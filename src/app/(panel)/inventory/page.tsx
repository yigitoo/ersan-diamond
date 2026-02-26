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
import { CONDITION_LABELS } from "@/lib/utils/constants";
import { cn } from "@/lib/utils/cn";
import { Plus, Pencil, Trash2, Eye, EyeOff, ImagePlus } from "lucide-react";

const CATEGORY_OPTIONS = [
  { value: "WATCH", label: "Watch" },
  { value: "HERMES", label: "Hermes" },
];

const CONDITION_OPTIONS = [
  { value: "UNWORN", label: "Unworn" },
  { value: "EXCELLENT", label: "Excellent" },
  { value: "VERY_GOOD", label: "Very Good" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
];

const CURRENCY_OPTIONS = [
  { value: "EUR", label: "EUR" },
  { value: "USD", label: "USD" },
  { value: "TRY", label: "TRY" },
  { value: "GBP", label: "GBP" },
];

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
    if (!form.brand.trim()) errors.brand = "Brand is required";
    if (!form.model.trim()) errors.model = "Model is required";
    if (!form.title.trim()) errors.title = "Title is required";
    if (!form.priceOnRequest && form.price && (isNaN(Number(form.price)) || Number(form.price) < 0)) {
      errors.price = "Valid price is required";
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
        alert(err.error || "Failed to save product");
        return;
      }

      refreshData();
      setDialogOpen(false);
      setForm(emptyProductForm);
      setEditingId(null);
    } catch {
      alert("Network error");
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
        alert(err.error || "Failed to update");
        return;
      }
      refreshData();
    } catch {
      alert("Network error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/inventory/${deleteTarget._id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to delete product");
        return;
      }
      refreshData();
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch {
      alert("Network error");
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="font-serif text-xl">Inventory</h2>
        <Button variant="primary" size="sm" onClick={openAddDialog}><Plus size={16} className="mr-1" /> Add Product</Button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Input placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-48" />
        <Select options={[{ value: "WATCH", label: "Watches" }, { value: "HERMES", label: "Hermes" }]} placeholder="All Categories" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="w-40" />
        <Select options={[{ value: "AVAILABLE", label: "Available" }, { value: "RESERVED", label: "Reserved" }, { value: "SOLD", label: "Sold" }]} placeholder="All Status" value={availability} onChange={(e) => { setAvailability(e.target.value); setPage(1); }} className="w-40" />
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                  <TableCell className="text-xs text-mist">{product.category}</TableCell>
                  <TableCell className="text-xs">{CONDITION_LABELS[product.condition] || product.condition}</TableCell>
                  <TableCell>{product.priceOnRequest ? "POR" : product.price ? formatPrice(product.price, product.currency) : "-"}</TableCell>
                  <TableCell><StatusBadge status={product.availability} type="availability" /></TableCell>
                  <TableCell>
                    <button
                      onClick={() => togglePublish(product)}
                      className={cn(
                        "inline-flex items-center gap-1 text-xs transition-colors",
                        product.published ? "text-green-400 hover:text-green-300" : "text-mist hover:text-brand-white"
                      )}
                    >
                      {product.published ? <><Eye size={12} /> Published</> : <><EyeOff size={12} /> Draft</>}
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
      <Sheet open={dialogOpen} onClose={() => setDialogOpen(false)} title={editingId ? "Edit Product" : "Add Product"}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select label="Category" options={CATEGORY_OPTIONS} value={form.category} onChange={(e) => updateForm("category", e.target.value)} />
            <Select label="Condition" options={CONDITION_OPTIONS} value={form.condition} onChange={(e) => updateForm("condition", e.target.value)} />
          </div>

          <Input label="Brand" value={form.brand} onChange={(e) => updateForm("brand", e.target.value)} error={formErrors.brand} placeholder="e.g. Rolex" />
          <Input label="Model" value={form.model} onChange={(e) => updateForm("model", e.target.value)} error={formErrors.model} placeholder="e.g. Submariner" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Reference" value={form.reference} onChange={(e) => updateForm("reference", e.target.value)} placeholder="e.g. 126610LN" />
            <Input label="Year" type="number" value={form.year} onChange={(e) => updateForm("year", e.target.value)} placeholder="e.g. 2024" />
          </div>

          <Input label="Title" value={form.title} onChange={(e) => updateForm("title", e.target.value)} error={formErrors.title} placeholder="Display title for the product" />
          <Textarea label="Description" rows={3} value={form.description} onChange={(e) => updateForm("description", e.target.value)} placeholder="Product description..." />

          {/* Price */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price"
                type="number"
                value={form.price}
                onChange={(e) => updateForm("price", e.target.value)}
                disabled={form.priceOnRequest}
                error={formErrors.price}
              />
              <Select label="Currency" options={CURRENCY_OPTIONS} value={form.currency} onChange={(e) => updateForm("currency", e.target.value)} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.priceOnRequest}
                onChange={(e) => updateForm("priceOnRequest", e.target.checked)}
                className="rounded border-slate bg-transparent"
              />
              <span className="text-xs text-mist">Price on Request</span>
            </label>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <label className="block text-xs font-medium tracking-wider uppercase text-mist">Images</label>
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
                placeholder="Paste image URL..."
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
              <span className="text-xs text-mist">Published</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => updateForm("featured", e.target.checked)}
                className="rounded border-slate bg-transparent"
              />
              <span className="text-xs text-mist">Featured</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate">
            <Button variant="ghost" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" loading={submitting} onClick={handleSubmit}>
              {editingId ? "Save Changes" : "Add Product"}
            </Button>
          </div>
        </div>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} title="Delete Product">
        <div className="space-y-4">
          <p className="text-sm text-mist">
            Are you sure you want to delete <span className="text-brand-white font-medium">{deleteTarget?.brand} {deleteTarget?.model}</span>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" loading={deleteLoading} onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">
              Delete
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
