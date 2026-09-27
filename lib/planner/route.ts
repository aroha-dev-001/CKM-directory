/**
 * Distances, drive-time estimates, colour bands and Google Maps links.
 *
 * The planner orders stops on estimates; the map replaces them with Google's
 * road numbers once it has drawn. Both sides band legs from this one table, so
 * the ribbon, the timeline and the map always agree on what "a long drive" is.
 */

import type { LatLng } from "./vocab";

/** One drive between two consecutive points. */
export type Leg = { km: number; min: number };

export type Waypoint = LatLng & { label: string };

export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/* Hill roads here wind: town to Mullayanagiri is ~11 km as the crow flies and
   ~20 km by road. A 1.45 winding factor at 36 km/h, plus a few minutes to
   park and set off, lands close to Google's numbers across the district. */
const ROAD_FACTOR = 1.45;
const AVG_KMH = 36;
const LEG_OVERHEAD_MIN = 8;

export function estimateLeg(a: LatLng, b: LatLng): Leg {
  const km = haversineKm(a, b) * ROAD_FACTOR;
  // Two shrines in one compound are a short walk, not a drive.
  if (km < 0.8) return { km, min: 5 };
  return { km, min: Math.round(LEG_OVERHEAD_MIN + (km / AVG_KMH) * 60) };
}

/* ── colour bands ─────────────────────────────────────────────────────── */

/* Each colour holds 3:1 against the page and the map's land, and every band
   is also named in text, so colour is never the only cue. */
export type Band = { id: string; label: string; hint: string; maxKm: number; color: string };

export const BANDS: Band[] = [
  { id: "hop", label: "Short hop", hint: "under 10 km", maxKm: 10, color: "#2f6b3f" },
  { id: "easy", label: "Easy drive", hint: "10 to 30 km", maxKm: 30, color: "#7d8f3a" },
  { id: "long", label: "Long drive", hint: "30 to 60 km", maxKm: 60, color: "#a97a24" },
  { id: "transfer", label: "Big transfer", hint: "over 60 km", maxKm: Infinity, color: "#8a3b2a" },
];

export function bandFor(km: number): Band {
  return BANDS.find((b) => km < b.maxKm) ?? BANDS[BANDS.length - 1];
}

/* ── formatting ───────────────────────────────────────────────────────── */

export function formatKm(km: number): string {
  if (km < 1) return "under 1 km";
  return km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`;
}

export function formatDuration(mins: number): string {
  // Round once, then split, so 59.7 reads "1 h" rather than "60 min".
  const total = Math.max(0, Math.round(mins));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/** Minutes after midnight to "08:05", for a `<time dateTime>`. */
export function isoClock(minutes: number): string {
  const total = Math.round(minutes);
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** Minutes after midnight to "8:05 am". */
export function formatClock(minutes: number): string {
  const total = Math.round(minutes);
  const h24 = Math.floor(total / 60) % 24;
  const m = total % 60;
  const h12 = h24 % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${h24 < 12 ? "am" : "pm"}`;
}

/* ── Google Maps links (no API key needed) ────────────────────────────── */

const coord = (p: LatLng) => `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`;

/** Google's universal URL accepts up to nine waypoints between the ends. */
const MAX_WAYPOINTS = 9;

/**
 * The whole day as one Google Maps route, in visiting order.
 *
 * This universal `/maps/dir/?api=1` URL opens the Google Maps app on Android
 * and iOS when it is installed, and the web map otherwise. Points go out as
 * coordinates: a name like "Z Point" can geocode to the wrong district, and
 * the catalogue's own coordinates cannot.
 */
export function directionsUrl(points: LatLng[]): string | null {
  if (points.length < 2) return null;
  const params = new URLSearchParams({
    api: "1",
    origin: coord(points[0]),
    destination: coord(points[points.length - 1]),
    travelmode: "driving",
  });
  const via = points.slice(1, -1).slice(0, MAX_WAYPOINTS);
  if (via.length) params.set("waypoints", via.map(coord).join("|"));
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/** Directions to one place from wherever the phone is right now. */
export function directionsToUrl(point: LatLng): string {
  const params = new URLSearchParams({ api: "1", destination: coord(point), travelmode: "driving" });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
