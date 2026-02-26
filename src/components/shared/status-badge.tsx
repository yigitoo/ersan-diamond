import { Badge } from "@/components/ui/badge";
import { APPOINTMENT_STATUS_CONFIG, LEAD_STATUS_CONFIG, AVAILABILITY_LABELS } from "@/lib/utils/constants";
import { cn } from "@/lib/utils/cn";

interface StatusBadgeProps {
  status: string;
  type: "appointment" | "lead" | "availability";
  className?: string;
}

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  let config: { label: string; color: string } | undefined;

  if (type === "appointment") {
    config = APPOINTMENT_STATUS_CONFIG[status];
  } else if (type === "lead") {
    config = LEAD_STATUS_CONFIG[status];
  } else if (type === "availability") {
    const colors: Record<string, string> = {
      AVAILABLE: "bg-green-500/20 text-green-400",
      RESERVED: "bg-yellow-500/20 text-yellow-400",
      SOLD: "bg-red-500/20 text-red-400",
    };
    config = { label: AVAILABILITY_LABELS[status] || status, color: colors[status] || "" };
  }

  if (!config) return <Badge className={className}>{status}</Badge>;

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide", config.color, className)}>
      {config.label}
    </span>
  );
}
