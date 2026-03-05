import type { DeliveryAddress, RouteStop, RouteResult } from "@/types";
import { DEFAULT_PICKUP_COORDS, ISTANBUL_DISTRICTS, TURKEY_CITIES } from "./constants";
import { fetchOptimizedTrip, adjustForTraffic, getTrafficMultiplier } from "@/lib/routing/osrm";

const EARTH_RADIUS_KM = 6371;
const AVG_SPEED_KMH = 25; // Istanbul average with traffic

/** Haversine distance between two coordinates in km */
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Greedy nearest-neighbor TSP ordering */
export function nearestNeighborTSP<T extends { lat: number; lng: number }>(
  origin: { lat: number; lng: number },
  points: T[],
): T[] {
  if (points.length <= 1) return [...points];
  const remaining = [...points];
  const ordered: T[] = [];
  let current = origin;

  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = haversineDistance(current.lat, current.lng, remaining[i].lat, remaining[i].lng);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    const next = remaining.splice(bestIdx, 1)[0];
    ordered.push(next);
    current = { lat: next.lat, lng: next.lng };
  }
  return ordered;
}

/** Estimate ETA in minutes based on distance */
export function estimateEtaMinutes(distanceKm: number): number {
  return Math.round((distanceKm / AVG_SPEED_KMH) * 60);
}

/** Resolve lat/lng for a delivery address (from explicit coords, district lookup, or city lookup) */
export function resolveAddressCoords(addr: DeliveryAddress): { lat: number; lng: number } | null {
  if (addr.lat && addr.lng) return { lat: addr.lat, lng: addr.lng };
  if (addr.district) {
    const coords = ISTANBUL_DISTRICTS[addr.district];
    if (coords) return coords;
  }
  if (addr.city) {
    const cityCoords = TURKEY_CITIES[addr.city];
    if (cityCoords) return cityCoords;
  }
  return null;
}

// Scoring weights
const W_ACTIVE = 3;
const W_DISTANCE = 1;
const W_CLUSTER = 0.5;

/** Score a courier for a delivery (lower = better) */
export function scoreCourierForDelivery(
  courierLoc: { lat: number; lng: number } | null,
  pickupCoords: { lat: number; lng: number },
  deliveryCoords: { lat: number; lng: number },
  existingStopCoords: Array<{ lat: number; lng: number }>,
  activeCount: number,
): number {
  // Workload penalty
  const workloadScore = W_ACTIVE * activeCount;

  // Distance to pickup
  const cLoc = courierLoc || DEFAULT_PICKUP_COORDS;
  const distToPickup = haversineDistance(cLoc.lat, cLoc.lng, pickupCoords.lat, pickupCoords.lng);
  const distScore = W_DISTANCE * distToPickup;

  // Cluster score: avg distance from new delivery to existing stops
  let clusterScore = 0;
  if (existingStopCoords.length > 0) {
    const totalDist = existingStopCoords.reduce(
      (sum, s) => sum + haversineDistance(deliveryCoords.lat, deliveryCoords.lng, s.lat, s.lng),
      0,
    );
    clusterScore = W_CLUSTER * (totalDist / existingStopCoords.length);
  }

  return workloadScore + distScore + clusterScore;
}

/** Build an optimized route for a courier */
export function buildOptimizedRoute(
  courierId: string,
  courierName: string,
  courierLoc: { lat: number; lng: number } | null,
  deliveries: Array<{
    _id: string;
    recipientName: string;
    deliveryAddress: DeliveryAddress;
    status: string;
  }>,
): RouteResult {
  const origin = courierLoc || DEFAULT_PICKUP_COORDS;

  // Resolve coordinates for each delivery
  const stopsWithCoords = deliveries
    .map((d) => {
      const coords = resolveAddressCoords(d.deliveryAddress);
      if (!coords) return null;
      return { ...d, lat: coords.lat, lng: coords.lng };
    })
    .filter(Boolean) as Array<{
      _id: string;
      recipientName: string;
      deliveryAddress: DeliveryAddress;
      status: string;
      lat: number;
      lng: number;
    }>;

  // Order stops by nearest-neighbor TSP
  const ordered = nearestNeighborTSP(origin, stopsWithCoords);

  // Build route stops with distance + ETA
  let cumulativeDistance = 0;
  let prevLat = origin.lat;
  let prevLng = origin.lng;

  const stops: RouteStop[] = ordered.map((s) => {
    const dist = haversineDistance(prevLat, prevLng, s.lat, s.lng);
    cumulativeDistance += dist;
    prevLat = s.lat;
    prevLng = s.lng;

    return {
      deliveryId: s._id,
      recipientName: s.recipientName,
      address: s.deliveryAddress,
      status: s.status as RouteStop["status"],
      lat: s.lat,
      lng: s.lng,
      distanceFromPrev: Math.round(dist * 10) / 10,
      cumulativeDistance: Math.round(cumulativeDistance * 10) / 10,
      etaMinutes: estimateEtaMinutes(cumulativeDistance),
    };
  });

  return {
    courierId,
    courierName,
    origin,
    stops,
    totalDistanceKm: Math.round(cumulativeDistance * 10) / 10,
    totalEtaMinutes: estimateEtaMinutes(cumulativeDistance),
    routeSource: "haversine" as const,
  };
}

/** Build an optimized route using OSRM real road network, with haversine fallback */
export async function buildOptimizedRouteAsync(
  courierId: string,
  courierName: string,
  courierLoc: { lat: number; lng: number } | null,
  deliveries: Array<{
    _id: string;
    recipientName: string;
    deliveryAddress: DeliveryAddress;
    status: string;
  }>,
): Promise<RouteResult> {
  const origin = courierLoc || DEFAULT_PICKUP_COORDS;

  // Resolve coordinates
  const stopsWithCoords = deliveries
    .map((d) => {
      const coords = resolveAddressCoords(d.deliveryAddress);
      if (!coords) return null;
      return { ...d, lat: coords.lat, lng: coords.lng };
    })
    .filter(Boolean) as Array<{
      _id: string;
      recipientName: string;
      deliveryAddress: DeliveryAddress;
      status: string;
      lat: number;
      lng: number;
    }>;

  if (stopsWithCoords.length === 0) {
    return { courierId, courierName, origin, stops: [], totalDistanceKm: 0, totalEtaMinutes: 0, routeSource: "haversine" };
  }

  // Try OSRM with timeout race — if OSRM takes too long, return haversine immediately
  const osrmPromise = fetchOptimizedTrip(origin, stopsWithCoords.map((s) => ({ lat: s.lat, lng: s.lng })));
  const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));
  const osrmResult = await Promise.race([osrmPromise, timeoutPromise]);

  if (osrmResult) {
    const trafficMultiplier = getTrafficMultiplier();

    // Reorder stops according to OSRM trip ordering
    const ordered = osrmResult.orderedIndices.map((i) => stopsWithCoords[i] || stopsWithCoords[0]);
    let cumulativeDistance = 0;
    let cumulativeDuration = 0;

    const stops: RouteStop[] = ordered.map((s, idx) => {
      const leg = osrmResult.legs[idx];
      const legDist = leg?.distanceKm || 0;
      const legDur = leg?.durationMin || 0;
      cumulativeDistance += legDist;
      cumulativeDuration += legDur;

      return {
        deliveryId: s._id,
        recipientName: s.recipientName,
        address: s.deliveryAddress,
        status: s.status as RouteStop["status"],
        lat: s.lat,
        lng: s.lng,
        distanceFromPrev: legDist,
        cumulativeDistance: Math.round(cumulativeDistance * 10) / 10,
        etaMinutes: adjustForTraffic(cumulativeDuration),
        durationMinutes: legDur,
        cumulativeDuration: Math.round(cumulativeDuration),
      };
    });

    return {
      courierId,
      courierName,
      origin,
      stops,
      totalDistanceKm: osrmResult.totalDistanceKm,
      totalEtaMinutes: adjustForTraffic(osrmResult.totalDurationMin),
      geometry: osrmResult.geometry,
      trafficMultiplier,
      routeSource: "osrm",
    };
  }

  // Fallback to haversine (OSRM failed or timed out)
  console.log("[RouteOptimize] OSRM unavailable, using haversine fallback");
  return buildOptimizedRoute(courierId, courierName, courierLoc, deliveries);
}
