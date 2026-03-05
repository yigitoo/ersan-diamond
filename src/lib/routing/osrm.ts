const OSRM_BASE = "https://router.project-osrm.org";

interface OsrmLeg {
  distanceKm: number;
  durationMin: number;
}

export interface OsrmRouteResult {
  distanceKm: number;
  durationMin: number;
  geometry: [number, number][]; // [lat, lng][]
}

export interface OsrmTripResult {
  orderedIndices: number[];
  legs: OsrmLeg[];
  geometry: [number, number][];
  totalDistanceKm: number;
  totalDurationMin: number;
}

/** Istanbul traffic multiplier based on hour of day */
export function getTrafficMultiplier(date?: Date): number {
  const d = date || new Date();
  const istanbulHour = new Date(d.toLocaleString("en-US", { timeZone: "Europe/Istanbul" })).getHours();
  const istanbulMinute = new Date(d.toLocaleString("en-US", { timeZone: "Europe/Istanbul" })).getMinutes();
  const timeFloat = istanbulHour + istanbulMinute / 60;

  if (timeFloat >= 7.5 && timeFloat <= 9.5) return 1.5;   // morning rush
  if (timeFloat >= 17 && timeFloat <= 19.5) return 1.5;    // evening rush
  if (timeFloat >= 12 && timeFloat <= 14) return 1.2;      // lunch
  if (timeFloat >= 22 || timeFloat <= 6) return 0.7;       // night
  return 1.0;
}

/** Adjust OSRM duration with traffic multiplier */
export function adjustForTraffic(durationMin: number, date?: Date): number {
  return Math.round(durationMin * getTrafficMultiplier(date));
}

/** Convert OSRM GeoJSON coordinates [lng, lat][] to [lat, lng][] */
function geoJsonToLatLng(coords: number[][]): [number, number][] {
  return coords.map(([lng, lat]) => [lat, lng]);
}

/** Fetch a route between two points (simple A→B) */
export async function fetchRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): Promise<OsrmRouteResult | null> {
  const t0 = Date.now();
  try {
    const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`;
    const url = `${OSRM_BASE}/route/v1/driving/${coords}?overview=full&geometries=geojson`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) {
      console.warn(`[OSRM] Route failed: HTTP ${res.status} (${Date.now() - t0}ms)`);
      return null;
    }

    const data = await res.json();
    if (data.code !== "Ok" || !data.routes?.[0]) {
      console.warn(`[OSRM] Route bad response: ${data.code} (${Date.now() - t0}ms)`);
      return null;
    }

    const route = data.routes[0];
    console.log(`[OSRM] Route OK: ${(route.distance / 1000).toFixed(1)}km, ${Math.round(route.duration / 60)}min (${Date.now() - t0}ms)`);
    return {
      distanceKm: Math.round((route.distance / 1000) * 10) / 10,
      durationMin: Math.round(route.duration / 60),
      geometry: geoJsonToLatLng(route.geometry.coordinates),
    };
  } catch (err) {
    console.warn(`[OSRM] Route error (${Date.now() - t0}ms):`, err);
    return null;
  }
}

/** Fetch optimized multi-stop trip (TSP) */
export async function fetchOptimizedTrip(
  origin: { lat: number; lng: number },
  stops: Array<{ lat: number; lng: number }>,
): Promise<OsrmTripResult | null> {
  if (stops.length === 0) return null;

  // For single stop, use simpler Route API (faster)
  if (stops.length === 1) {
    const route = await fetchRoute(origin, stops[0]);
    if (!route) return null;
    return {
      orderedIndices: [0],
      legs: [{ distanceKm: route.distanceKm, durationMin: route.durationMin }],
      geometry: route.geometry,
      totalDistanceKm: route.distanceKm,
      totalDurationMin: route.durationMin,
    };
  }

  const t0 = Date.now();
  try {
    const allPoints = [origin, ...stops];
    const coords = allPoints.map((p) => `${p.lng},${p.lat}`).join(";");
    const url = `${OSRM_BASE}/trip/v1/driving/${coords}?roundtrip=false&source=first&destination=any&geometries=geojson&overview=full`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) {
      console.warn(`[OSRM] Trip failed: HTTP ${res.status} (${Date.now() - t0}ms)`);
      return null;
    }

    const data = await res.json();
    if (data.code !== "Ok" || !data.trips?.[0]) {
      console.warn(`[OSRM] Trip bad response: ${data.code} (${Date.now() - t0}ms)`);
      return null;
    }

    const trip = data.trips[0];
    const waypoints: Array<{ waypoint_index: number }> = data.waypoints || [];

    // waypoints array is in INPUT order — waypoint_index is their position in the trip.
    // We need to map: trip position → original stop index (0-based, excluding origin).
    // Build: [ { originalStopIdx, tripPosition } ] then sort by tripPosition.
    const stopMapping = waypoints
      .slice(1) // skip origin (index 0)
      .map((wp, inputIdx) => ({ inputIdx, tripPos: wp.waypoint_index }))
      .sort((a, b) => a.tripPos - b.tripPos);

    const orderedIndices = stopMapping.map((m) => m.inputIdx);

    const legs: OsrmLeg[] = (trip.legs || []).map((leg: { distance: number; duration: number }) => ({
      distanceKm: Math.round((leg.distance / 1000) * 10) / 10,
      durationMin: Math.round(leg.duration / 60),
    }));

    console.log(`[OSRM] Trip OK: ${stops.length} stops, ${(trip.distance / 1000).toFixed(1)}km, ${Math.round(trip.duration / 60)}min (${Date.now() - t0}ms)`);

    return {
      orderedIndices,
      legs,
      geometry: geoJsonToLatLng(trip.geometry.coordinates),
      totalDistanceKm: Math.round((trip.distance / 1000) * 10) / 10,
      totalDurationMin: Math.round(trip.duration / 60),
    };
  } catch (err) {
    console.warn(`[OSRM] Trip error (${Date.now() - t0}ms):`, err);
    return null;
  }
}
