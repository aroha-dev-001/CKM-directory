"use client";

import { type CSSProperties, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { prefersReduced, useReducedMotion } from "@/components/ui/motion";
import type { MapModel } from "@/lib/map-model";

type Box = [number, number, number, number];
type Segment = [number, number, number, number];

/** A placed label: its chip's top-left relative to the pin, plus a leader line when it sits away from the dot. */
interface Spot {
  x: number;
  y: number;
  lead?: Segment;
}

/** Half-size of the keep-out square around every dot. */
const DOT = 9;
/** Rendered dot radius (`.tpin-dot` is 13px). */
const DOT_R = 6.5;
/** A chip right beside its dot; past this distance it gets a leader line. */
const NEAR = 10;
const FAR = [30, 52, 80];
/** Directions to try, best first (degrees, y down): beside, diagonals, then above and below. */
const NEAR_DIRS = [0, 180, -40, 40, -140, 140, -90, 90];
const FAR_DIRS = [0, 180, -30, 30, -150, 150, -60, 60, -120, 120, -90, 90];
const TRIES = [...NEAR_DIRS.map((d) => [d, NEAR]), ...FAR.flatMap((r) => FAR_DIRS.map((d) => [d, r]))];

/** The chip box for a direction and distance: the chip grows away from the pin from that point. */
function slot(deg: number, r: number, w: number, h: number): { box: Box; end: [number, number]; dir: [number, number] } {
  const a = (deg * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const ex = r * dx;
  const ey = r * dy;
  const left = dx > 0.35 ? ex : dx < -0.35 ? ex - w : ex - w / 2;
  const top = dy > 0.35 ? ey : dy < -0.35 ? ey - h : ey - h / 2;
  return { box: [left, top, left + w, top + h], end: [ex, ey], dir: [dx, dy] };
}

const overlaps = (a: Box, b: Box) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];

/** Liang–Barsky: does the segment pass through the box? */
function crosses([x1, y1, x2, y2]: Segment, b: Box): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const p = [-dx, dx, -dy, dy];
  const q = [x1 - b[0], b[2] - x1, y1 - b[1], b[3] - y1];
  let t0 = 0;
  let t1 = 1;
  for (let i = 0; i < 4; i += 1) {
    if (p[i] === 0) {
      if (q[i] < 0) return false;
      continue;
    }
    const t = q[i] / p[i];
    if (p[i] < 0) {
      if (t > t1) return false;
      t0 = Math.max(t0, t);
    } else {
      if (t < t0) return false;
      t1 = Math.min(t1, t);
    }
  }
  return true;
}

/**
 * idle  → nothing shown yet (waiting to scroll into view)
 * zoom  → the district fades in and the camera flies to the taluk
 * done  → outline traced, name and pins revealed
 */
type Phase = "idle" | "zoom" | "done";

const ZOOM_MS = 1500;
const ZOOM_DELAY_MS = 450;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/** One taluk with its places pinned: zooms in from the whole district, then labels every pin it has room for. */
export function TalukMap({
  model,
  label,
  onPlace,
}: {
  model: MapModel;
  label: string;
  onPlace: (id: string) => void;
}) {
  const { width: W, height: H, district } = model;
  const canvasRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<SVGGElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  // Reduced motion (or no district box to start from) skips the entrance and shows the finished map.
  const still = useReducedMotion() || !district;
  /** Per pin: where its label goes, or null when there is no room (it then shows on hover). Empty until measured. */
  const [spots, setSpots] = useState<Record<string, Spot | null>>({});

  const focusShape = model.shapes.find((s) => s.id === model.focus);
  const neighbours = model.shapes.filter((s) => s.id !== model.focus);

  // Label layout runs in screen pixels, because the chips keep their size while the map scales.
  const layout = useCallback(() => {
    const overlay = overlayRef.current;
    const canvas = canvasRef.current;
    if (!overlay || !canvas) return;
    const box = overlay.getBoundingClientRect();
    const frame = canvas.getBoundingClientRect();
    if (!box.width || !box.height) return;
    // How many screen px one viewBox unit is; the traced outline divides by it.
    canvas.style.setProperty("--map-k", String(box.width / W));
    // Stay clear of the faded edges of the canvas.
    const mx = frame.width * 0.06;
    const my = frame.height * 0.06;
    const bounds: Box = [
      frame.left - box.left + mx,
      frame.top - box.top + my,
      frame.right - box.left - mx,
      frame.bottom - box.top - my,
    ];
    const at = (x: number, y: number): [number, number] => [(x / W) * box.width, (y / H) * box.height];

    const within = (b: Box) => b[0] >= bounds[0] && b[1] >= bounds[1] && b[2] <= bounds[2] && b[3] <= bounds[3];

    const points = model.pins.map((p) => at(p.x, p.y));
    const dots: Box[] = points.map(([x, y]) => [x - DOT, y - DOT, x + DOT, y + DOT]);
    // Placed chips plus the taluk's name; leaders are kept apart so chips do not cover them either.
    const blocks: Box[] = [];
    const leads: Segment[] = [];
    const name = overlay.querySelector<HTMLElement>(".taluk-map-name");
    if (name) {
      const r = name.getBoundingClientRect();
      blocks.push([r.left - box.left - 4, r.top - box.top - 4, r.right - box.left + 4, r.bottom - box.top + 4]);
    }

    // Pins arrive most-visited first, so the best-known places claim the room nearest their dots.
    const next: Record<string, Spot | null> = {};
    model.pins.forEach((p, i) => {
      const chip = overlay.querySelector<HTMLElement>(`[data-pin="${p.id}"] .tpin-label`);
      if (!chip) return;
      const w = chip.offsetWidth;
      const h = chip.offsetHeight;
      const [x, y] = points[i];
      const others = dots.filter((_, j) => j !== i);
      next[p.id] = null;
      // First pass keeps leaders clear of every dot. In a tight cluster that can leave the best-known
      // places unnamed, so a second pass lets a leader run under other dots (never through a label).
      for (const strict of [true, false]) {
        for (const [deg, r] of strict ? TRIES : TRIES.filter(([, r]) => r > NEAR)) {
          const { box: rel, end, dir } = slot(deg, r, w, h);
          const abs: Box = [x + rel[0], y + rel[1], x + rel[2], y + rel[3]];
          if (!within(abs) || others.some((d) => overlaps(abs, d)) || blocks.some((b) => overlaps(abs, b))) continue;
          if (leads.some((l) => crosses(l, abs))) continue;
          let lead: Segment | undefined;
          let line: Segment | undefined;
          if (r > NEAR) {
            lead = [dir[0] * (DOT_R + 1.5), dir[1] * (DOT_R + 1.5), end[0], end[1]];
            line = [x + lead[0], y + lead[1], x + lead[2], y + lead[3]];
            if (blocks.some((b) => crosses(line!, b)) || (strict && others.some((d) => crosses(line!, d)))) continue;
          }
          if (line) leads.push(line);
          blocks.push(abs);
          next[p.id] = { x: rel[0], y: rel[1], lead };
          break;
        }
        if (next[p.id]) break;
      }
    });
    setSpots(next);
  }, [model.pins, W, H]);

  useLayoutEffect(() => {
    layout();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => layout());
    ro.observe(canvas);
    // Chip widths change once the web font arrives.
    document.fonts?.ready.then(() => layout());
    return () => ro.disconnect();
  }, [layout]);

  // Play the entrance once, when the map is mostly on screen.
  useEffect(() => {
    const canvas = canvasRef.current;
    const g = zoomRef.current;
    if (!canvas || !g) return;
    if (prefersReduced() || !district) return;

    let frame = 0;
    let timer = 0;
    const camera = (z: number, cx: number, cy: number) => {
      g.style.transform = `translate(${W / 2 - z * cx}px, ${H / 2 - z * cy}px) scale(${z})`;
    };

    const start = () => {
      // Frame the whole district inside the visible canvas, whatever its shape.
      const rect = canvas.getBoundingClientRect();
      const k = Math.min(rect.width / W, rect.height / H) || 1;
      const z0 = Math.min(1, ((rect.width / k) * 0.8) / district.w, ((rect.height / k) * 0.8) / district.h);
      const c0x = district.x + district.w / 2;
      const c0y = district.y + district.h / 2;
      camera(z0, c0x, c0y);
      setPhase("zoom");

      timer = window.setTimeout(() => {
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = easeInOutCubic(Math.min(1, (now - t0) / ZOOM_MS));
          // Zoom geometrically so the approach feels like a steady camera move, not a lurch at the end.
          const z = z0 * (1 / z0) ** p;
          camera(z, c0x + (W / 2 - c0x) * p, c0y + (H / 2 - c0y) * p);
          if (p < 1) frame = requestAnimationFrame(tick);
          else {
            g.style.transform = "";
            setPhase("done");
          }
        };
        frame = requestAnimationFrame(tick);
      }, ZOOM_DELAY_MS);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          start();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(canvas);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      g.style.transform = "";
    };
  }, [W, H, district]);

  const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(3)}%`;

  return (
    <div className="taluk-map" data-phase={still ? "done" : phase}>
      <div className="taluk-map-canvas" ref={canvasRef} style={{ "--map-ar": W / H } as CSSProperties}>
        <svg className="taluk-map-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${label} taluk within Chikkamagaluru district`}>
          <defs>
            <filter id="taluk-lift" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#14361f" floodOpacity="0.28" />
            </filter>
          </defs>
          <g className="taluk-map-zoom" ref={zoomRef}>
            {neighbours.map((s) => (
              <path key={s.id} className="taluk-map-neighbour" d={s.d} />
            ))}
            {focusShape && (
              <>
                <path className="taluk-map-focus" d={focusShape.d} />
                <path className="taluk-map-trace" d={focusShape.d} pathLength={1} />
              </>
            )}
          </g>
        </svg>
        <div className="taluk-map-overlay" ref={overlayRef}>
          {model.nameAt && focusShape && (
            // The short map label (N.R. Pura, not Narasimharajapura): nameAt was chosen for its width.
            <p className="taluk-map-name" style={{ left: pct(model.nameAt.x, W), top: pct(model.nameAt.y, H) }}>
              {focusShape.name}
            </p>
          )}
          {model.pins.map((p, i) => {
            const spot = spots[p.id];
            return (
              <button
                key={p.id}
                type="button"
                className="tpin"
                data-pin={p.id}
                data-measured={p.id in spots ? "" : undefined}
                data-placed={spot ? "" : undefined}
                style={{ left: pct(p.x, W), top: pct(p.y, H), "--pin": p.fill, "--i": i } as CSSProperties}
                aria-label={`${p.name}: jump to its notes`}
                onClick={() => onPlace(p.id)}
              >
                {spot?.lead && (
                  <svg className="tpin-leader" width="1" height="1" aria-hidden="true">
                    <line x1={spot.lead[0]} y1={spot.lead[1]} x2={spot.lead[2]} y2={spot.lead[3]} />
                    <line x1={spot.lead[0]} y1={spot.lead[1]} x2={spot.lead[2]} y2={spot.lead[3]} />
                  </svg>
                )}
                <span className="tpin-dot" aria-hidden="true" />
                <span className="tpin-label" aria-hidden="true" style={spot ? { left: spot.x, top: spot.y } : undefined}>
                  {p.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
