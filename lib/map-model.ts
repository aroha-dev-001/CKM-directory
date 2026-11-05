/* Nine-taluk choropleth geometry. Runs at build time: pages hand the finished
   SVG paths to <DistrictMap>, so the map ships in the static HTML. */
import geo from "@/data/taluks.geo.json";
import { CATEGORY_COLOR, CKM, placesInTaluk } from "./data";

const VB: Frame = { w: 760, h: 820, pad: 36 };
/** A taluk page frames one taluk: fixed height, width follows the taluk's own shape. */
const FOCUS_H = 720;
const FOCUS_PAD = 24;
const FILL_LO = "#E3EDE2";
const FILL_HI = "#7FA87C";

const LABEL_AT: Record<string, [number, number]> = {
  chikkamagaluru: [75.77, 13.36],
  tarikere: [75.79, 13.7],
  kadur: [76.13, 13.53],
  mudigere: [75.58, 13.07],
  koppa: [75.385, 13.448],
  nrpura: [75.545, 13.675],
  sringeri: [75.225, 13.365],
  kalasa: [75.305, 13.205],
  ajjampura: [76.07, 13.8],
};

const MAP_LABEL: Record<string, string> = {
  chikkamagaluru: "Chikkamagaluru",
  tarikere: "Tarikere",
  kadur: "Kadur",
  mudigere: "Mudigere",
  koppa: "Koppa",
  nrpura: "N.R. Pura",
  sringeri: "Sringeri",
  kalasa: "Kalasa",
  ajjampura: "Ajjampura",
};

const LABEL_SIZE: Record<string, number> = {
  chikkamagaluru: 18,
  tarikere: 18,
  kadur: 18,
  mudigere: 18,
  koppa: 16,
  nrpura: 16,
  sringeri: 16,
  kalasa: 16,
  ajjampura: 17,
};

type Point = [number, number];

interface Frame {
  w: number;
  h: number;
  pad: number;
}

interface Feature {
  bbox?: number[];
  properties: { id: string; name: string };
  geometry: { type: string; coordinates: unknown };
}

interface Bounds {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
}

export interface MapShape {
  id: string;
  name: string;
  d: string;
  fill: string;
  focused: boolean;
  placeCount: number;
  label: { x: number; y: number; size: number; lineH: number; lines: string[] } | null;
}

export interface MapPin {
  id: string;
  name: string;
  x: number;
  y: number;
  fill: string;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface MapModel {
  width: number;
  height: number;
  focus: string;
  shapes: MapShape[];
  /** Places in the focused taluk, most visited first (that order wins label space). */
  pins: MapPin[];
  /** Focused taluk only: the whole district's box in this frame, where the zoom-in starts. */
  district?: Rect;
  /** Focused taluk only: a spot inside it, clear of pins, for its name. */
  nameAt?: { x: number; y: number };
}

const features = (geo as { features: Feature[] }).features;

/** Position in the curated most-visited list; places not on it rank after every one that is. */
function popularRank(id: string): number {
  const i = CKM.popularPlaces.findIndex((p) => p.id === id);
  return i < 0 ? Infinity : i;
}

function rings(feature: Feature): Point[][] {
  const coords = feature.geometry.coordinates as Point[][] | Point[][][];
  return feature.geometry.type === "Polygon" ? (coords as Point[][]) : (coords as Point[][][]).flat();
}

function boundsOf(list: Feature[]): Bounds {
  const b = { minLon: Infinity, minLat: Infinity, maxLon: -Infinity, maxLat: -Infinity };
  list.forEach((f) =>
    rings(f).forEach((ring) =>
      ring.forEach(([lon, lat]) => {
        b.minLon = Math.min(b.minLon, lon);
        b.minLat = Math.min(b.minLat, lat);
        b.maxLon = Math.max(b.maxLon, lon);
        b.maxLat = Math.max(b.maxLat, lat);
      })
    )
  );
  return b;
}

function expandBounds(b: Bounds, pad: number): Bounds {
  const lon = (b.maxLon - b.minLon) * pad;
  const lat = (b.maxLat - b.minLat) * pad;
  return { minLon: b.minLon - lon, minLat: b.minLat - lat, maxLon: b.maxLon + lon, maxLat: b.maxLat + lat };
}

function xRatioOf(b: Bounds): number {
  return Math.cos(((b.minLat + b.maxLat) / 2) * (Math.PI / 180));
}

/** The district keeps its portrait frame; a focused taluk gets a viewBox shaped to fit it. */
function frameFor(b: Bounds, focused: boolean): Frame {
  if (!focused) return VB;
  const aspect = ((b.maxLon - b.minLon) * xRatioOf(b)) / (b.maxLat - b.minLat);
  return { w: Math.round((FOCUS_H - FOCUS_PAD * 2) * aspect + FOCUS_PAD * 2), h: FOCUS_H, pad: FOCUS_PAD };
}

/** Equirectangular projection, corrected for latitude, fitted into the viewBox. */
function project(lon: number, lat: number, b: Bounds, vb: Frame): Point {
  const xRatio = xRatioOf(b);
  const dx = (b.maxLon - b.minLon) * xRatio;
  const dy = b.maxLat - b.minLat;
  const scale = Math.min((vb.w - vb.pad * 2) / dx, (vb.h - vb.pad * 2) / dy);
  const ox = (vb.w - dx * scale) / 2;
  const oy = (vb.h - dy * scale) / 2;
  return [(lon - b.minLon) * xRatio * scale + ox, (b.maxLat - lat) * scale + oy];
}

function perpDist(p: Point, a: Point, b: Point): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  if (!len2) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

/** Ramer–Douglas–Peucker, so the OSM outlines stay light. */
function simplifyRing(points: Point[], epsilon: number): Point[] {
  if (points.length < 8) return points;
  const first = points[0];
  const last = points[points.length - 1];
  const closed = first[0] === last[0] && first[1] === last[1];
  const line = closed ? points.slice(0, -1) : points.slice();
  const rdp = (pts: Point[]): Point[] => {
    if (pts.length < 3) return pts;
    let maxD = 0;
    let idx = 0;
    for (let i = 1; i < pts.length - 1; i += 1) {
      const d = perpDist(pts[i], pts[0], pts[pts.length - 1]);
      if (d > maxD) {
        maxD = d;
        idx = i;
      }
    }
    if (maxD > epsilon) return rdp(pts.slice(0, idx + 1)).slice(0, -1).concat(rdp(pts.slice(idx)));
    return [pts[0], pts[pts.length - 1]];
  };
  const simple = rdp(line);
  if (closed) simple.push(simple[0]);
  return simple;
}

function projectedRings(feature: Feature, b: Bounds, vb: Frame, epsilon: number): Point[][] {
  return rings(feature).map((ring) => simplifyRing(ring, epsilon).map((pt) => project(pt[0], pt[1], b, vb)));
}

function ringsPath(list: Point[][]): string {
  return list
    .map((ring) => ring.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ") + " Z")
    .join(" ");
}

/** Even-odd test across every ring, so holes and islands both count. */
function inside([x, y]: Point, list: Point[][]): boolean {
  let hit = false;
  for (const ring of list) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
    }
  }
  return hit;
}

/**
 * Where the focused taluk's name goes: a spot whose whole label box sits inside
 * the polygon, as far from the pins (and their labels) as the shape allows.
 */
function nameSpot(list: Point[][], pins: Point[], preferred: Point, name: string, vb: Frame): Point {
  const w = name.length * 10 + 30;
  const h = 30;
  const step = 10;
  let best: Point = preferred;
  let bestScore = -Infinity;
  for (let y = vb.pad + h / 2; y <= vb.h - vb.pad - h / 2; y += step) {
    for (let x = vb.pad + w / 2; x <= vb.w - vb.pad - w / 2; x += step) {
      const corners: Point[] = [
        [x - w / 2, y - h / 2],
        [x + w / 2, y - h / 2],
        [x - w / 2, y + h / 2],
        [x + w / 2, y + h / 2],
        [x, y - h / 2],
        [x, y + h / 2],
        [x - w / 2, y],
        [x + w / 2, y],
      ];
      if (!corners.every((c) => inside(c, list))) continue;
      // Distance from the label box to the nearest pin; pin labels run sideways, so weigh x less.
      const clear = pins.length
        ? Math.min(
            ...pins.map(([px, py]) => Math.hypot(Math.max(0, Math.abs(px - x) - w / 2) * 0.6, Math.max(0, Math.abs(py - y) - h / 2)))
          )
        : 0;
      const score = Math.min(clear, 90) - Math.hypot(x - preferred[0], y - preferred[1]) * 0.08;
      if (score > bestScore) {
        bestScore = score;
        best = [x, y];
      }
    }
  }
  return best;
}

function featureArea(feature: Feature): number {
  const bb = feature.bbox;
  return bb ? (bb[2] - bb[0]) * (bb[3] - bb[1]) : 0;
}

function splitLabel(text: string): string[] {
  if (text === "Chikkamagaluru" || text === "N.R. Pura" || text === "NR Pura") return [text === "NR Pura" ? "N.R. Pura" : text];
  if (text.length <= 10 || !text.includes(" ")) return [text];
  const parts = text.split(" ");
  if (parts.length === 2) return parts;
  return [parts.slice(0, -1).join(" "), parts[parts.length - 1]];
}

function hexMix(a: string, b: string, t: number): string {
  const parse = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  const ch = (x: number, y: number) =>
    Math.round(x + (y - x) * t)
      .toString(16)
      .padStart(2, "0");
  return `#${ch(ar, br)}${ch(ag, bg)}${ch(ab, bb)}`;
}

/**
 * Build the district map. With `focus`, the viewBox zooms to that taluk,
 * neighbours are dimmed, and its places are pinned.
 */
export function buildMapModel(focus = ""): MapModel {
  const focusFeature = focus ? features.find((f) => f.properties.id === focus) : undefined;
  const district = boundsOf(features);
  const b = focusFeature ? expandBounds(boundsOf([focusFeature]), 0.22) : district;
  const vb = frameFor(b, Boolean(focusFeature));
  // A taluk page draws one taluk several times larger, so keep more of the OSM outline.
  const epsilon = focusFeature ? 0.0008 : 0.0035;
  // Largest first, so small taluks paint on top and stay clickable.
  const sorted = features.slice().sort((a, c) => featureArea(c) - featureArea(a));
  const max = Math.max(1, ...sorted.map((f) => placesInTaluk(f.properties.id).length));

  const shapes: MapShape[] = sorted.map((feature) => {
    const id = feature.properties.id;
    const name = MAP_LABEL[id] || feature.properties.name;
    const placeCount = placesInTaluk(id).length;
    const focused = !focus || id === focus;
    const fill = focused ? hexMix(FILL_LO, FILL_HI, placeCount / max) : hexMix(FILL_LO, "#F3F6F1", 0.55);
    const [lx, ly] = project(...(LABEL_AT[id] || [0, 0]), b, vb);
    const size = LABEL_SIZE[id] || 11;
    return {
      id,
      name,
      d: ringsPath(projectedRings(feature, b, vb, epsilon)),
      fill,
      focused,
      placeCount,
      // A taluk page names its taluk in HTML (see <TalukMap>), so it stays legible at any size.
      label: focusFeature
        ? null
        : { x: Number(lx.toFixed(1)), y: Number(ly.toFixed(1)), size, lineH: Math.round(size * 1.15), lines: splitLabel(name) },
    };
  });

  if (!focusFeature) return { width: vb.w, height: vb.h, focus: "", shapes, pins: [] };

  const listed = placesInTaluk(focus);
  const pins: MapPin[] = listed
    .filter((place) => place.lng != null && place.lat != null)
    .map((place, i) => ({ place, i, rank: popularRank(place.id) }))
    .sort((a, c) => a.rank - c.rank || a.i - c.i)
    .map(({ place }) => {
      const [x, y] = project(place.lng!, place.lat!, b, vb);
      return {
        id: place.id,
        name: place.name,
        x: Number(x.toFixed(1)),
        y: Number(y.toFixed(1)),
        fill: CATEGORY_COLOR[place.category] || "#2F6B3F",
      };
    });

  const [dx0, dy0] = project(district.minLon, district.maxLat, b, vb);
  const [dx1, dy1] = project(district.maxLon, district.minLat, b, vb);
  const outline = projectedRings(focusFeature, b, vb, epsilon);
  const name = MAP_LABEL[focus] || focusFeature.properties.name;
  const [nx, ny] = nameSpot(
    outline,
    pins.map((p) => [p.x, p.y]),
    project(...(LABEL_AT[focus] || [0, 0]), b, vb),
    name,
    vb
  );

  return {
    width: vb.w,
    height: vb.h,
    focus,
    shapes,
    pins,
    district: {
      x: Number(dx0.toFixed(1)),
      y: Number(dy0.toFixed(1)),
      w: Number((dx1 - dx0).toFixed(1)),
      h: Number((dy1 - dy0).toFixed(1)),
    },
    nameAt: { x: Number(nx.toFixed(1)), y: Number(ny.toFixed(1)) },
  };
}
