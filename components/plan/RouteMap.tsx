"use client";

/**
 * One day's drive on a Google map: the road route, each leg coloured by its
 * distance band, and numbered pins that stay in step with the stop cards.
 *
 * It degrades in two steps rather than failing:
 *  - Maps loads but Directions refuses (key not enabled for it, quota, a
 *    route Google will not drive): pins and dashed straight lines on the map.
 *  - Maps cannot load at all (no key, blocked script, key refused for this
 *    site): a drawn sketch of the same route, same colours, same numbers.
 *
 * Maps and Directions are billed per call, so the map mounts only once its
 * day scrolls near the screen, and each route is requested once per page.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "@/components/ui/motion";
import { useLang } from "@/lib/lang";
import { MAP_STYLE, loadGoogleMaps, mapsConfigured, onMapsAuthFailure, type MapsLibs } from "@/lib/planner/gmaps";
import { roadRoute } from "@/lib/planner/roads";
import { BANDS, bandFor, directionsUrl, type Leg, type Waypoint } from "@/lib/planner/route";
import { IconExternal } from "./icons";

type Status = "waiting" | "road" | "straight" | "sketch";

type Pin = { pos: google.maps.LatLngLiteral; el: HTMLElement; movable: boolean };
type PinLayerView = google.maps.OverlayView;
let PinLayerClass: (new (pins: Pin[]) => PinLayerView) | null = null;

/** Closest two numbered pins may sit, centre to centre, in screen pixels. */
const PIN_GAP_PX = 30;

/**
 * Every pin of a day in one overlay: HTML pins, so the numbers use the site's
 * type and can be focused. Neighbouring stops (Baba Budangiri, Manikyadhara
 * and Jhari are two kilometres apart) collide at district zoom, so after
 * projecting, numbered pins that overlap are eased apart until each number is
 * readable. Zoom in and they settle back on their exact spots.
 */
function pinLayerClass(maps: google.maps.MapsLibrary) {
  if (PinLayerClass) return PinLayerClass;
  PinLayerClass = class extends maps.OverlayView {
    constructor(private pins: Pin[]) {
      super();
      pins.forEach((pin) => maps.OverlayView.preventMapHitsAndGesturesFrom(pin.el));
    }
    onAdd() {
      const pane = this.getPanes()?.overlayMouseTarget;
      this.pins.forEach((pin) => pane?.appendChild(pin.el));
    }
    draw() {
      const projection = this.getProjection();
      if (!projection) return;
      const at = this.pins.map((pin) => {
        const p = projection.fromLatLngToDivPixel(pin.pos);
        return { x: p?.x ?? 0, y: p?.y ?? 0 };
      });
      for (let pass = 0; pass < 12; pass++) {
        let moved = false;
        for (let i = 0; i < at.length; i++) {
          for (let j = i + 1; j < at.length; j++) {
            if (!this.pins[i].movable || !this.pins[j].movable) continue;
            let dx = at[j].x - at[i].x;
            let dy = at[j].y - at[i].y;
            let d = Math.hypot(dx, dy);
            if (d >= PIN_GAP_PX) continue;
            if (d < 0.5) {
              // Same spot: fan out on a fixed angle so the result is stable.
              dx = Math.cos(j * 2.4);
              dy = Math.sin(j * 2.4);
              d = 1;
            }
            const push = (PIN_GAP_PX - d) / 2;
            at[i].x -= (dx / d) * push;
            at[i].y -= (dy / d) * push;
            at[j].x += (dx / d) * push;
            at[j].y += (dy / d) * push;
            moved = true;
          }
        }
        if (!moved) break;
      }
      this.pins.forEach((pin, i) => {
        pin.el.style.left = `${at[i].x}px`;
        pin.el.style.top = `${at[i].y}px`;
      });
    }
    onRemove() {
      this.pins.forEach((pin) => pin.el.remove());
    }
  };
  return PinLayerClass;
}

export function RouteMap({
  day,
  points,
  stopCount,
  fallbackLegs,
  active,
  onSelect,
  onRoute,
}: {
  day: number;
  /** The day's start, each stop in order, then the end point when there is one. */
  points: Waypoint[];
  stopCount: number;
  fallbackLegs: Leg[];
  /** Index of the highlighted stop (0-based), shared with the stop cards. */
  active: number | null;
  onSelect: (stop: number) => void;
  onRoute: (legs: Leg[] | null) => void;
}) {
  const lang = useLang();
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const pins = useRef<HTMLElement[]>([]);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<Status>(mapsConfigured ? "waiting" : "sketch");
  const [legs, setLegs] = useState<Leg[] | null>(null);

  // Parent callbacks are usually inline arrows; refs keep them out of the
  // (billed) drawing effect's dependencies.
  const selectRef = useRef(onSelect);
  const routeRef = useRef(onRoute);
  const langRef = useRef(lang);
  useEffect(() => {
    selectRef.current = onSelect;
    routeRef.current = onRoute;
    langRef.current = lang;
  });

  // New tab on a desktop; in place on a phone, so the Google Maps app takes over.
  const finePointer = useMediaQuery("(pointer: fine)");
  const shown = legs ?? fallbackLegs;
  const mapsUrl = useMemo(() => directionsUrl(points), [points]);
  const usedBands = BANDS.filter((b) => shown.some((l) => bandFor(l.km).id === b.id));

  // Mount the map only when the day is close to the viewport.
  useEffect(() => {
    if (!mapsConfigured || visible) return;
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  // If Google refuses the key after drawing, it paints its own error over the
  // map. Swap to the sketch instead of leaving that on the page.
  useEffect(() => onMapsAuthFailure(() => setStatus("sketch")), []);

  useEffect(() => {
    if (!visible || points.length < 2) return;
    let cancelled = false;
    const overlays: { setMap: (map: google.maps.Map | null) => void }[] = [];

    (async () => {
      let libs: MapsLibs;
      try {
        libs = await loadGoogleMaps(langRef.current);
      } catch {
        if (!cancelled) setStatus("sketch");
        return;
      }
      if (cancelled || !canvas.current) return;
      const { maps, routes, core } = libs;

      const map = new maps.Map(canvas.current, {
        center: points[0],
        zoom: 10,
        styles: MAP_STYLE,
        disableDefaultUI: true,
        zoomControl: true,
        fullscreenControl: true,
        clickableIcons: false,
        // A phone scroll should move the page, not the map.
        gestureHandling: "cooperative",
      });

      const data = await roadRoute(routes, points);
      if (cancelled) return;

      const bounds = new core.LatLngBounds();
      points.forEach((p) => bounds.extend(p));

      if (data) {
        data.paths.forEach((path, i) => {
          if (path.length < 2) return;
          path.forEach((pt) => bounds.extend(pt));
          const color = bandFor(data.legs[i].km).color;
          overlays.push(new maps.Polyline({ map, path, strokeColor: "#fbfaf5", strokeOpacity: 0.95, strokeWeight: 8, zIndex: 1 }));
          overlays.push(new maps.Polyline({ map, path, strokeColor: color, strokeOpacity: 1, strokeWeight: 4.5, zIndex: 2 }));
        });
      } else {
        points.slice(1).forEach((p, i) => {
          const color = bandFor(fallbackLegs[i]?.km ?? 0).color;
          overlays.push(
            new maps.Polyline({
              map,
              path: [points[i], p],
              geodesic: true,
              strokeOpacity: 0,
              zIndex: 2,
              icons: [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 1, strokeColor: color, scale: 3 }, offset: "0", repeat: "11px" }],
            })
          );
        });
      }

      const pinList: Pin[] = [];
      pins.current = [];
      points.forEach((p, i) => {
        const isStop = i >= 1 && i <= stopCount;
        const isLoopEnd = i === points.length - 1 && i > stopCount && p.lat === points[0].lat && p.lng === points[0].lng;
        if (isLoopEnd) return;
        let el: HTMLElement;
        if (isStop) {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "pl-pin";
          button.textContent = String(i);
          button.setAttribute("aria-label", `Stop ${i}: ${p.label}`);
          button.addEventListener("click", () => selectRef.current(i - 1));
          // Where close stops still touch, stop 1 sits on top of stop 2, and so on.
          button.style.zIndex = String(stopCount - i + 1);
          pins.current[i - 1] = button;
          el = button;
        } else {
          el = document.createElement("span");
          el.className = i === 0 ? "pl-pin pl-pin-start" : "pl-pin pl-pin-end";
          el.title = p.label;
        }
        pinList.push({ pos: { lat: p.lat, lng: p.lng }, el, movable: isStop });
      });
      const PinLayer = pinLayerClass(maps);
      const layer = new PinLayer(pinList);
      layer.setMap(map);
      overlays.push(layer);

      // Tight padding: the pins are ~32 px across, and more margin than that
      // drops a whole zoom level on a compact day. Days inside one compound
      // (Sringeri's two temples) would zoom to street level, so cap it.
      map.fitBounds(bounds, { top: 34, right: 26, bottom: 26, left: 26 });
      core.event.addListenerOnce(map, "idle", () => {
        if ((map.getZoom() ?? 0) > 14) map.setZoom(14);
      });
      setLegs(data?.legs ?? null);
      setStatus(data ? "road" : "straight");
      routeRef.current(data?.legs ?? null);
    })();

    return () => {
      cancelled = true;
      overlays.forEach((o) => o.setMap(null));
      pins.current = [];
    };
  }, [visible, points, stopCount, fallbackLegs]);

  useEffect(() => {
    pins.current.forEach((pin, i) => {
      if (!pin) return;
      pin.classList.toggle("is-active", i === active);
      pin.style.zIndex = String(i === active ? stopCount + 1 : stopCount - i);
    });
  }, [active, status, stopCount]);

  if (points.length < 2) return null;
  const showMap = status !== "sketch";

  return (
    <figure className="pl-map" ref={host}>
      <div className="pl-map-frame">
        {showMap ? (
          <>
            <div className="pl-map-canvas" ref={canvas} role="region" aria-label={`Map of the day ${day} route`} />
            {status === "waiting" ? (
              <p className="pl-map-wait" aria-live="polite">
                Drawing the route…
              </p>
            ) : null}
          </>
        ) : (
          <Sketch day={day} points={points} stopCount={stopCount} legs={shown} active={active} />
        )}
      </div>
      <figcaption className="pl-map-foot">
        <p className="pl-map-source">
          {status === "road"
            ? "Road route from Google Maps"
            : status === "straight"
              ? "Straight lines between stops. Google could not draw the road route."
              : status === "sketch"
                ? "Route sketch. The live map is unavailable here."
                : "Loading Google Maps"}
        </p>
        {usedBands.length ? (
          <ul className="pl-legend" aria-label="Drive lengths">
            {usedBands.map((b) => (
              <li key={b.id}>
                <span className="pl-legend-swatch" style={{ background: b.color }} />
                {b.label}
                <span className="pl-legend-hint">{b.hint}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {mapsUrl ? (
          <a
            className="btn btn-line pl-map-open"
            href={mapsUrl}
            {...(finePointer ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            <IconExternal />
            Open day {day} in Google Maps
            {finePointer ? <span className="sr-only"> (opens in a new tab)</span> : null}
          </a>
        ) : null}
      </figcaption>
    </figure>
  );
}

/** The floor: the same route drawn from coordinates alone, north up. */
function Sketch({
  day,
  points,
  stopCount,
  legs,
  active,
}: {
  day: number;
  points: Waypoint[];
  stopCount: number;
  legs: Leg[];
  active: number | null;
}) {
  const W = 100;
  const H = 80;
  const P = 10;
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  // Equal scale on both axes keeps the shape true; the smaller span centres.
  const span = Math.max(maxLat - minLat, maxLng - minLng, 0.02);
  const scale = Math.min((W - 2 * P) / span, (H - 2 * P) / span);
  const offX = (W - (maxLng - minLng) * scale) / 2;
  const offY = (H - (maxLat - minLat) * scale) / 2;
  const xy = points.map((p) => ({ x: offX + (p.lng - minLng) * scale, y: offY + (maxLat - p.lat) * scale }));

  return (
    <svg className="pl-sketch" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Sketch of the day ${day} route`}>
      {xy.slice(1).map((b, i) => (
        <line key={i} x1={xy[i].x} y1={xy[i].y} x2={b.x} y2={b.y} stroke={bandFor(legs[i]?.km ?? 0).color}
          strokeWidth="0.9" strokeDasharray="2 1.4" strokeLinecap="round" />
      ))}
      {xy.map((p, i) => {
        if (i === 0 || i > stopCount) {
          const isLoopEnd = i > 0 && points[i].lat === points[0].lat && points[i].lng === points[0].lng;
          return isLoopEnd ? null : <circle key={i} cx={p.x} cy={p.y} r="1.8" className="pl-sketch-end" />;
        }
        return (
          <g key={i} className={`pl-sketch-stop${active === i - 1 ? " is-active" : ""}`}>
            <circle cx={p.x} cy={p.y} r="3.4" />
            <text x={p.x} y={p.y + 1.25}>{i}</text>
          </g>
        );
      })}
    </svg>
  );
}
