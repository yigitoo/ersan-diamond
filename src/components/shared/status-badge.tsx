"use client";

import { Badge } from "@/components/ui/badge";
import { APPOINTMENT_STATUS_CONFIG, LEAD_STATUS_CONFIG, AVAILABILITY_LABELS, tl } from "@/lib/utils/constants";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/lib/i18n";

interface StatusBadgeProps {
  status: string;
  type: "appointment" | "lead" | "availability";
  className?: string;
}

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  const { t } = useI18n();
  let label: string = status;
  let color = "";

  if (type === "appointment") {
    const config = APPOINTMENT_STATUS_CONFIG[status];
    if (config) {
      label = tl(t, config.label);
      color = config.color;
    }
  } else if (type === "lead") {
    const config = LEAD_STATUS_CONFIG[status];
    if (config) {
      label = tl(t, config.label);
      color = config.color;
    }
  } else if (type === "availability") {
    const colors: Record<string, string> = {
      AVAILABLE: "bg-green-500/20 text-green-400",
      RESERVED: "bg-yellow-500/20 text-yellow-400",
      SOLD: "bg-red-500/20 text-red-400",
    };
    label = tl(t, AVAILABILITY_LABELS[status]) || status;
    color = colors[status] || "";
  }

  if (!color) return <Badge className={className}>{label}</Badge>;

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide", color, className)}>
      {label}
    </span>
  );
}
