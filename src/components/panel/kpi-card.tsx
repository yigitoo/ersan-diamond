import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  className?: string;
}

export function KPICard({ title, value, subtitle, icon: Icon, trend, className }: KPICardProps) {
  return (
    <div className={cn("bg-charcoal border border-slate/50 rounded-sm p-6 relative", className)}>
      <Icon size={20} className="absolute top-6 right-6 text-mist/40" />
      <p className="text-xs font-medium tracking-wider uppercase text-mist mb-2">{title}</p>
      <p className="text-3xl font-serif">{value}</p>
      {subtitle && <p className="text-xs text-mist mt-1">{subtitle}</p>}
      {trend && (
        <p className={cn("text-xs mt-2", trend.positive ? "text-green-400" : "text-red-400")}>
          {trend.positive ? "\u2191" : "\u2193"} {Math.abs(trend.value)}%
        </p>
      )}
    </div>
  );
}
