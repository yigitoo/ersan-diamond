"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useI18n } from "@/lib/i18n";
import { Truck } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Dynamically import Leaflet components (no SSR)
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);

interface ActiveCourier {
  _id: string;
  name: string;
  email: string;
  activeCount: number;
  location?: { lat: number; lng: number; updatedAt: string };
}

interface CourierOverviewProps {
  couriers: ActiveCourier[];
  deliveries?: any[];
}

export function CourierOverview({ couriers, deliveries = [] }: CourierOverviewProps) {
  const { t } = useI18n();

  // Find courier locations from active deliveries
  const courierLocations = useMemo(() => {
    const locationMap: Record<string, { lat: number; lng: number; updatedAt: string; productInfo: string }> = {};
    for (const d of deliveries) {
      if (d.courierId?._id && d.courierLocation) {
        locationMap[d.courierId._id] = {
          lat: d.courierLocation.lat,
          lng: d.courierLocation.lng,
          updatedAt: d.courierLocation.updatedAt,
          productInfo: d.productId ? `${d.productId.brand || ""} ${d.productId.model || ""}`.trim() : "",
        };
      }
    }
    return locationMap;
  }, [deliveries]);

  const hasLocations = Object.keys(courierLocations).length > 0;

  return (
    <div className="space-y-4">
      {/* Map - only show if there are courier locations */}
      {hasLocations && (
        <div className="border border-slate/30 rounded-sm overflow-hidden" style={{ height: 300 }}>
          <MapContainer
            center={[41.0082, 28.9784]}
            zoom={11}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OSM</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {Object.entries(courierLocations).map(([courierId, loc]) => {
              const courier = couriers.find((c) => c._id === courierId);
              return (
                <Marker key={courierId} position={[loc.lat, loc.lng]}>
                  <Popup>
                    <div className="text-xs text-black">
                      <strong>{courier?.name || "Kurye"}</strong>
                      {loc.productInfo && <p>{loc.productInfo}</p>}
                      <p className="opacity-60">
                        {new Date(loc.updatedAt).toLocaleTimeString("tr-TR")}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      )}

      {/* Courier cards */}
      {couriers.length === 0 ? (
        <p className="text-sm text-mist text-center py-4">
          {t("Aktif kurye yok", "No active couriers")}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {couriers.map((c) => (
            <div
              key={c._id}
              className="border border-slate/30 rounded-sm p-3 bg-charcoal"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center">
                  <Truck size={14} className="text-brand-gold" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{c.name}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-mist">
                  {t("Aktif", "Active")}
                </span>
                <span className="text-sm font-semibold text-brand-gold">
                  {c.activeCount}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
