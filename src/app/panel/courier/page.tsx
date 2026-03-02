"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSwrFetch } from "@/lib/hooks";
import { useSWRConfig } from "swr";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { DELIVERY_STATUS_CONFIG, DELIVERY_TIME_SLOT_LABELS, tl } from "@/lib/utils/constants";
import { formatDate } from "@/lib/utils/formatters";
import {
  Phone, MessageCircle, MapPin, AlertTriangle, Navigation, Package,
  User, Calendar, Clock,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function CourierPage() {
  const { mutate } = useSWRConfig();
  const { t } = useI18n();
  const [showCompleted, setShowCompleted] = useState(false);
  const [locationSharing, setLocationSharing] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const { data, isLoading, mutate: mutateDeliveries } = useSwrFetch<any>(
    `/api/logistics/courier?completed=${showCompleted}`
  );
  const deliveries = Array.isArray(data) ? data : (data as any)?.data || data || [];

  const refreshData = useCallback(() => {
    mutateDeliveries();
    mutate((key: string) => typeof key === "string" && key.startsWith("/api/logistics"), undefined, { revalidate: true });
  }, [mutateDeliveries, mutate]);

  /* --- Location sharing --- */
  const startLocationSharing = useCallback(() => {
    if (!navigator.geolocation) return;

    const sendLocation = (position: GeolocationPosition) => {
      const { latitude: lat, longitude: lng } = position.coords;
      // Send to all active deliveries
      for (const d of deliveries) {
        if (["ASSIGNED", "PICKED_UP", "IN_TRANSIT"].includes(d.status)) {
          fetch(`/api/logistics/${d._id}/location`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat, lng }),
          }).catch(() => {});
        }
      }
    };

    const id = navigator.geolocation.watchPosition(sendLocation, () => {}, {
      enableHighAccuracy: true,
      maximumAge: 30000,
    });
    watchIdRef.current = id;
  }, [deliveries]);

  const stopLocationSharing = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (locationSharing) {
      startLocationSharing();
    } else {
      stopLocationSharing();
    }
    return () => stopLocationSharing();
  }, [locationSharing, startLocationSharing, stopLocationSharing]);

  /* --- Status update --- */
  const handleStatusUpdate = async (deliveryId: string, newStatus: string) => {
    setUpdatingStatus(deliveryId);
    try {
      await fetch(`/api/logistics/${deliveryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      refreshData();
    } catch { /* ignore */ } finally {
      setUpdatingStatus(null);
    }
  };

  /* --- Courier notes update --- */
  const handleNotesUpdate = async (deliveryId: string, notes: string) => {
    try {
      await fetch(`/api/logistics/${deliveryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courierNotes: notes }),
      });
    } catch { /* ignore */ }
  };

  /* --- Next action button for each status --- */
  const getNextAction = (status: string): { label: string; nextStatus: string } | null => {
    switch (status) {
      case "ASSIGNED":
        return { label: t("Teslim Aldım", "Picked Up"), nextStatus: "PICKED_UP" };
      case "PICKED_UP":
        return { label: t("Yola Çıktım", "In Transit"), nextStatus: "IN_TRANSIT" };
      case "IN_TRANSIT":
        return { label: t("Teslim Ettim", "Delivered"), nextStatus: "DELIVERED" };
      default:
        return null;
    }
  };

  const todayDeliveries = deliveries.filter((d: any) => {
    const today = new Date();
    const scheduled = new Date(d.scheduledDate);
    return scheduled.toDateString() === today.toDateString();
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="font-serif text-xl">{t("Teslimatlarım", "My Deliveries")}</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocationSharing(!locationSharing)}
            className={`flex items-center gap-2 px-3 py-2 rounded-sm text-sm border transition-colors ${
              locationSharing
                ? "border-green-500/50 bg-green-500/10 text-green-400"
                : "border-slate text-mist hover:text-brand-white"
            }`}
          >
            <Navigation size={16} />
            {locationSharing ? t("Konum Aktif", "Location ON") : t("Konum Paylaş", "Share Location")}
          </button>
        </div>
      </div>

      {/* Today summary */}
      <div className="bg-charcoal border border-slate/30 rounded-sm p-4">
        <p className="text-sm text-mist">
          {t("Bugün", "Today")}: <span className="text-brand-white font-medium">{todayDeliveries.length}</span> {t("teslimat", "delivery(ies)")}
        </p>
      </div>

      {/* Show completed toggle */}
      <label className="flex items-center gap-2 text-xs text-mist cursor-pointer select-none">
        <input
          type="checkbox"
          checked={showCompleted}
          onChange={(e) => setShowCompleted(e.target.checked)}
          className="accent-brand-gold"
        />
        {t("Tamamlananları Göster", "Show Completed")}
      </label>

      {/* Delivery cards */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
        </div>
      ) : deliveries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-mist">
          <Package size={40} className="mb-3 opacity-50" />
          <p className="text-sm">{t("Atanmış teslimat yok", "No assigned deliveries")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deliveries.map((d: any) => {
            const product = d.productId;
            const productLabel = product
              ? `${product.brand || ""} ${product.model || ""}`.trim()
              : t("Ürün", "Product");
            const nextAction = getNextAction(d.status);
            const isUpdating = updatingStatus === d._id;
            const timeSlotLabel = tl(t, DELIVERY_TIME_SLOT_LABELS[d.timeSlot]);
            const phone = d.recipientPhone?.replace(/\s/g, "");

            return (
              <div key={d._id} className="border border-slate/30 rounded-sm bg-charcoal overflow-hidden">
                {/* Card header */}
                <div className="p-4 space-y-3">
                  {/* Priority + Status */}
                  <div className="flex items-center justify-between">
                    <StatusBadge status={d.priority} type="deliveryPriority" />
                    <StatusBadge status={d.status} type="delivery" />
                  </div>

                  {/* Product */}
                  <p className="text-sm font-medium">{productLabel}</p>

                  <hr className="border-slate/30" />

                  {/* Recipient */}
                  <div className="flex items-center gap-2 text-sm">
                    <User size={14} className="text-mist shrink-0" />
                    <span>{d.recipientName}</span>
                  </div>

                  {/* Address */}
                  <div className="flex items-center gap-2 text-sm text-brand-white/80">
                    <MapPin size={14} className="text-mist shrink-0" />
                    <span>
                      {d.deliveryAddress?.district && `${d.deliveryAddress.district}, `}
                      {d.deliveryAddress?.city}
                    </span>
                  </div>
                  {d.deliveryAddress?.street && (
                    <p className="text-xs text-mist ml-6">{d.deliveryAddress.street}</p>
                  )}

                  {/* Schedule */}
                  <div className="flex items-center gap-2 text-sm text-mist">
                    <Calendar size={14} className="shrink-0" />
                    <span>{formatDate(d.scheduledDate)}</span>
                    <Clock size={14} className="shrink-0 ml-2" />
                    <span>{timeSlotLabel}</span>
                  </div>

                  {/* Special instructions */}
                  {d.specialInstructions && (
                    <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-sm p-3 text-sm">
                      <AlertTriangle size={16} className="text-yellow-400 shrink-0 mt-0.5" />
                      <span className="text-yellow-200">{d.specialInstructions}</span>
                    </div>
                  )}

                  <hr className="border-slate/30" />

                  {/* Contact buttons */}
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${phone}`}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-slate rounded-sm text-mist hover:text-brand-white hover:border-brand-white/30 transition-colors"
                    >
                      <Phone size={14} />
                      {t("Ara", "Call")}
                    </a>
                    <a
                      href={`https://wa.me/${phone?.replace(/\+/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-slate rounded-sm text-mist hover:text-green-400 hover:border-green-400/30 transition-colors"
                    >
                      <MessageCircle size={14} />
                      WhatsApp
                    </a>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                        `${d.deliveryAddress?.street || ""} ${d.deliveryAddress?.district || ""} ${d.deliveryAddress?.city || ""}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-slate rounded-sm text-mist hover:text-blue-400 hover:border-blue-400/30 transition-colors"
                    >
                      <MapPin size={14} />
                      {t("Yol Tarifi", "Directions")}
                    </a>
                  </div>

                  <hr className="border-slate/30" />

                  {/* Status action */}
                  {nextAction && (
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full"
                      loading={isUpdating}
                      onClick={() => handleStatusUpdate(d._id, nextAction.nextStatus)}
                    >
                      {nextAction.label} →
                    </Button>
                  )}

                  {/* Courier notes */}
                  <Textarea
                    label={t("Kurye Notları", "Courier Notes")}
                    rows={2}
                    defaultValue={d.courierNotes || ""}
                    onBlur={(e) => {
                      if (e.target.value !== (d.courierNotes || "")) {
                        handleNotesUpdate(d._id, e.target.value);
                      }
                    }}
                    placeholder={t("Not ekle...", "Add note...")}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
