/**
 * Road routes from Google, for the day maps.
 *
 * Primary: the Routes API through `Route.computeRoutes`, Google's current
 * routing call in the Maps JavaScript API. Fallback: the older
 * `DirectionsService`, deprecated since February 2026 but still served, for
 * keys that only have the Directions API enabled. Either way the caller gets
 * the same shape: one distance, duration and path per leg.
 *
 * Every route is requested once per page load. The promise is cached by its
 * points, so re-renders, React's development double effects and a second
 * visit to the same day never pay for the same route twice.
 */

import type { Leg, Waypoint } from "./route";

export type RoadRoute = { legs: Leg[]; paths: google.maps.LatLngLiteral[][] };

const TIMEOUT_MS = 10_000;

/* `Route` is newer than the published @types/google.maps, so the slice of it
   used here is typed locally. */
type LatLngish = { lat: number | (() => number); lng: number | (() => number) };
type RoutesLeg = { distanceMeters?: number | null; durationMillis?: number | null; path?: LatLngish[] | null };
type ComputeRoutes = (request: {
  origin: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
  intermediates: { location: google.maps.LatLngLiteral }[];
  travelMode: "DRIVING";
  fields: string[];
}) => Promise<{ routes?: { legs?: RoutesLeg[] | null }[] | null }>;

/* A refusal (API not enabled, key restricted, quota spent) is a fact about the
   project, not one day, so once seen the other days skip that call. */
let routesApiRefused = false;
let directionsRefused = false;
const DIRECTIONS_FATAL = new Set(["REQUEST_DENIED", "OVER_QUERY_LIMIT", "OVER_DAILY_LIMIT"]);

const cache = new Map<string, Promise<RoadRoute | null>>();

const literal = (p: LatLngish): google.maps.LatLngLiteral => ({
  lat: typeof p.lat === "function" ? p.lat() : p.lat,
  lng: typeof p.lng === "function" ? p.lng() : p.lng,
});

const point = (p: Waypoint): google.maps.LatLngLiteral => ({ lat: p.lat, lng: p.lng });

function withTimeout<T>(promise: Promise<T>): Promise<T | "timeout"> {
  return Promise.race([
    promise,
    new Promise<"timeout">((resolve) => window.setTimeout(() => resolve("timeout"), TIMEOUT_MS)),
  ]);
}

async function viaRoutesApi(routes: google.maps.RoutesLibrary, points: Waypoint[]): Promise<RoadRoute | null | "refused"> {
  const compute = (routes as unknown as { Route?: { computeRoutes?: ComputeRoutes } }).Route?.computeRoutes;
  if (!compute || routesApiRefused) return "refused";
  try {
    const result = await withTimeout(
      compute({
        origin: point(points[0]),
        destination: point(points[points.length - 1]),
        intermediates: points.slice(1, -1).map((p) => ({ location: point(p) })),
        travelMode: "DRIVING",
        fields: ["legs", "path", "distanceMeters", "durationMillis"],
      })
    );
    if (result === "timeout") return null;
    const legs = result.routes?.[0]?.legs ?? [];
    if (legs.length !== points.length - 1) return null;
    return {
      legs: legs.map((leg) => ({ km: (leg.distanceMeters ?? 0) / 1000, min: (leg.durationMillis ?? 0) / 60_000 })),
      paths: legs.map((leg) => (leg.path ?? []).map(literal)),
    };
  } catch {
    routesApiRefused = true;
    return "refused";
  }
}

async function viaDirections(routes: google.maps.RoutesLibrary, points: Waypoint[]): Promise<RoadRoute | null> {
  if (directionsRefused) return null;
  try {
    const result = await withTimeout(
      new routes.DirectionsService().route({
        origin: point(points[0]),
        destination: point(points[points.length - 1]),
        waypoints: points.slice(1, -1).map((p) => ({ location: point(p), stopover: true })),
        travelMode: routes.TravelMode.DRIVING,
        optimizeWaypoints: false, // the planner already chose the order
      })
    );
    if (result === "timeout") return null;
    const legs = result.routes[0]?.legs ?? [];
    if (legs.length !== points.length - 1) return null;
    return {
      legs: legs.map((leg) => ({ km: (leg.distance?.value ?? 0) / 1000, min: (leg.duration?.value ?? 0) / 60 })),
      paths: legs.map((leg) => leg.steps.flatMap((step) => (step.path ?? []).map((pt) => pt.toJSON()))),
    };
  } catch (error) {
    const code = (error as { code?: string } | null)?.code;
    if (code && DIRECTIONS_FATAL.has(code)) directionsRefused = true;
    return null;
  }
}

/** The day's road route in visiting order, or null when Google cannot give one. */
export function roadRoute(routes: google.maps.RoutesLibrary, points: Waypoint[]): Promise<RoadRoute | null> {
  const key = points.map((p) => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`).join("|");
  const cached = cache.get(key);
  if (cached) return cached;

  const request = (async () => {
    const modern = await viaRoutesApi(routes, points);
    return modern === "refused" ? viaDirections(routes, points) : modern;
  })();

  cache.set(key, request);
  // Failures are not kept: a later visit may succeed once the network is back.
  request.then((route) => {
    if (!route) cache.delete(key);
  });
  return request;
}
