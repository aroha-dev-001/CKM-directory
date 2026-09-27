/**
 * The Google Maps JavaScript API, loaded once and only when a map is on
 * screen. Every day's map awaits the same promise, so the script tag is added
 * a single time however many days the plan has.
 *
 * The key is a browser key by design (it ships in the page). Restrict it in
 * Google Cloud to this site's referrers and to the Maps JavaScript and
 * Directions APIs. With no key the planner still works: each day falls back
 * to a drawn sketch, and the "Open in Google Maps" links need no key at all.
 */

export const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
export const mapsConfigured = MAPS_KEY.length > 0;

const CALLBACK = "__ckmMapsReady";

declare global {
  interface Window {
    __ckmMapsReady?: () => void;
    /** Google calls this when the key is rejected for this site. */
    gm_authFailure?: () => void;
  }
}

export type MapsLibs = {
  maps: google.maps.MapsLibrary;
  routes: google.maps.RoutesLibrary;
  core: google.maps.CoreLibrary;
};

let pending: Promise<MapsLibs> | null = null;
let authFailed = false;
const authListeners = new Set<() => void>();

/** Runs `fn` if Google rejects the key after a map has already drawn. */
export function onMapsAuthFailure(fn: () => void): () => void {
  if (authFailed) fn();
  authListeners.add(fn);
  return () => authListeners.delete(fn);
}

/**
 * `language` sets the map's labels, and only takes effect on the first call:
 * the script loads once per page. In Karnataka Google still adds the Kannada
 * name under the English one, which suits this bilingual site.
 */
export function loadGoogleMaps(language: "en" | "kn" = "en"): Promise<MapsLibs> {
  if (typeof window === "undefined") return Promise.reject(new Error("Maps load in the browser only"));
  if (!mapsConfigured) return Promise.reject(new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set"));
  if (authFailed) return Promise.reject(new Error("The Maps key was refused for this site"));
  if (pending) return pending;

  pending = new Promise<MapsLibs>((resolve, reject) => {
    const script = document.createElement("script");
    const params = new URLSearchParams({
      key: MAPS_KEY,
      v: "weekly",
      loading: "async",
      callback: CALLBACK,
      language,
      // India's own map view: borders as India shows them, local place names.
      region: "IN",
    });
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;

    window.gm_authFailure = () => {
      authFailed = true;
      authListeners.forEach((fn) => fn());
    };
    window[CALLBACK] = async () => {
      delete window[CALLBACK];
      try {
        const [maps, routes, core] = await Promise.all([
          google.maps.importLibrary("maps") as Promise<google.maps.MapsLibrary>,
          google.maps.importLibrary("routes") as Promise<google.maps.RoutesLibrary>,
          google.maps.importLibrary("core") as Promise<google.maps.CoreLibrary>,
        ]);
        resolve({ maps, routes, core });
      } catch (error) {
        reject(error);
      }
    };
    script.onerror = () => {
      delete window[CALLBACK];
      script.remove();
      pending = null; // a later map may retry, e.g. after the network returns
      reject(new Error("Google Maps failed to load"));
    };
    document.head.appendChild(script);
  });
  return pending;
}

/**
 * A quiet basemap in the site's ivory and moss, so the banded route is the
 * only saturated thing on the tile. Road and business labels are off; town
 * names stay, because they are how people read where a day goes.
 */
export const MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#efeadd" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#5a6b5e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#fbfaf5" }, { weight: 2 }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#d9d2bf" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#e8e6d4" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ visibility: "on" }, { color: "#d8e3cd" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#fbfaf5" }] },
  { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#f3ead3" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#e2d6b8" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#b9cfd3" }] },
];
