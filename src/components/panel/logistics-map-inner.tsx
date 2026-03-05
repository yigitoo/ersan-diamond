"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, Marker, useMap } from "react-leaflet";
import { useI18n } from "@/lib/i18n";
import { DELIVERY_MAP_COLORS, DELIVERY_STATUS_CONFIG, MAP_TILE_LAYERS, tl } from "@/lib/utils/constants";
import type { MapTileKey } from "@/lib/utils/constants";
import { resolveAddressCoords } from "@/lib/utils/geo";
import type { LogisticsMapProps } from "./logistics-map";
import "leaflet/dist/leaflet.css";

const TILE_STORAGE_KEY = "ersan-map-tile";

/* Push Leaflet zoom controls down so they don't overlap panel header in fullscreen */
const leafletOverrides = `
.leaflet-top.leaflet-left { top: 10px !important; left: 10px !important; }
.map-fullscreen .leaflet-top.leaflet-left { top: 60px !important; }
`;

/** Auto-fit map bounds to all markers */
function AutoFitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }
    const bounds = L.latLngBounds(points.map(([lat, lng]) => [lat, lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [map, points]);
  return null;
}

/** Invalidate map size on fullscreen toggle */
function ResizeHandler({ trigger }: { trigger: boolean }) {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100);
  }, [map, trigger]);
  return null;
}

export default function LogisticsMapInner({
  deliveries,
  couriers,
  route,
  onDeliveryClick,
  onCourierClick,
}: LogisticsMapProps) {
  const { t } = useI18n();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTileMenu, setShowTileMenu] = useState(false);
  const [showLegend, setShowLegend] = useState(false);

  // Tile layer preference
  const [tileKey, setTileKey] = useState<MapTileKey>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(TILE_STORAGE_KEY);
      if (saved && saved in MAP_TILE_LAYERS) return saved as MapTileKey;
    }
    return "dark";
  });

  const tile = MAP_TILE_LAYERS[tileKey];

  const handleTileChange = (key: MapTileKey) => {
    setTileKey(key);
    localStorage.setItem(TILE_STORAGE_KEY, key);
    setShowTileMenu(false);
  };

  // Escape key to exit fullscreen
  useEffect(() => {
    if (!isFullscreen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setIsFullscreen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isFullscreen]);

  // Delivery markers with resolved coords
  const deliveryMarkers = useMemo(() => {
    return deliveries
      .map((d) => {
        const coords = resolveAddressCoords(d.deliveryAddress || {});
        if (!coords) return null;
        return { ...d, lat: coords.lat, lng: coords.lng };
      })
      .filter(Boolean) as Array<any & { lat: number; lng: number }>;
  }, [deliveries]);

  // Courier markers
  const courierMarkers = useMemo(() => {
    return couriers.filter((c) => c.lat && c.lng) as Array<(typeof couriers)[number] & { lat: number; lng: number }>;
  }, [couriers]);

  // Route polyline — prefer real geometry, fallback to stop-to-stop lines
  const routeCoords = useMemo(() => {
    if (!route) return null;
    if (route.geometry && route.geometry.length > 0) return route.geometry;
    if (route.stops.length === 0) return null;
    const points: [number, number][] = [[route.origin.lat, route.origin.lng]];
    for (const stop of route.stops) points.push([stop.lat, stop.lng]);
    return points;
  }, [route]);

  // All marker points for fitBounds
  const allPoints = useMemo(() => {
    const pts: [number, number][] = [];
    for (const d of deliveryMarkers) pts.push([d.lat, d.lng]);
    for (const c of courierMarkers) pts.push([c.lat!, c.lng!]);
    if (route?.origin) pts.push([route.origin.lat, route.origin.lng]);
    return pts;
  }, [deliveryMarkers, courierMarkers, route]);

  const defaultCenter: [number, number] = allPoints.length > 0 ? allPoints[0] : [41.0082, 28.9784];

  // Courier DivIcon
  const courierIcon = useMemo(() => L.divIcon({
    className: "",
    html: `<div style="width:28px;height:28px;border-radius:50%;background:#D4AF37;color:#1a1a2e;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4)">K</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  }), []);

  const stopIcon = useCallback((num: number) => L.divIcon({
    className: "",
    html: `<div style="width:24px;height:24px;border-radius:50%;background:#D4AF37;color:#1a1a2e;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4)">${num}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  }), []);

  // Icon button style
  const iconBtnStyle: React.CSSProperties = {
    width: 32, height: 32, borderRadius: 4,
    background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
    color: "rgba(255,255,255,0.85)", border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 14,
  };

  return (
    <div
      className={isFullscreen ? "fixed inset-0 z-[9999] bg-black map-fullscreen" : "relative w-full h-full"}
    >
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: leafletOverrides }} />
      <MapContainer
        center={defaultCenter}
        zoom={11}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer key={tileKey} attribution={tile.attribution} url={tile.url} />
        <AutoFitBounds points={allPoints} />
        <ResizeHandler trigger={isFullscreen} />

        {/* Delivery markers */}
        {deliveryMarkers.map((d) => (
          <CircleMarker
            key={d._id}
            center={[d.lat, d.lng]}
            radius={8}
            pathOptions={{
              fillColor: DELIVERY_MAP_COLORS[d.status] || "#666",
              fillOpacity: 0.9, color: "#fff", weight: 2,
            }}
            eventHandlers={{ click: () => onDeliveryClick?.(d._id) }}
          >
            <Popup>
              <div className="text-xs text-black space-y-1">
                <p className="font-bold">{d.recipientName}</p>
                <p>{d.deliveryAddress?.district}, {d.deliveryAddress?.city}</p>
                <p className="opacity-70">{tl(t, DELIVERY_STATUS_CONFIG[d.status]?.label)}</p>
                {d.productId && <p className="opacity-60">{d.productId.brand} {d.productId.model}</p>}
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Courier markers */}
        {courierMarkers.map((c) => (
          <Marker
            key={c._id}
            position={[c.lat, c.lng]}
            icon={courierIcon}
            eventHandlers={{ click: () => onCourierClick?.(c._id) }}
          >
            <Popup>
              <div className="text-xs text-black">
                <p className="font-bold">{c.name}</p>
                <p>{c.activeCount} {t("aktif teslimat", "active delivery(ies)")}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Route polyline */}
        {routeCoords && (
          <Polyline
            positions={routeCoords}
            pathOptions={{
              color: "#D4AF37", weight: 3,
              dashArray: route?.routeSource === "osrm" ? undefined : "8 6",
              opacity: 0.85,
            }}
          />
        )}

        {/* Route stop numbered markers */}
        {route?.stops.map((stop, idx) => (
          <Marker key={stop.deliveryId} position={[stop.lat, stop.lng]} icon={stopIcon(idx + 1)}>
            <Popup>
              <div className="text-xs text-black space-y-1">
                <p className="font-bold">#{idx + 1} {stop.recipientName}</p>
                <p>{stop.address.district}, {stop.address.city}</p>
                <p>{stop.distanceFromPrev} km &middot; ~{stop.etaMinutes} dk</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Top-right control buttons */}
      <div className={`absolute right-3 flex flex-col items-end gap-1.5 ${isFullscreen ? "top-[60px]" : "top-3"}`} style={{ zIndex: 500 }}>
        {/* Row: route badge + fullscreen */}
        <div className="flex items-center gap-1.5">
          {/* Route source badge (inline, no overlap) */}
          {route?.routeSource && (
            <div
              className="rounded-sm"
              style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", padding: "6px 8px", fontSize: 9, color: "rgba(255,255,255,0.6)", lineHeight: 1, height: 32, display: "flex", alignItems: "center", gap: 3 }}
            >
              <span>{route.routeSource === "osrm" ? "OSRM" : "~"}</span>
              {route.trafficMultiplier && route.trafficMultiplier !== 1 && (
                <span style={{ color: "#D4AF37" }}>×{route.trafficMultiplier}</span>
              )}
            </div>
          )}
          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsFullscreen((v) => !v)}
            style={iconBtnStyle}
            title={isFullscreen ? t("Küçült", "Exit fullscreen") : t("Tam ekran", "Fullscreen")}
          >
            {isFullscreen ? "✕" : "⛶"}
          </button>
        </div>

        {/* Tile layer toggle */}
        <div className="relative">
          <button
            onClick={() => { setShowTileMenu((v) => !v); setShowLegend(false); }}
            style={{ ...iconBtnStyle, background: showTileMenu ? "rgba(212,175,55,0.3)" : "rgba(0,0,0,0.8)" }}
            title={t("Harita tipi", "Map style")}
          >
            ◧
          </button>
          {showTileMenu && (
            <div
              className="absolute top-0 right-[38px] rounded-sm"
              style={{ background: "rgba(0,0,0,0.9)", backdropFilter: "blur(8px)", padding: "4px", fontSize: 10, whiteSpace: "nowrap" }}
            >
              {(Object.keys(MAP_TILE_LAYERS) as MapTileKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => handleTileChange(key)}
                  className="block w-full text-left px-2 py-1 rounded-sm transition-colors"
                  style={{
                    color: key === tileKey ? "#D4AF37" : "rgba(255,255,255,0.7)",
                    background: key === tileKey ? "rgba(212,175,55,0.15)" : "transparent",
                    fontWeight: key === tileKey ? 600 : 400,
                  }}
                >
                  {tl(t, MAP_TILE_LAYERS[key].name)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Legend toggle */}
        <button
          onClick={() => { setShowLegend((v) => !v); setShowTileMenu(false); }}
          style={{ ...iconBtnStyle, background: showLegend ? "rgba(212,175,55,0.3)" : "rgba(0,0,0,0.8)" }}
          title={t("Lejant", "Legend")}
        >
          ●
        </button>
      </div>

      {/* Legend (toggle, bottom-left) */}
      {showLegend && (
        <div
          className="absolute bottom-3 left-3 rounded-sm"
          style={{ background: "rgba(0,0,0,0.9)", backdropFilter: "blur(8px)", padding: "8px 10px", fontSize: 10, lineHeight: 1.6, zIndex: 500 }}
        >
          {Object.entries(DELIVERY_MAP_COLORS).filter(([k]) => k !== "CANCELLED").map(([status, color]) => (
            <div key={status} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
              <span style={{ color: "rgba(255,255,255,0.85)" }}>{tl(t, DELIVERY_STATUS_CONFIG[status]?.label)}</span>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "#D4AF37", flexShrink: 0 }} />
            <span style={{ color: "rgba(255,255,255,0.85)" }}>{t("Kurye", "Courier")}</span>
          </div>
        </div>
      )}
    </div>
  );
}
