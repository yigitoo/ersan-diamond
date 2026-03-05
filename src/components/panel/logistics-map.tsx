"use client";

import dynamic from "next/dynamic";
import type { RouteResult } from "@/types";

interface Courier {
  _id: string;
  name: string;
  activeCount: number;
  lat?: number;
  lng?: number;
}

export interface LogisticsMapProps {
  deliveries: any[];
  couriers: Courier[];
  route?: RouteResult | null;
  onDeliveryClick?: (id: string) => void;
  onCourierClick?: (id: string) => void;
  height?: string;
}

// Dynamic import the entire map inner component to avoid SSR + appendChild issues
const LogisticsMapInner = dynamic(() => import("@/components/panel/logistics-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-charcoal flex items-center justify-center text-mist text-sm">
      Harita yükleniyor...
    </div>
  ),
});

export function LogisticsMap(props: LogisticsMapProps) {
  return (
    <div className="relative z-0 isolate" style={{ height: props.height || "100%" }}>
      <LogisticsMapInner {...props} />
    </div>
  );
}
