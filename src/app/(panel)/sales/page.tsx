"use client";

import { useState, useCallback } from "react";
import { useSwrPaginated, useSwrFetch } from "@/lib/hooks";
import { useSWRConfig } from "swr";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog } from "@/components/ui/dialog";
import { Sheet } from "@/components/ui/sheet";
import { Pagination } from "@/components/shared/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDateTime } from "@/lib/utils/formatters";
import { PAYMENT_METHOD_LABELS } from "@/lib/utils/constants";
import { Plus, Eye } from "lucide-react";

const PAYMENT_OPTIONS = [
  { value: "CASH", label: "Cash" },
  { value: "TRANSFER", label: "Bank Transfer" },
  { value: "CARD", label: "Credit Card" },
  { value: "CRYPTO", label: "Crypto" },
  { value: "OTHER", label: "Other" },
];

const CURRENCY_OPTIONS = [
  { value: "EUR", label: "EUR" },
  { value: "USD", label: "USD" },
  { value: "TRY", label: "TRY" },
  { value: "GBP", label: "GBP" },
];

const emptyForm = {
  productId: "",
  buyerName: "",
  buyerEmail: "",
  buyerPhone: "",
  buyerCity: "",
  buyerCountry: "",
  salePrice: "",
  currency: "EUR",
  paymentMethod: "CASH",
  soldAt: new Date().toISOString().slice(0, 16),
  notes: "",
};

export default function SalesPage() {
  const { mutate } = useSWRConfig();
  const [page, setPage] = useState(1);

  // Record Sale dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Detail sheet
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Product search for the dialog
  const [productSearch, setProductSearch] = useState("");
  const { data: productData } = useSwrFetch<any>(
    dialogOpen && productSearch.length >= 2
      ? `/api/products?search=${encodeURIComponent(productSearch)}&limit=10&availability=AVAILABLE`
      : null
  );
  const searchResults = (productData as any)?.data || productData || [];

  const { data, isLoading } = useSwrPaginated("/api/sales", { page, limit: 20 });
  const sales = (data as any)?.data || [];
  const meta = (data as any)?.meta;

  const refreshData = useCallback(() => {
    mutate((key: string) => typeof key === "string" && key.startsWith("/api/sales"), undefined, { revalidate: true });
  }, [mutate]);

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.productId) errors.productId = "Product is required";
    if (!form.buyerName.trim()) errors.buyerName = "Buyer name is required";
    if (!form.salePrice || isNaN(Number(form.salePrice)) || Number(form.salePrice) <= 0) errors.salePrice = "Valid price is required";
    if (!form.soldAt) errors.soldAt = "Date is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        salePrice: Number(form.salePrice),
        soldAt: new Date(form.soldAt).toISOString(),
      };
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to record sale");
        return;
      }
      refreshData();
      setDialogOpen(false);
      setForm(emptyForm);
      setProductSearch("");
    } catch {
      alert("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const openRecordSale = () => {
    setForm({ ...emptyForm, soldAt: new Date().toISOString().slice(0, 16) });
    setFormErrors({});
    setProductSearch("");
    setDialogOpen(true);
  };

  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const selectProduct = (product: any) => {
    setSelectedProduct(product);
    updateForm("productId", product._id);
    setProductSearch("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl">Sales</h2>
        <Button variant="primary" size="sm" onClick={openRecordSale}><Plus size={16} className="mr-1" /> Record Sale</Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Rep</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale: any) => (
                <TableRow key={sale._id} className="cursor-pointer hover:bg-charcoal/50" onClick={() => { setSelectedSale(sale); setSheetOpen(true); }}>
                  <TableCell className="font-medium">
                    {sale.productId?.brand} {sale.productId?.model}
                    <br/><span className="text-xs text-mist">{sale.productId?.reference}</span>
                  </TableCell>
                  <TableCell>
                    {sale.buyerName}
                    <br/><span className="text-xs text-mist">{sale.buyerEmail}</span>
                  </TableCell>
                  <TableCell className="font-medium">{formatPrice(sale.salePrice, sale.currency)}</TableCell>
                  <TableCell className="text-xs text-mist">{PAYMENT_METHOD_LABELS[sale.paymentMethod] || sale.paymentMethod}</TableCell>
                  <TableCell className="text-xs">{sale.salesRepId?.name || "-"}</TableCell>
                  <TableCell className="text-xs text-mist">{formatDateTime(sale.soldAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedSale(sale); setSheetOpen(true); }}>
                      <Eye size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {meta && <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />}
        </>
      )}

      {/* Record Sale Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Record Sale" className="max-w-xl">
        <div className="space-y-4">
          {/* Product selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium tracking-wider uppercase text-mist">Product</label>
            {selectedProduct && form.productId ? (
              <div className="flex items-center justify-between p-3 border border-slate rounded-sm">
                <div>
                  <p className="text-sm font-medium">{selectedProduct.brand} {selectedProduct.model}</p>
                  <p className="text-xs text-mist">{selectedProduct.reference}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setSelectedProduct(null); updateForm("productId", ""); }}>
                  Change
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Input
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  error={formErrors.productId}
                />
                {Array.isArray(searchResults) && searchResults.length > 0 && productSearch.length >= 2 && (
                  <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-charcoal border border-slate rounded-sm max-h-48 overflow-y-auto">
                    {searchResults.map((p: any) => (
                      <button
                        key={p._id}
                        type="button"
                        className="w-full text-left px-4 py-2 text-sm hover:bg-slate transition-colors"
                        onClick={() => selectProduct(p)}
                      >
                        <span className="font-medium">{p.brand} {p.model}</span>
                        <span className="text-mist ml-2">{p.reference}</span>
                        {p.price && <span className="float-right text-mist">{formatPrice(p.price, p.currency)}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Buyer Info */}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Buyer Name" value={form.buyerName} onChange={(e) => updateForm("buyerName", e.target.value)} error={formErrors.buyerName} />
            <Input label="Buyer Email" type="email" value={form.buyerEmail} onChange={(e) => updateForm("buyerEmail", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Buyer Phone" value={form.buyerPhone} onChange={(e) => updateForm("buyerPhone", e.target.value)} />
            <Input label="City" value={form.buyerCity} onChange={(e) => updateForm("buyerCity", e.target.value)} />
          </div>
          <Input label="Country" value={form.buyerCountry} onChange={(e) => updateForm("buyerCountry", e.target.value)} />

          {/* Price & Payment */}
          <div className="grid grid-cols-3 gap-4">
            <Input label="Sale Price" type="number" value={form.salePrice} onChange={(e) => updateForm("salePrice", e.target.value)} error={formErrors.salePrice} />
            <Select label="Currency" options={CURRENCY_OPTIONS} value={form.currency} onChange={(e) => updateForm("currency", e.target.value)} />
            <Select label="Payment Method" options={PAYMENT_OPTIONS} value={form.paymentMethod} onChange={(e) => updateForm("paymentMethod", e.target.value)} />
          </div>

          <Input label="Sale Date" type="datetime-local" value={form.soldAt} onChange={(e) => updateForm("soldAt", e.target.value)} error={formErrors.soldAt} />

          <Textarea label="Notes" rows={3} value={form.notes} onChange={(e) => updateForm("notes", e.target.value)} placeholder="Optional notes..." />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="gold" size="sm" loading={submitting} onClick={handleSubmit}>
              Record Sale
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Sale Detail Sheet */}
      <Sheet open={sheetOpen} onClose={() => { setSheetOpen(false); setSelectedSale(null); }} title="Sale Details">
        {selectedSale ? (
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-xs font-medium tracking-wider uppercase text-mist">Product</h3>
              <div className="space-y-1">
                <p className="font-medium">{selectedSale.productId?.brand} {selectedSale.productId?.model}</p>
                <p className="text-sm text-mist">{selectedSale.productId?.reference}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-medium tracking-wider uppercase text-mist">Buyer</h3>
              <div className="space-y-1">
                <p className="font-medium">{selectedSale.buyerName}</p>
                {selectedSale.buyerEmail && <p className="text-sm text-mist">{selectedSale.buyerEmail}</p>}
                {selectedSale.buyerPhone && <p className="text-sm text-mist">{selectedSale.buyerPhone}</p>}
                {(selectedSale.buyerCity || selectedSale.buyerCountry) && (
                  <p className="text-sm text-mist">{[selectedSale.buyerCity, selectedSale.buyerCountry].filter(Boolean).join(", ")}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-medium tracking-wider uppercase text-mist">Transaction</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-mist">Price</span>
                  <p className="font-medium text-lg">{formatPrice(selectedSale.salePrice, selectedSale.currency)}</p>
                </div>
                <div>
                  <span className="text-mist">Payment</span>
                  <p>{PAYMENT_METHOD_LABELS[selectedSale.paymentMethod] || selectedSale.paymentMethod}</p>
                </div>
                <div>
                  <span className="text-mist">Date</span>
                  <p>{formatDateTime(selectedSale.soldAt)}</p>
                </div>
                <div>
                  <span className="text-mist">Sales Rep</span>
                  <p>{selectedSale.salesRepId?.name || "-"}</p>
                </div>
              </div>
            </div>

            {selectedSale.notes && (
              <div className="space-y-2">
                <h3 className="text-xs font-medium tracking-wider uppercase text-mist">Notes</h3>
                <p className="text-sm text-mist">{selectedSale.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-20" />
          </div>
        )}
      </Sheet>
    </div>
  );
}
