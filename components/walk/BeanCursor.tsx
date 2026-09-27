"use client";

import { useEffect, useRef } from "react";
import { useHydrated, useMediaQuery } from "@/components/ui/motion";

/** A roasted-bean pointer that trails the mouse and swells over controls. Fine pointers only. */
export function BeanCursor() {
  const coarse = useMediaQuery("(hover: none), (pointer: coarse)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  // Never in the static HTML: a touch device would show a stray bean until hydration.
  const live = useHydrated() && !coarse && !reduced;
  const ref = useRef<HTMLImageElement>(null);

  // Reduced motion keeps the bean as a plain static cursor.
  useEffect(() => {
    if (coarse || !reduced) return;
    const html = document.documentElement;
    html.classList.add("bean-cursor-static");
    return () => html.classList.remove("bean-cursor-static");
  }, [coarse, reduced]);

  useEffect(() => {
    const el = ref.current;
    if (!live || !el) return;
    const html = document.documentElement;
    html.classList.add("has-bean-cursor");
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let cx = x;
    let cy = y;
    let hot = false;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      hot = Boolean((e.target as Element | null)?.closest?.("a, button, [role='button'], input, textarea, select, label, .chip, summary"));
      el.classList.toggle("is-hot", hot);
    };
    const tick = () => {
      cx += (x - cx) * 0.28;
      cy += (y - cy) * 0.28;
      const dx = x - cx;
      const speed = Math.min(18, Math.hypot(dx, y - cy));
      const angle = -28 + dx * 0.35 + speed * 0.4;
      el.style.transform = `translate3d(${cx - 18}px,${cy - 18}px,0) rotate(${angle}deg) scale(${hot ? 1.18 : 1})`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      html.classList.remove("has-bean-cursor");
    };
  }, [live]);

  if (!live) return null;
  return <img ref={ref} className="bean-cursor" src="/assets/cursor-roast-bean.svg" alt="" width={36} height={36} aria-hidden="true" />;
}
