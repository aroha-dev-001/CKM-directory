"use client";

import { type CSSProperties, type SyntheticEvent, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "@/components/ui/motion";

export interface DriftItem {
  placeId: string;
  openPlace: boolean;
  image: string;
  title: string;
  kannada?: string;
  blurb: string;
}

export interface DriftConfig {
  columns: number;
  tileWidth: number;
  tileHeight: number;
  tilt: number;
  turn: number;
  roll: number;
  perspective: number;
  depth: number;
  parallax: number;
  lift: number;
  scale: number;
  shiftX: number;
  originX: string;
  /** Height of the stage, used to decide how many copies loop seamlessly. */
  containerHeight: number;
}

interface Props {
  items: DriftItem[];
  config: DriftConfig;
  onOpenPlace: (placeId: string) => void;
}

const GAP = 0;
const RADIUS = 10;
const SPEED = 44;
const VARIANCE = 0.22;
const FADE = 0.08;
const DIM = 1;

const preloadCache = new Map<string, Promise<string>>();

function preload(src: string): Promise<string> {
  let done = preloadCache.get(src);
  if (!done) {
    done = new Promise((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = img.onerror = () => resolve(src);
      img.src = src;
    });
    preloadCache.set(src, done);
  }
  return done;
}

/** Golden-ratio jitter so neighbouring columns never drift in lockstep. */
function columnFactor(index: number): number {
  return 1 + VARIANCE * (((index * 0.6180339887 + 0.35) % 1) * 2 - 1);
}

function markReady(img: HTMLImageElement | null) {
  if (img?.naturalWidth) img.classList.add("is-ready");
}

function retryImage(event: SyntheticEvent<HTMLImageElement>) {
  const img = event.currentTarget;
  const tries = Number(img.dataset.retries || 0);
  if (tries >= 2) return;
  img.dataset.retries = String(tries + 1);
  const src = img.getAttribute("src");
  if (!src) return;
  img.removeAttribute("src");
  preload(src).then(() => {
    if (img.isConnected) img.src = src;
  });
}

/**
 * React Bits DriftWall. Columns of stills scroll in alternating directions on a
 * tilted plane that leans toward the pointer. Clicking a still pauses the wall
 * and flips it to a short note; "Visitor notes" opens the place.
 */
export function DriftWall({ items, config, onOpenPlace }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [flipped, setFlipped] = useState<string | null>(null);
  const reduced = useReducedMotion();
  const { columns, tileWidth, tileHeight } = config;

  // Fill columns in order (not round-robin) so each column keeps one theme run.
  const columnItems = useMemo(() => {
    const cols: DriftItem[][] = Array.from({ length: columns }, () => []);
    const per = Math.ceil(items.length / columns);
    items.forEach((item, i) => cols[Math.min(columns - 1, Math.floor(i / per))].push(item));
    return cols.map((col) => (col.length ? col : items.slice(0, 1)));
  }, [items, columns]);

  const unit = tileHeight + GAP;
  const columnMeta = useMemo(
    () =>
      columnItems.map((col) => {
        const copyHeight = Math.max(unit, col.length * unit);
        const copies = Math.min(3, Math.max(2, Math.ceil(config.containerHeight / copyHeight) + 1));
        return { copyHeight, copies };
      }),
    [columnItems, unit, config.containerHeight]
  );

  // The animation loop reads these without re-subscribing.
  const live = useRef({ activeId, flipped, onOpenPlace });
  useEffect(() => {
    live.current = { activeId, flipped, onOpenPlace };
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const plane = root.querySelector<HTMLElement>(".drift-wall__plane");
    const tracks = Array.from(root.querySelectorAll<HTMLElement>("[data-track]"));
    const { tilt, turn, roll, depth, parallax, scale, shiftX } = config;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const base = columnMeta.map((_, c) => SPEED * columnFactor(c) * (c % 2 === 0 ? 1 : -1));
    const velocities = base.slice();
    const offsets = columnMeta.map(() => 0);
    const pointer = { x: 0, y: 0 };
    const damped = { x: 0, y: 0 };
    const pan = { x: shiftX, targetX: shiftX };
    let hoveredCol = -1;
    let press: { x: number; y: number; moved: boolean; tile: HTMLElement | null } | null = null;
    let lastTs: number | null = null;
    let raf = 0;

    const paused = () => Boolean(live.current.flipped);

    const tileAtPoint = (x: number, y: number): HTMLElement | null => {
      const tiles = Array.from(root.querySelectorAll<HTMLElement>(".drift-wall__tile"));
      let best: HTMLElement | null = null;
      let bestDist = Infinity;
      for (const tile of tiles) {
        const r = tile.getBoundingClientRect();
        if (r.width < 8 || r.height < 8) continue;
        const inside = x >= r.left - 10 && x <= r.right + 10 && y >= r.top - 10 && y <= r.bottom + 10;
        const dist = (x - (r.left + r.right) / 2) ** 2 + (y - (r.top + r.bottom) / 2) ** 2;
        if (inside && dist < bestDist) {
          bestDist = dist;
          best = tile;
        }
      }
      if (best) return best;
      for (const tile of tiles) {
        const r = tile.getBoundingClientRect();
        const dist = (x - (r.left + r.right) / 2) ** 2 + (y - (r.top + r.bottom) / 2) ** 2;
        if (dist < bestDist && dist < 110 * 110) {
          bestDist = dist;
          best = tile;
        }
      }
      return best;
    };

    const animate = (ts: number) => {
      if (lastTs === null) lastTs = ts;
      const dt = Math.min(0.05, Math.max(0, ts - lastTs) / 1000);
      lastTs = ts;
      const still = paused();
      const damp = 1 - Math.exp(-dt / 0.12);
      const maxTilt = parallax * 8;
      damped.x += ((still ? 0 : pointer.x * maxTilt) - damped.x) * damp;
      damped.y += ((still ? 0 : -pointer.y * maxTilt) - damped.y) * damp;
      // A flipped card pans toward the middle of the wall so it can be read.
      pan.targetX = still ? shiftX + ((columns - 1) / 2 - hoveredCol) * tileWidth * 0.82 : shiftX;
      pan.x += (pan.targetX - pan.x) * (1 - Math.exp(-dt / 0.18));
      if (plane) {
        const yaw = still ? turn * 0.15 : turn;
        const pitch = still ? tilt * 0.35 : tilt;
        const px = still ? 0 : damped.x;
        const py = still ? 0 : damped.y;
        plane.style.transform =
          `translate(-50%, -46%) translate(${pan.x.toFixed(1)}px, 0px) scale(${scale}) ` +
          `rotateX(${pitch + py}deg) rotateY(${yaw + px}deg) rotateZ(${roll}deg) translateZ(${-depth}px)`;
      }
      tracks.forEach((el, c) => {
        const meta = columnMeta[c];
        if (!meta) return;
        if (!mq.matches) {
          // A flip stops the wall dead; a press lets it coast to a stop.
          if (still) velocities[c] = 0;
          else if (press) velocities[c] += (0 - velocities[c]) * (1 - Math.exp(-dt / 0.16));
          else velocities[c] = base[c];
          offsets[c] = (((offsets[c] + velocities[c] * dt) % meta.copyHeight) + meta.copyHeight) % meta.copyHeight;
        }
        el.style.transform = `translate3d(0, ${-offsets[c]}px, ${(c - (tracks.length - 1) / 2) * 36}px)`;
      });
      raf = requestAnimationFrame(animate);
    };

    const flip = (tile: HTMLElement) => {
      const placeId = tile.dataset.placeId || tile.dataset.tileId || "";
      if (!placeId) return;
      if (live.current.flipped === placeId) {
        clearFlip();
        return;
      }
      hoveredCol = Number(tile.dataset.col);
      setFlipped(placeId);
      setActiveId(tile.dataset.tileId || null);
    };

    const clearFlip = () => {
      hoveredCol = -1;
      setFlipped(null);
      setActiveId(null);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      if (parallax > 0 && !mq.matches) {
        pointer.x = (e.clientX - rect.left) / rect.width - 0.5;
        pointer.y = (e.clientY - rect.top) / rect.height - 0.5;
      }
      if (press && (e.clientX - press.x) ** 2 + (e.clientY - press.y) ** 2 > 144) press.moved = true;
      if (paused()) return;
      const tile = tileAtPoint(e.clientX, e.clientY);
      if (!tile || tile.dataset.tileId === live.current.activeId) return;
      hoveredCol = Number(tile.dataset.col);
      setActiveId(tile.dataset.tileId || null);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      press = { x: e.clientX, y: e.clientY, moved: false, tile: tileAtPoint(e.clientX, e.clientY) };
    };

    const onPointerUp = (e: PointerEvent) => {
      const start = press;
      press = null;
      if (!start || start.moved) return;
      const hit = document.elementFromPoint(e.clientX, e.clientY);
      const open = hit?.closest<HTMLElement>("[data-open-place]");
      if (open && root.contains(open)) {
        const id = open.dataset.openPlace;
        if (id) live.current.onOpenPlace(id);
        return;
      }
      const tile = tileAtPoint(e.clientX, e.clientY) || start.tile;
      if (!tile || !root.contains(tile)) {
        if (paused()) clearFlip();
        return;
      }
      flip(tile);
    };

    // Taps are handled on pointerup; keep the tile buttons from also "clicking".
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-open-place]")) {
        e.preventDefault();
        e.stopPropagation();
      } else if (target.closest("[data-tile-id]")) {
        e.preventDefault();
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && paused()) clearFlip();
    };

    const onLeave = () => {
      pointer.x = 0;
      pointer.y = 0;
      if (!paused()) {
        hoveredCol = -1;
        setActiveId(null);
      }
    };

    const onCancel = () => {
      press = null;
    };

    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointercancel", onCancel);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("click", onClick);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("keydown", onKey);
    root.querySelectorAll("img").forEach(markReady);
    new Set(items.map((item) => item.image)).forEach((src) => preload(src));
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointercancel", onCancel);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("click", onClick);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("keydown", onKey);
    };
  }, [items, config, columnMeta, columns, tileWidth]);

  const style = {
    "--dw-tile-w": `${tileWidth}px`,
    "--dw-tile-h": `${tileHeight}px`,
    "--dw-gap": `${GAP}px`,
    "--dw-radius": `${RADIUS}px`,
    "--dw-perspective": `${config.perspective}px`,
    "--dw-lift": `${config.lift}px`,
    "--dw-dim": String(DIM),
    "--dw-gray": "0",
    "--dw-overlay": "transparent",
    "--dw-overlay-opacity": "0",
    "--dw-edge": `${Math.max(0, (1 - FADE) * 100)}%`,
    "--dw-origin-x": config.originX,
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={`drift-wall${reduced ? " drift-wall--reduced" : ""}`}
      style={style}
      role="group"
      aria-label="Drifting wall of places. Click a still to pause and read."
    >
      <div className="drift-wall__plane">
        {columnItems.map((col, c) => (
          <div className="drift-wall__col" key={c}>
            <div className="drift-wall__track" data-track={c}>
              {Array.from({ length: columnMeta[c].copies }, (_, copy) =>
                col.map((item, i) => {
                  const id = `${c}-${copy}-${i}`;
                  const isFlipped = Boolean(flipped) && item.placeId === flipped;
                  const isActive = id === activeId || isFlipped;
                  return (
                    <button
                      type="button"
                      key={id}
                      className={`drift-wall__tile${isActive ? " is-active" : ""}${isFlipped ? " is-flipped" : ""}`}
                      data-tile-id={id}
                      data-col={c}
                      data-place-id={item.placeId}
                      aria-label={item.title}
                    >
                      <span className="drift-wall__flip">
                        <span className="drift-wall__face drift-wall__inner">
                          <img
                            src={item.image}
                            alt={item.title}
                            width={600}
                            height={400}
                            loading="eager"
                            decoding="async"
                            fetchPriority={copy === 0 ? "high" : undefined}
                            draggable={false}
                            onLoad={(e) => markReady(e.currentTarget)}
                            onError={retryImage}
                          />
                          <span className="drift-wall__overlay" aria-hidden="true" />
                        </span>
                        <span className="drift-wall__face drift-wall__face--back">
                          <strong>{item.title}</strong>
                          {item.kannada && <span className="kn">{item.kannada}</span>}
                          <p>{item.blurb}</p>
                          {item.openPlace && item.placeId && (
                            <span className="drift-wall__more" data-open-place={item.placeId}>
                              Visitor notes
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
