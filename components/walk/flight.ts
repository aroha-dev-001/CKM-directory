/* Bean to cup flight controller: glide-snap between stops, keyboard stepping,
   the veil cut for long jumps, and scrims that track their copy's opacity.
   The scroll engine itself is lib/scrollcraft.js (the Bloom Biotech runtime). */
import type { WaypointDetail } from "@/lib/scrollcraft";

export type JumpMode = "auto" | "glide" | "instant";

export interface FlightOptions {
  /** Number of beats (stops) in the flight. */
  count: number;
  /** Viewport-heights of scroll per beat; must match data-sc-w on the segments. */
  legW: number;
  onWaypoint(index: number): void;
  onVeil(on: boolean): void;
  /** Every scroll: position, flight progress 0..1, and whether `y` is still inside the flight. */
  onScroll(state: { y: number; progress: number; inFlight: (y: number) => boolean }): void;
}

export interface Flight {
  jump(index: number, mode?: JumpMode): void;
  destroy(): void;
}

const clamp = (x: number, a: number, b: number) => (x < a ? a : x > b ? b : x);
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export async function startFlight(world: HTMLElement, opts: FlightOptions): Promise<Flight> {
  const { mount } = await import("@/lib/scrollcraft");
  const cleanups: (() => void)[] = [];
  const on = <K extends keyof WindowEventMap>(type: K, fn: (e: WindowEventMap[K]) => void, options?: AddEventListenerOptions) => {
    window.addEventListener(type, fn, options);
    cleanups.push(() => window.removeEventListener(type, fn, options));
  };
  let alive = true;

  // ---- scroll engine -------------------------------------------------------
  const api = mount(world);
  // Every distance below is in the engine's viewport height, which (unlike
  // innerHeight) stays put while a phone's address bar slides in and out.
  const vh = () => api.vh || innerHeight;

  // ---- geometry: stops are where the glide comes to rest ----------------
  // Every beat rests mid-leg (copy at full strength), except the first (the
  // hero is up from pixel 0) and the last (the finale holds at track end).
  const TOTAL = opts.count * opts.legW;
  const STOPS = Array.from({ length: opts.count }, (_, i) =>
    i === 0 ? 0 : i === opts.count - 1 ? TOTAL : (i + 0.5) * opts.legW
  );
  let worldTop = 0;
  const E = (i: number) =>
    Math.min(Math.round(worldTop + STOPS[i] * vh()), Math.max(0, document.documentElement.scrollHeight - innerHeight));
  const flightEnd = () => worldTop + TOTAL * vh();
  const inFlight = (y: number) => y <= flightEnd() + 4;

  // ---- glide-snap (Bloom's hermite glide) ---------------------------------
  type Glide = { from: number; to: number; start: number; dur: number; m0: number; last: number; raf: number };
  let glide: Glide | null = null;
  let snapTimer = 0;
  let target = -1;
  let dir = 0;
  let lastY = 0;
  let touching = false;
  let cutting = 0;
  const go = (y: number) => window.scrollTo({ top: y, behavior: "instant" });

  const nearest = (y: number) => {
    let t = 0;
    for (let r = 1; r < STOPS.length; r++) if (Math.abs(E(r) - y) < Math.abs(E(t) - y)) t = r;
    return t;
  };
  const stopGlide = () => {
    if (glide) cancelAnimationFrame(glide.raf);
    glide = null;
  };
  const glideTo = (i: number) => {
    const from = window.scrollY;
    const to = E(i);
    const d = to - from;
    target = i;
    if (Math.abs(d) <= 1) return stopGlide();
    const dur = clamp(500 + (480 * Math.abs(d)) / vh(), 560, 1400);
    const now = performance.now();
    let m0 = 0;
    if (glide) {
      // Carry the current velocity into the new glide so a re-target never jolts.
      const e = clamp((now - glide.start) / glide.dur, 0, 1);
      m0 = clamp((((glide.to - glide.from) * (glide.m0 * (3 * e * e - 4 * e + 1) + 6 * e - 6 * e * e)) / glide.dur) * (dur / d), 0, 2);
      cancelAnimationFrame(glide.raf);
    }
    glide = { from, to, start: now, dur, m0, last: from, raf: 0 };
    glide.raf = requestAnimationFrame(step);
  };
  function step(ts: number) {
    const g = glide;
    if (!g) return;
    const y = window.scrollY;
    if (Math.abs(y - g.last) > 2) {
      // The reader took over.
      dir = Math.sign(y - g.last);
      stopGlide();
      snapSoon();
      return;
    }
    const a = clamp((ts - g.start) / g.dur, 0, 1);
    const n = Math.round(g.from + (g.to - g.from) * (g.m0 * (a * a * a - 2 * a * a + a) + (3 * a * a - 2 * a * a * a)));
    go(n);
    g.last = n;
    if (a < 1) g.raf = requestAnimationFrame(step);
    else glide = null;
  }
  const pick = (y: number, d: number) => {
    const r = nearest(y);
    if (!d || Math.abs(E(r) - y) <= 2) return r;
    let a = -1;
    for (let t = 0; t < STOPS.length; t++) if (E(t) <= y) a = t;
    if (a < 0) return 0;
    if (a >= STOPS.length - 1) return STOPS.length - 1;
    const lo = E(a);
    const hi = E(a + 1);
    const th = Math.min(0.2 * (hi - lo), 0.06 * vh());
    return d > 0 ? (y - lo > th ? a + 1 : a) : hi - y > th ? a : a + 1;
  };
  const settle = () => {
    clearTimeout(snapTimer);
    if (glide || cutting || touching || reduced()) return;
    const y = window.scrollY;
    if (!inFlight(y)) {
      // Free scroll after the flight.
      dir = 0;
      return;
    }
    const i = pick(y, dir);
    dir = 0;
    if (Math.abs(E(i) - y) > 1) glideTo(i);
  };
  const snapSoon = (ms = 180) => {
    clearTimeout(snapTimer);
    snapTimer = window.setTimeout(settle, ms);
  };

  // Long jumps (rail clicks far away) cut behind a veil instead of flying
  // through ten chapters at speed.
  const cutTo = (i: number) => {
    stopGlide();
    target = i;
    const id = ++cutting;
    opts.onVeil(true);
    window.setTimeout(() => {
      if (id !== cutting || !alive) return;
      go(E(i));
      lastY = window.scrollY;
      window.setTimeout(() => {
        if (id !== cutting || !alive) return;
        opts.onVeil(false);
        cutting = 0;
      }, 180);
    }, 240);
  };
  const jump = (index: number, mode: JumpMode = "glide") => {
    const i = clamp(index, 0, STOPS.length - 1);
    clearTimeout(snapTimer);
    if (mode === "instant" || reduced()) {
      stopGlide();
      target = i;
      go(E(i));
      return;
    }
    const far = Math.abs(E(i) - window.scrollY) / vh() > 2.4;
    if ((mode === "auto" && far) || cutting) cutTo(i);
    else glideTo(i);
  };

  const measure = () => {
    worldTop = api.worlds[0]?.top ?? 0;
  };
  measure();

  const onWaypoint = (event: Event) => opts.onWaypoint((event as CustomEvent<WaypointDetail>).detail.index);
  document.addEventListener("sc:waypoint", onWaypoint);
  cleanups.push(() => document.removeEventListener("sc:waypoint", onWaypoint));

  // Fonts and late images move the flight's top; lay out again once they land.
  const relayout = () => {
    if (!alive) return;
    window.dispatchEvent(new Event("resize"));
    api.layout();
    measure();
    snapSoon(0);
  };
  if (document.readyState === "complete") relayout();
  else on("load", relayout, { once: true });
  document.fonts?.ready.then(relayout);
  on("resize", measure, { passive: true });

  // Scrims track their copy block's opacity frame by frame, so the darkening
  // arrives and leaves with the words instead of sitting on the picture.
  const pairs = Array.from(world.querySelectorAll<HTMLElement>("[data-scrim-for]")).map((scrim) => ({
    scrim,
    copy: world.querySelector<HTMLElement>(`[data-copy-id="${scrim.dataset.scrimFor}"]`),
    last: "",
  }));
  let scrimRaf = 0;
  const scrimLoop = () => {
    scrimRaf = requestAnimationFrame(scrimLoop);
    for (const p of pairs) {
      const o = p.copy?.style.opacity || "0";
      if (o !== p.last) {
        p.scrim.style.opacity = o;
        p.last = o;
      }
    }
  };
  scrimLoop();
  cleanups.push(() => cancelAnimationFrame(scrimRaf));

  // After the flight the close section slides up over the fixed stage. Fade the
  // copy (and its scrims) out over the first third of a screen so the finale's
  // words do not show through the close section's gradient.
  const copyLayer = world.querySelector<HTMLElement>("[data-sc-world-copy]");
  const fadeCopy = (y: number) => {
    if (!copyLayer) return;
    const past = (y - flightEnd()) / (0.3 * vh());
    copyLayer.style.opacity = past > 0 ? String(clamp(1 - past, 0, 1).toFixed(3)) : "";
  };

  // ---- snap wiring -----------------------------------------------------------
  const hasEnd = "onscrollend" in window;
  lastY = window.scrollY;
  on(
    "scroll",
    () => {
      const y = window.scrollY;
      fadeCopy(y);
      opts.onScroll({ y, progress: clamp((y - worldTop) / Math.max(1, TOTAL * vh()), 0, 1), inFlight });
      if (glide || cutting) {
        lastY = y;
        return;
      }
      if (Math.abs(y - lastY) > 0.5) dir = Math.sign(y - lastY);
      lastY = y;
      clearTimeout(snapTimer);
      if (!hasEnd) snapSoon();
    },
    { passive: true }
  );
  if (hasEnd)
    on("scrollend", () => {
      if (!glide && !cutting) settle();
    });
  on(
    "touchstart",
    () => {
      touching = true;
      stopGlide();
      clearTimeout(snapTimer);
    },
    { passive: true }
  );
  const up = (e: TouchEvent) => {
    if (!e.touches.length) {
      touching = false;
      snapSoon();
    }
  };
  on("touchend", up, { passive: true });
  on("touchcancel", up, { passive: true });
  let width = innerWidth;
  on(
    "resize",
    () => {
      if (innerWidth !== width) {
        width = innerWidth;
        stopGlide();
        snapSoon(260);
      }
    },
    { passive: true }
  );

  on("keydown", (e) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const el = e.target instanceof Element ? e.target : null;
    if (el?.closest("input, textarea, select, [contenteditable]")) return;
    if (!inFlight(window.scrollY) && e.key !== "Home") return;
    const cur = target >= 0 && (glide || cutting) ? target : nearest(window.scrollY);
    let to: number;
    let mode: JumpMode = "glide";
    switch (e.key) {
      case "ArrowDown":
      case "PageDown":
        to = cur + 1;
        break;
      case "ArrowUp":
      case "PageUp":
        to = cur - 1;
        break;
      case " ":
        if (el?.closest("a, button, summary, [role='button']")) return;
        to = cur + (e.shiftKey ? -1 : 1);
        break;
      case "Home":
        to = 0;
        mode = "auto";
        break;
      case "End":
        to = STOPS.length - 1;
        mode = "auto";
        break;
      default:
        return;
    }
    // Past the last beat, let the page carry on to the close.
    if (to > STOPS.length - 1) return;
    e.preventDefault();
    jump(to, mode);
  });

  // Tabbing into a copy block that is not on screen lands on its stop.
  const onFocus = (e: FocusEvent) => {
    const t = (e.target as Element | null)?.closest?.<HTMLElement>("[data-stop]");
    if (t && parseFloat(getComputedStyle(t).opacity || "0") <= 0.9) jump(Number(t.dataset.stop), "instant");
  };
  document.addEventListener("focusin", onFocus);
  cleanups.push(() => document.removeEventListener("focusin", onFocus));

  opts.onScroll({ y: window.scrollY, progress: 0, inFlight });

  return {
    jump,
    destroy() {
      alive = false;
      stopGlide();
      clearTimeout(snapTimer);
      cleanups.splice(0).forEach((fn) => fn());
      api.destroy();
    },
  };
}
