"use client";

import { StatusBadge } from "@/components/shared/status-badge";
import { DELIVERY_TIME_SLOT_LABELS, tl } from "@/lib/utils/constants";
import { formatDate } from "@/lib/utils/formatters";
import { Calendar, Phone, User, Truck } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface DeliveryCardProps {
  delivery: any;
  onClick?: () => void;
}

export function DeliveryCard({ delivery, onClick }: DeliveryCardProps) {
  const { t } = useI18n();
  const product = delivery.productId;
  const courier = delivery.courierId;
  const productLabel = product
    ? `${product.brand || ""} ${product.model || ""}`.trim()
    : t("Ürün silinmiş", "Product removed");

  const timeSlotLabel = tl(t, DELIVERY_TIME_SLOT_LABELS[delivery.timeSlot]);

  return (
    <div
      onClick={onClick}
      className="border border-slate/30 rounded-sm p-4 bg-charcoal hover:bg-charcoal/80 transition-colors cursor-pointer space-y-3"
    >
      {/* Top: Product + badges */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{productLabel}</p>
          {product?.category && (
            <span className="text-[10px] text-mist uppercase tracking-wider">{product.category}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <StatusBadge status={delivery.priority} type="deliveryPriority" />
          <StatusBadge status={delivery.status} type="delivery" />
        </div>
      </div>

      {/* Recipient */}
      <div className="flex items-center gap-2 text-sm text-brand-white/80">
        <User size={14} className="text-mist shrink-0" />
        <span className="truncate">{delivery.recipientName}</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-mist">
        <Phone size={12} className="shrink-0" />
        <span>{delivery.recipientPhone}</span>
      </div>

      {/* Schedule */}
      <div className="flex items-center gap-2 text-xs text-mist">
        <Calendar size={12} className="shrink-0" />
        <span>{formatDate(delivery.scheduledDate)} &middot; {timeSlotLabel}</span>
      </div>

      {/* Courier */}
      <div className="flex items-center gap-2 text-xs">
        <Truck size={12} className="text-mist shrink-0" />
        {courier ? (
          <span className="text-brand-gold">{courier.name}</span>
        ) : (
          <span className="text-mist italic">{t("Atanmadı", "Unassigned")}</span>
        )}
      </div>

      {/* Delivery address */}
      {delivery.deliveryAddress && (
        <p className="text-[10px] text-mist/60 truncate">
          {delivery.deliveryAddress.district ? `${delivery.deliveryAddress.district}, ` : ""}
          {delivery.deliveryAddress.city}
        </p>
      )}
    </div>
  );
}
