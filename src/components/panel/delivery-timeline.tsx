"use client";

import { DELIVERY_STATUS_CONFIG, tl } from "@/lib/utils/constants";
import { formatDateTime } from "@/lib/utils/formatters";
import { useI18n } from "@/lib/i18n";

interface TimelineEntry {
  status: string;
  timestamp: string | Date;
  note?: string;
  userId?: { name?: string; email?: string } | string;
}

interface DeliveryTimelineProps {
  entries: TimelineEntry[];
}

export function DeliveryTimeline({ entries }: DeliveryTimelineProps) {
  const { t } = useI18n();

  if (!entries || entries.length === 0) {
    return <p className="text-sm text-mist">{t("Geçmiş yok", "No history")}</p>;
  }

  return (
    <div className="relative space-y-0">
      {entries.map((entry, i) => {
        const config = DELIVERY_STATUS_CONFIG[entry.status];
        const label = config ? tl(t, config.label) : entry.status;
        const colorClass = config?.color || "text-mist";
        const isLast = i === entries.length - 1;
        const userName = typeof entry.userId === "object"
          ? (entry.userId?.name || entry.userId?.email || "")
          : "";

        return (
          <div key={i} className="flex gap-3">
            {/* Dot + Line */}
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full border-2 shrink-0 ${
                isLast ? "bg-brand-gold border-brand-gold" : "bg-charcoal border-slate"
              }`} />
              {!isLast && <div className="w-px flex-1 bg-slate/40 min-h-[32px]" />}
            </div>

            {/* Content */}
            <div className="pb-4 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
                  {label}
                </span>
                <span className="text-[10px] text-mist">{formatDateTime(entry.timestamp)}</span>
              </div>
              {userName && (
                <p className="text-[10px] text-mist mt-0.5">{userName}</p>
              )}
              {entry.note && (
                <p className="text-xs text-brand-white/70 mt-1">{entry.note}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
