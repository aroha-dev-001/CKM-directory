"use client";

import gsap from "gsap";
import Link from "next/link";
import { type CSSProperties, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { prefersReduced } from "@/components/ui/motion";

export interface AccordionItem {
  image: string;
  link: string;
  kicker: string;
  title: string;
  lede: string;
  more: string;
  alt: string;
}

interface Props {
  items: AccordionItem[];
  active: number;
  onActiveChange: (index: number) => void;
  label: string;
}

const HEIGHT = 430;
const GAP = 12;
const RADIUS = 22;
const EXPAND = 0.46;
const TILT = 7;
const PARALLAX = 0.45;
const DURATION = 0.78;
const EASE = "power3.out";
const STACK_QUERY = "(max-width: 720px)";

/**
 * React Bits AccordionGallery. Wide screens: the active panel grows while the
 * others tilt away, on hover, focus or tap. Phones: panels stack and the one
 * under the reading line opens as you scroll.
 */
export function AccordionGallery({ items, active, onActiveChange, label }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panels = useRef<(HTMLAnchorElement | null)[]>([]);
  const medias = useRef<(HTMLSpanElement | null)[]>([]);
  const copies = useRef<(HTMLSpanElement | null)[]>([]);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const mediaSize = useRef(320);
  const animateNext = useRef(false);
  const activeRef = useRef(active);
  const [stack, setStack] = useState(false);
  const count = items.length;

  const applyLayout = useCallback(
    (animate: boolean) => {
      const root = rootRef.current;
      if (!root) return;
      const current = activeRef.current;
      const stacked = root.classList.contains("accordion-gallery--stack");
      if (stacked) {
        const vv = window.visualViewport;
        const vh = vv?.height || window.innerHeight || 800;
        const open = Math.max(280, Math.round(Math.min(vh * 0.62, vh - 120)));
        root.style.setProperty("--ag-open-h", `${open}px`);
        root.style.setProperty("--ag-compact-h", "76px");
        panels.current.forEach((panel, i) => {
          if (!panel) return;
          const on = i === current;
          panel.style.height = `${on ? open : 76}px`;
          panel.style.minHeight = "0";
          panel.style.maxHeight = "none";
          panel.style.flexGrow = "0";
          panel.style.transform = "none";
          panel.style.setProperty("--ag-dim", on ? "0.12" : "0.42");
          const copy = copies.current[i];
          if (copy) {
            copy.style.opacity = on ? "1" : "0";
            copy.style.transform = on ? "none" : "translateY(8px)";
          }
        });
        return;
      }
      const grow = count > 1 ? (EXPAND * (count - 1)) / (1 - EXPAND) : 1;
      const dur = animate && !prefersReduced() ? DURATION : 0;
      timeline.current?.kill();
      const tl = gsap.timeline();
      timeline.current = tl;
      panels.current.forEach((panel, i) => {
        if (!panel) return;
        const on = i === current;
        const shift = Math.max(-1.5, Math.min(1.5, current - i)) * PARALLAX * mediaSize.current * 0.06;
        tl.to(panel, { flexGrow: on ? grow : 1, rotateY: on ? 0 : i < current ? TILT : -TILT, "--ag-dim": on ? 0.12 : 0.42, duration: dur, ease: EASE }, 0);
        const media = medias.current[i];
        if (media) {
          tl.to(media, { xPercent: -50, yPercent: -50, x: on ? 0 : shift, y: 0, scale: 1, "--ag-gray": 0, duration: dur, ease: EASE }, 0);
        }
        const copy = copies.current[i];
        if (copy) {
          if (on) tl.to(copy, { opacity: 1, y: 0, duration: dur, ease: EASE }, 0);
          else tl.to(copy, { opacity: 0, y: 12, duration: dur * 0.45, ease: EASE }, 0);
        }
      });
    },
    [count]
  );

  // Size the row (or the stack) and lay the panels out without animation.
  const measure = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const stacked = window.matchMedia(STACK_QUERY).matches;
    root.classList.toggle("accordion-gallery--stack", stacked);
    setStack(stacked);
    if (stacked) {
      root.style.height = "auto";
      root.style.setProperty("--ag-media-size", "100%");
    } else {
      panels.current.forEach((panel) => {
        if (!panel) return;
        panel.style.height = "";
        panel.style.minHeight = "";
        panel.style.maxHeight = "";
      });
      const usable = Math.max(root.getBoundingClientRect().width - GAP * (count - 1), 120);
      mediaSize.current = Math.max(140, usable * EXPAND * 1.22);
      root.style.height = `${HEIGHT}px`;
      root.style.setProperty("--ag-media-size", `${mediaSize.current}px`);
    }
    applyLayout(false);
  }, [applyLayout, count]);

  useLayoutEffect(() => {
    activeRef.current = active;
    applyLayout(animateNext.current);
    animateNext.current = true;
  }, [active, applyLayout]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const stackQuery = window.matchMedia(STACK_QUERY);
    let lastWidth = root.clientWidth;
    const ro = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? root.clientWidth;
      if (Math.abs(width - lastWidth) < 8 && stackQuery.matches) return;
      lastWidth = width;
      measure();
    });
    ro.observe(root);
    measure();

    // Phones: the panel that has crossed the upper reading line is the open one.
    let ticking = false;
    const pick = () => {
      ticking = false;
      if (!stackQuery.matches) return;
      const vv = window.visualViewport;
      const top = vv?.offsetTop || 0;
      const height = vv?.height || window.innerHeight || 800;
      const line = top + height * 0.22;
      const els = panels.current.filter((p): p is HTMLAnchorElement => Boolean(p));
      let best = 0;
      els.forEach((panel, i) => {
        if (panel.getBoundingClientRect().top <= line) best = i;
      });
      if (els[best] && els[best].getBoundingClientRect().bottom < line + 48 && best < els.length - 1) {
        if (els[best + 1].getBoundingClientRect().top < top + height * 0.78) best += 1;
      }
      if (best !== activeRef.current) onActiveChange(best);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(pick);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    window.visualViewport?.addEventListener("resize", onScroll, { passive: true });
    stackQuery.addEventListener("change", measure);
    pick();
    return () => {
      timeline.current?.kill();
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.visualViewport?.removeEventListener("resize", onScroll);
      stackQuery.removeEventListener("change", measure);
    };
  }, [measure, onActiveChange]);

  const step = (i: number) => onActiveChange(((i % count) + count) % count);

  return (
    <div
      ref={rootRef}
      className={`accordion-gallery${stack ? " accordion-gallery--stack" : ""}`}
      style={
        {
          "--ag-accent": "#c8ae6e",
          "--ag-overlay": "#0c1f13",
          "--ag-text": "#fcfbf8",
          "--ag-gap": `${GAP}px`,
          "--ag-radius": `${RADIUS}px`,
          height: HEIGHT,
        } as CSSProperties
      }
      role="list"
      aria-label={label}
    >
      {items.map((item, i) => {
        const on = i === active;
        return (
          <Link
            key={item.link}
            href={item.link}
            ref={(el) => {
              panels.current[i] = el;
            }}
            className={`ag-panel${on ? " ag-panel--active" : ""}`}
            style={{ borderRadius: RADIUS }}
            role="listitem"
            tabIndex={0}
            data-ag-index={i}
            aria-label={item.title || item.kicker}
            aria-current={on ? "true" : undefined}
            onMouseEnter={() => step(i)}
            onFocus={() => step(i)}
            onClick={(event) => {
              if (i !== activeRef.current) {
                event.preventDefault();
                step(i);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                event.preventDefault();
                step(i + 1);
              } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                event.preventDefault();
                step(i - 1);
              }
            }}
          >
            <span className="ag-panel__frame">
              <span
                className="ag-panel__media"
                ref={(el) => {
                  medias.current[i] = el;
                }}
              >
                <img src={item.image} alt={item.alt} draggable={false} />
              </span>
              <span className="ag-panel__overlay" aria-hidden="true" />
            </span>
            <span className="ag-panel__label" aria-hidden="true">
              <span
                className="ag-panel__copy"
                ref={(el) => {
                  copies.current[i] = el;
                }}
              >
                {item.kicker && <span className="ag-panel__kicker">{item.kicker}</span>}
                {item.title && <span className="ag-panel__title">{item.title}</span>}
                {item.lede && <span className="ag-panel__lede">{item.lede}</span>}
                {item.more && (
                  <span className="ag-panel__more">
                    {item.more} <span aria-hidden="true">→</span>
                  </span>
                )}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
