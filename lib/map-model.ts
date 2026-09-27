/* Nine-taluk choropleth geometry. Runs at build time: pages hand the finished
   SVG paths to <DistrictMap>, so the map ships in the static HTML. */
import geo from "@/data/taluks.geo.json";
import { CATEGORY_COLOR, placesInTaluk } from "./data";

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
  tx: number;
  ty: number;
  anchor: "start" | "end";
}

export interface MapModel {
  width: number;
  height: number;
  focus: string;
  shapes: MapShape[];
  pins: MapPin[];
}

const features = (geo as { features: Feature[] }).features;

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

function featurePath(feature: Feature, b: Bounds, vb: Frame): string {
  return rings(feature)
    .map(
      (ring) =>
        simplifyRing(ring, 0.0035)
          .map((pt, i) => {
            const [x, y] = project(pt[0], pt[1], b, vb);
            return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
          })
          .join(" ") + " Z"
    )
    .join(" ");
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

/** Matches the pin circle radius drawn by <DistrictMap>. */
const PIN_R = 5.2;
const PIN_FONT = 11;

type Box = [number, number, number, number];

function overlapArea(a: Box, c: Box): number {
  return Math.max(0, Math.min(a[2], c[2]) - Math.max(a[0], c[0])) * Math.max(0, Math.min(a[3], c[3]) - Math.max(a[1], c[1]));
}

/** Try the slots around a pin and keep the one whose label box collides least. */
function placeLabel(name: string, x: number, y: number, taken: Box[], vb: Frame) {
  const w = name.length * PIN_FONT * 0.56;
  const slots: { dx: number; dy: number; anchor: "start" | "end" }[] = [
    { dx: 9, dy: -8, anchor: "start" },
    { dx: -9, dy: -8, anchor: "end" },
    { dx: 9, dy: 15, anchor: "start" },
    { dx: -9, dy: 15, anchor: "end" },
    { dx: 11, dy: 4, anchor: "start" },
    { dx: -11, dy: 4, anchor: "end" },
    { dx: 9, dy: -21, anchor: "start" },
    { dx: -9, dy: -21, anchor: "end" },
  ];
  let best: { tx: number; ty: number; anchor: "start" | "end"; box: Box } | null = null;
  let bestCost = Infinity;
  for (const slot of slots) {
    const tx = x + slot.dx;
    const ty = y + slot.dy;
    const left = slot.anchor === "start" ? tx : tx - w;
    const box: Box = [left, ty - PIN_FONT + 1, left + w, ty + 3];
    const outside = Math.max(0, -box[0]) + Math.max(0, box[2] - vb.w) + Math.max(0, -box[1]) + Math.max(0, box[3] - vb.h);
    const cost = taken.reduce((sum, t) => sum + overlapArea(box, t), 0) + outside * 40;
    if (cost < bestCost) {
      best = { tx, ty, anchor: slot.anchor, box };
      bestCost = cost;
      if (!cost) break;
    }
  }
  return best!;
}

/**
 * Build the district map. With `focus`, the viewBox zooms to that taluk,
 * neighbours are dimmed, and its places are pinned.
 */
export function buildMapModel(focus = ""): MapModel {
  const focusFeature = focus ? features.find((f) => f.properties.id === focus) : undefined;
  const b = focusFeature ? expandBounds(boundsOf([focusFeature]), 0.22) : boundsOf(features);
  const vb = frameFor(b, Boolean(focusFeature));
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
    const showLabel = !focus || id === focus;
    return {
      id,
      name,
      d: featurePath(feature, b, vb),
      fill,
      focused,
      placeCount,
      label: showLabel
        ? { x: Number(lx.toFixed(1)), y: Number(ly.toFixed(1)), size, lineH: Math.round(size * 1.15), lines: splitLabel(name) }
        : null,
    };
  });

  const pins: MapPin[] = [];
  if (focus) {
    const spots = placesInTaluk(focus).flatMap((place) => {
      if (place.lng == null || place.lat == null) return [];
      const [x, y] = project(place.lng, place.lat, b, vb);
      return [{ place, x, y }];
    });
    // Pins and the taluk's own name are obstacles for every pin label.
    const taken: Box[] = spots.map(({ x, y }) => [x - PIN_R - 2, y - PIN_R - 2, x + PIN_R + 2, y + PIN_R + 2]);
    const own = shapes.find((s) => s.id === focus)?.label;
    if (own) {
      const w = Math.max(...own.lines.map((l) => l.length)) * own.size * 0.6;
      taken.push([own.x - w / 2, own.y - own.size / 2, own.x + w / 2, own.y + own.size / 2 + own.lineH * (own.lines.length - 1)]);
    }
    spots.forEach(({ place, x, y }) => {
      const slot = placeLabel(place.name, x, y, taken, vb);
      taken.push(slot.box);
      pins.push({
        id: place.id,
        name: place.name,
        x: Number(x.toFixed(1)),
        y: Number(y.toFixed(1)),
        fill: CATEGORY_COLOR[place.category] || "#2F6B3F",
        tx: Number(slot.tx.toFixed(1)),
        ty: Number(slot.ty.toFixed(1)),
        anchor: slot.anchor,
      });
    });
  }

  return { width: vb.w, height: vb.h, focus: focusFeature ? focus : "", shapes, pins };
}
