"use client";

import { useState, useCallback } from "react";
import { useSwrPaginated, useSwrFetch } from "@/lib/hooks";
import { useSWRConfig } from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs } from "@/components/ui/tabs";
import { Dialog } from "@/components/ui/dialog";
import { Sheet } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/shared/pagination";
import { DeliveryCard } from "@/components/panel/delivery-card";
import { DeliveryTimeline } from "@/components/panel/delivery-timeline";
import { CourierOverview } from "@/components/panel/courier-overview";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  DELIVERY_STATUS_CONFIG, DELIVERY_PRIORITY_CONFIG, DELIVERY_TIME_SLOT_LABELS,
  DEFAULT_PICKUP_ADDRESS, tl,
} from "@/lib/utils/constants";
import { formatDate, formatDateTime } from "@/lib/utils/formatters";
import { Plus, Search, Truck, Package, Calendar, User, Phone, MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function LogisticsPage() {
  const { mutate } = useSWRConfig();
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  // Create dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    productId: "",
    recipientName: "",
    recipientPhone: "",
    recipientEmail: "",
    scheduledDate: "",
    timeSlot: "FLEXIBLE",
    priority: "NORMAL",
    courierId: "",
    deliveryStreet: "",
    deliveryDistrict: "",
    deliveryCity: "İstanbul",
    deliveryCountry: "Türkiye",
    deliveryNotes: "",
    specialInstructions: "",
    adminNotes: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Product search for create dialog
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { data: productData } = useSwrFetch<any>(
    dialogOpen && productSearch.length >= 2
      ? `/api/products?search=${encodeURIComponent(productSearch)}&limit=10`
      : null
  );
  const searchResults = (productData as any)?.data || productData || [];

  // Detail sheet
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { data: deliveryDetail, mutate: mutateDetail } = useSwrFetch<any>(
    selectedDeliveryId ? `/api/logistics/${selectedDeliveryId}` : null
  );

  // Status change
  const [statusChanging, setStatusChanging] = useState(false);
  const [assignCourier, setAssignCourier] = useState("");

  // Data
  const params: Record<string, string | number | undefined> = {
    page,
    limit: 12,
    search: search || undefined,
    status: statusFilter || undefined,
  };
  const { data, isLoading } = useSwrPaginated("/api/logistics", params);
  const deliveries = (data as any)?.data || [];
  const meta = (data as any)?.meta;

  // Stats
  const { data: stats } = useSwrFetch<any>("/api/logistics/stats");

  // Team (for courier assignment)
  const { data: teamData } = useSwrFetch<any>("/api/team");
  const teamMembers = (teamData as any)?.data || teamData || [];
  const courierOptions = Array.isArray(teamMembers)
    ? teamMembers.map((m: any) => ({ value: m._id, label: m.name }))
    : [];

  const refreshData = useCallback(() => {
    mutate((key: string) => typeof key === "string" && key.startsWith("/api/logistics"), undefined, { revalidate: true });
  }, [mutate]);

  /* --- Status tabs --- */
  const statusTabs = [
    { value: "", label: t("Tümü", "All") },
    { value: "PENDING", label: t("Beklemede", "Pending") },
    { value: "ASSIGNED", label: t("Atandı", "Assigned") },
    { value: "IN_TRANSIT", label: t("Yolda", "In Transit") },
    { value: "DELIVERED", label: t("Teslim", "Delivered") },
    { value: "CANCELLED", label: t("İptal", "Cancelled") },
  ];

  /* --- Form helpers --- */
  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.productId) errors.productId = t("Ürün gerekli", "Product is required");
    if (!form.recipientName.trim()) errors.recipientName = t("Alıcı adı gerekli", "Recipient name is required");
    if (!form.recipientPhone.trim()) errors.recipientPhone = t("Telefon gerekli", "Phone is required");
    if (!form.scheduledDate) errors.scheduledDate = t("Tarih gerekli", "Date is required");
    if (!form.deliveryCity.trim()) errors.deliveryCity = t("Şehir gerekli", "City is required");
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/logistics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: form.productId,
          recipientName: form.recipientName,
          recipientPhone: form.recipientPhone,
          recipientEmail: form.recipientEmail || undefined,
          scheduledDate: form.scheduledDate,
          timeSlot: form.timeSlot,
          priority: form.priority,
          courierId: form.courierId || undefined,
          pickupAddress: DEFAULT_PICKUP_ADDRESS,
          deliveryAddress: {
            label: form.recipientName,
            street: form.deliveryStreet,
            district: form.deliveryDistrict,
            city: form.deliveryCity,
            country: form.deliveryCountry,
            notes: form.deliveryNotes,
          },
          specialInstructions: form.specialInstructions,
          adminNotes: form.adminNotes,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || t("Teslimat oluşturulamadı", "Failed to create delivery"));
        return;
      }
      refreshData();
      setDialogOpen(false);
      resetForm();
    } catch {
      alert(t("Bağlantı hatası", "Network error"));
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      productId: "", recipientName: "", recipientPhone: "", recipientEmail: "",
      scheduledDate: "", timeSlot: "FLEXIBLE", priority: "NORMAL", courierId: "",
      deliveryStreet: "", deliveryDistrict: "", deliveryCity: "İstanbul", deliveryCountry: "Türkiye",
      deliveryNotes: "", specialInstructions: "", adminNotes: "",
    });
    setFormErrors({});
    setProductSearch("");
    setSelectedProduct(null);
  };

  const openDetail = (id: string) => {
    setSelectedDeliveryId(id);
    setSheetOpen(true);
  };

  /* --- Status update from detail sheet --- */
  const handleStatusChange = async (newStatus: string, note?: string) => {
    if (!selectedDeliveryId) return;
    setStatusChanging(true);
    try {
      await fetch(`/api/logistics/${selectedDeliveryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, statusNote: note }),
      });
      mutateDetail();
      refreshData();
    } catch { /* ignore */ } finally {
      setStatusChanging(false);
    }
  };

  const handleAssignCourier = async () => {
    if (!selectedDeliveryId || !assignCourier) return;
    setStatusChanging(true);
    try {
      await fetch(`/api/logistics/${selectedDeliveryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courierId: assignCourier }),
      });
      mutateDetail();
      refreshData();
      setAssignCourier("");
    } catch { /* ignore */ } finally {
      setStatusChanging(false);
    }
  };

  /* --- Next valid status transitions for detail sheet --- */
  const VALID_TRANSITIONS: Record<string, string[]> = {
    PENDING: ["ASSIGNED", "CANCELLED"],
    ASSIGNED: ["PICKED_UP", "CANCELLED"],
    PICKED_UP: ["IN_TRANSIT", "CANCELLED"],
    IN_TRANSIT: ["DELIVERED", "CANCELLED"],
    DELIVERED: [],
    CANCELLED: [],
  };

  const dd = deliveryDetail as any;

  /* ================================= RENDER ================================= */

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="font-serif text-xl">{t("Lojistik", "Logistics")}</h2>
        <Button variant="primary" size="sm" onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus size={16} className="mr-1" /> {t("Yeni Teslimat", "New Delivery")}
        </Button>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label={t("Toplam", "Total")} value={stats.total || 0} icon={Package} />
          <StatCard label={t("Yolda", "In Transit")} value={stats.byStatus?.IN_TRANSIT || 0} icon={Truck} color="text-purple-400" />
          <StatCard label={t("Bugün", "Today")} value={stats.today || 0} icon={Calendar} color="text-blue-400" />
          <StatCard label={t("Beklemede", "Pending")} value={stats.byStatus?.PENDING || 0} icon={Package} color="text-yellow-400" />
        </div>
      )}

      {/* Courier Overview */}
      {stats?.activeCouriers && stats.activeCouriers.length > 0 && (
        <div className="border border-slate/30 rounded-sm p-4">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Truck size={16} className="text-brand-gold" />
            {t("Kurye Durumu", "Courier Overview")}
          </h3>
          <CourierOverview couriers={stats.activeCouriers} deliveries={deliveries} />
        </div>
      )}

      {/* Status tabs + search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="overflow-x-auto w-full sm:w-auto">
          <Tabs
            tabs={statusTabs}
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(1); }}
          />
        </div>
        <div className="relative flex-1 max-w-xs ml-auto">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mist" />
          <input
            placeholder={t("Ara...", "Search...")}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-charcoal border border-slate rounded-sm pl-10 pr-4 py-2 text-sm text-brand-white placeholder:text-mist/50 focus:outline-none focus:border-brand-white/40 transition-colors"
          />
        </div>
      </div>

      {/* Delivery grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : deliveries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-mist">
          <Truck size={40} className="mb-3 opacity-50" />
          <p className="text-sm">{t("Teslimat bulunamadı", "No deliveries found")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {deliveries.map((d: any) => (
            <DeliveryCard key={d._id} delivery={d} onClick={() => openDetail(d._id)} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />
      )}

      {/* ---- Detail Sheet ---- */}
      <Sheet
        open={sheetOpen}
        onClose={() => { setSheetOpen(false); setSelectedDeliveryId(null); }}
        title={t("Teslimat Detayı", "Delivery Detail")}
      >
        {dd ? (
          <div className="space-y-6">
            {/* Product info */}
            <div>
              <p className="text-xs text-mist uppercase tracking-wider mb-1">{t("Ürün", "Product")}</p>
              <p className="text-sm font-medium">
                {dd.productId ? `${dd.productId.brand || ""} ${dd.productId.model || ""}`.trim() : "-"}
              </p>
            </div>

            {/* Status + Priority */}
            <div className="flex items-center gap-2">
              <StatusBadge status={dd.status} type="delivery" />
              <StatusBadge status={dd.priority} type="deliveryPriority" />
            </div>

            {/* Recipient */}
            <div className="space-y-1">
              <p className="text-xs text-mist uppercase tracking-wider">{t("Alıcı", "Recipient")}</p>
              <p className="text-sm flex items-center gap-2"><User size={14} className="text-mist" /> {dd.recipientName}</p>
              <p className="text-sm flex items-center gap-2"><Phone size={14} className="text-mist" /> {dd.recipientPhone}</p>
            </div>

            {/* Delivery address */}
            <div className="space-y-1">
              <p className="text-xs text-mist uppercase tracking-wider">{t("Teslimat Adresi", "Delivery Address")}</p>
              <p className="text-sm flex items-center gap-2">
                <MapPin size={14} className="text-mist shrink-0" />
                <span>
                  {dd.deliveryAddress?.street && `${dd.deliveryAddress.street}, `}
                  {dd.deliveryAddress?.district && `${dd.deliveryAddress.district}, `}
                  {dd.deliveryAddress?.city}
                </span>
              </p>
              {dd.deliveryAddress?.notes && (
                <p className="text-xs text-mist ml-6">{dd.deliveryAddress.notes}</p>
              )}
            </div>

            {/* Schedule */}
            <div className="space-y-1">
              <p className="text-xs text-mist uppercase tracking-wider">{t("Program", "Schedule")}</p>
              <p className="text-sm">{formatDate(dd.scheduledDate)} &middot; {tl(t, DELIVERY_TIME_SLOT_LABELS[dd.timeSlot])}</p>
            </div>

            {/* Courier */}
            <div className="space-y-1">
              <p className="text-xs text-mist uppercase tracking-wider">{t("Kurye", "Courier")}</p>
              {dd.courierId ? (
                <p className="text-sm text-brand-gold">{dd.courierId.name}</p>
              ) : (
                <p className="text-sm text-mist italic">{t("Atanmadı", "Unassigned")}</p>
              )}
            </div>

            {/* Assign courier */}
            {dd.status !== "DELIVERED" && dd.status !== "CANCELLED" && (
              <div className="flex items-end gap-2">
                <Select
                  label={t("Kurye Ata", "Assign Courier")}
                  options={courierOptions}
                  placeholder={t("Seç...", "Select...")}
                  value={assignCourier}
                  onChange={(e) => setAssignCourier(e.target.value)}
                  className="flex-1"
                />
                <Button variant="primary" size="sm" onClick={handleAssignCourier} disabled={!assignCourier || statusChanging}>
                  {t("Ata", "Assign")}
                </Button>
              </div>
            )}

            {/* Status actions */}
            {(VALID_TRANSITIONS[dd.status] || []).length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-mist uppercase tracking-wider">{t("Durum Güncelle", "Update Status")}</p>
                <div className="flex flex-wrap gap-2">
                  {(VALID_TRANSITIONS[dd.status] || []).map((nextStatus) => {
                    const config = DELIVERY_STATUS_CONFIG[nextStatus];
                    return (
                      <button
                        key={nextStatus}
                        onClick={() => handleStatusChange(nextStatus)}
                        disabled={statusChanging}
                        className={`px-3 py-1.5 rounded-sm text-xs font-medium border border-slate hover:border-brand-white/30 transition-colors disabled:opacity-50 ${config?.color || ""}`}
                      >
                        {config ? tl(t, config.label) : nextStatus}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Notes */}
            {dd.specialInstructions && (
              <div className="space-y-1">
                <p className="text-xs text-mist uppercase tracking-wider">{t("Özel Talimatlar", "Special Instructions")}</p>
                <p className="text-sm text-brand-white/80">{dd.specialInstructions}</p>
              </div>
            )}
            {dd.adminNotes && (
              <div className="space-y-1">
                <p className="text-xs text-mist uppercase tracking-wider">{t("Admin Notları", "Admin Notes")}</p>
                <p className="text-sm text-brand-white/80">{dd.adminNotes}</p>
              </div>
            )}

            {/* Timeline */}
            <div>
              <p className="text-xs text-mist uppercase tracking-wider mb-3">{t("Durum Geçmişi", "Status History")}</p>
              <DeliveryTimeline entries={dd.statusHistory || []} />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-40" />
          </div>
        )}
      </Sheet>

      {/* ---- Create Dialog ---- */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={t("Yeni Teslimat", "New Delivery")} className="max-w-xl">
        <div className="space-y-4">
          {/* Product search */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium tracking-wider uppercase text-mist">{t("Ürün", "Product")}</label>
            {selectedProduct ? (
              <div className="flex items-center justify-between bg-charcoal border border-slate rounded-sm p-3">
                <span className="text-sm">{selectedProduct.brand} {selectedProduct.model}</span>
                <button onClick={() => { setSelectedProduct(null); updateForm("productId", ""); }} className="text-mist hover:text-brand-white text-xs">
                  {t("Değiştir", "Change")}
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  placeholder={t("Ürün ara...", "Search product...")}
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full bg-transparent border-b border-slate px-0 py-3 text-brand-white focus:border-brand-white focus:outline-none transition-colors"
                />
                {Array.isArray(searchResults) && searchResults.length > 0 && productSearch.length >= 2 && (
                  <div className="absolute top-full left-0 right-0 bg-charcoal border border-slate rounded-sm mt-1 max-h-48 overflow-y-auto z-10">
                    {searchResults.map((p: any) => (
                      <button
                        key={p._id}
                        onClick={() => {
                          setSelectedProduct(p);
                          updateForm("productId", p._id);
                          setProductSearch("");
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate/30 transition-colors"
                      >
                        {p.brand} {p.model}
                        <span className="text-xs text-mist ml-2">{p.category}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {formErrors.productId && <p className="text-xs text-red-400">{formErrors.productId}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label={t("Alıcı Adı", "Recipient Name")} value={form.recipientName} onChange={(e) => updateForm("recipientName", e.target.value)} error={formErrors.recipientName} />
            <Input label={t("Telefon", "Phone")} value={form.recipientPhone} onChange={(e) => updateForm("recipientPhone", e.target.value)} error={formErrors.recipientPhone} />
          </div>

          <Input label={t("E-posta (Opsiyonel)", "Email (Optional)")} type="email" value={form.recipientEmail} onChange={(e) => updateForm("recipientEmail", e.target.value)} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label={t("Tarih", "Date")} type="date" value={form.scheduledDate} onChange={(e) => updateForm("scheduledDate", e.target.value)} error={formErrors.scheduledDate} />
            <Select
              label={t("Zaman Dilimi", "Time Slot")}
              options={Object.entries(DELIVERY_TIME_SLOT_LABELS).map(([v, l]) => ({ value: v, label: tl(t, l) }))}
              value={form.timeSlot}
              onChange={(e) => updateForm("timeSlot", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label={t("Öncelik", "Priority")}
              options={Object.entries(DELIVERY_PRIORITY_CONFIG).map(([v, c]) => ({ value: v, label: tl(t, c.label) }))}
              value={form.priority}
              onChange={(e) => updateForm("priority", e.target.value)}
            />
            <Select
              label={t("Kurye", "Courier")}
              options={courierOptions}
              placeholder={t("Sonra Ata", "Assign Later")}
              value={form.courierId}
              onChange={(e) => updateForm("courierId", e.target.value)}
            />
          </div>

          {/* Delivery address */}
          <p className="text-xs font-medium tracking-wider uppercase text-mist pt-2">{t("Teslimat Adresi", "Delivery Address")}</p>
          <Input label={t("Sokak/Cadde", "Street")} value={form.deliveryStreet} onChange={(e) => updateForm("deliveryStreet", e.target.value)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label={t("İlçe", "District")} value={form.deliveryDistrict} onChange={(e) => updateForm("deliveryDistrict", e.target.value)} />
            <Input label={t("Şehir", "City")} value={form.deliveryCity} onChange={(e) => updateForm("deliveryCity", e.target.value)} error={formErrors.deliveryCity} />
          </div>

          <Textarea label={t("Özel Talimatlar", "Special Instructions")} rows={2} value={form.specialInstructions} onChange={(e) => updateForm("specialInstructions", e.target.value)} />
          <Textarea label={t("Admin Notları", "Admin Notes")} rows={2} value={form.adminNotes} onChange={(e) => updateForm("adminNotes", e.target.value)} />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setDialogOpen(false)}>{t("Vazgeç", "Cancel")}</Button>
            <Button variant="primary" size="sm" loading={submitting} onClick={handleCreate}>
              <Plus size={14} className="mr-1" /> {t("Oluştur", "Create")}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

/* --- Stat card sub-component --- */
function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color?: string }) {
  return (
    <div className="border border-slate/30 rounded-sm p-4 bg-charcoal">
      <div className="flex items-center justify-between mb-2">
        <Icon size={18} className={color || "text-mist"} />
        <span className="text-2xl font-semibold">{value}</span>
      </div>
      <p className="text-xs text-mist">{label}</p>
    </div>
  );
}
