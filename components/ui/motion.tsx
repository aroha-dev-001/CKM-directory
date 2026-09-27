"use client";

import Link from "next/link";
import {
  type ComponentProps,
  type ElementType,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

export function prefersReduced(): boolean {
  return typeof window !== "undefined" && window.matchMedia(REDUCED_QUERY).matches;
}

/** A live media query match; false in the static HTML, correct after hydration. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query]
  );
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}

const noSubscribe = () => () => {};

/** False in the static HTML and during hydration, true afterwards. */
export function useHydrated(): boolean {
  return useSyncExternalStore(noSubscribe, () => true, () => false);
}

export function useReducedMotion(): boolean {
  return useMediaQuery(REDUCED_QUERY);
}

function finePointer(): boolean {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/** Kinetics magnetic pull: the element leans toward the pointer. */
export function useMagnetic<T extends HTMLElement>() {
  return useCallback((el: T | null) => {
    if (!el || prefersReduced() || !finePointer()) return;
    const move = (event: PointerEvent) => {
      const box = el.getBoundingClientRect();
      const x = event.clientX - box.left - box.width / 2;
      const y = event.clientY - box.top - box.height / 2;
      el.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
    };
    const leave = () => {
      el.style.transform = "";
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);
}

export function MagneticLink(props: ComponentProps<typeof Link>) {
  const ref = useMagnetic<HTMLAnchorElement>();
  return <Link ref={ref} {...props} />;
}

/** Perspective tilt with a soft-light glare that follows the pointer. */
export function TiltLink({ children, ...props }: ComponentProps<typeof Link>) {
  const ref = useCallback((card: HTMLAnchorElement | null) => {
    if (!card || prefersReduced() || !finePointer()) return;
    const glare = card.querySelector<HTMLElement>(".tilt-glare");
    const move = (event: PointerEvent) => {
      const box = card.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width;
      const y = (event.clientY - box.top) / box.height;
      card.style.transform = `perspective(920px) rotateX(${(0.5 - y) * 7}deg) rotateY(${(x - 0.5) * 9}deg) translateY(-5px)`;
      if (glare) {
        glare.style.opacity = "1";
        glare.style.background = `radial-gradient(420px circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.32), transparent 56%)`;
      }
    };
    const leave = () => {
      card.style.transform = "";
      if (glare) glare.style.opacity = "0";
    };
    card.addEventListener("pointermove", move);
    card.addEventListener("pointerleave", leave);
    return () => {
      card.removeEventListener("pointermove", move);
      card.removeEventListener("pointerleave", leave);
    };
  }, []);
  return (
    <Link ref={ref} {...props}>
      {children}
      <span className="tilt-glare" aria-hidden="true" />
    </Link>
  );
}

/** Adds `is-in` once the element scrolls into view. The CSS only hides
    `.reveal-on-scroll` for readers without reduced motion. */
export function Reveal<T extends ElementType = "section">({
  as,
  className,
  children,
  ...rest
}: { as?: T; className?: string; children: ReactNode } & Omit<ComponentProps<T>, "as" | "className" | "children">) {
  const Tag = (as || "section") as ElementType;
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`${className ? `${className} ` : ""}reveal-on-scroll${inView ? " is-in" : ""}`} {...rest}>
      {children}
    </Tag>
  );
}

/** Counts up from zero once, the way the ribbon numbers land. */
export function CountUp({ to }: { to: number }) {
  const [value, setValue] = useState(to);
  useEffect(() => {
    if (prefersReduced()) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 880);
      setValue(Math.round(to * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <strong>{value}</strong>;
}

/**
 * Slides a `.t-tabs-pill` under whichever `.t-tab` is selected (`aria-selected` for
 * tabs, `aria-current` for a row of links).
 * Jumps on first paint and on resize; glides when `activeKey` changes.
 */
export function useTabsPill(barRef: RefObject<HTMLElement | null>, activeKey: unknown) {
  const placed = useRef(false);
  const move = useCallback(
    (animate: boolean) => {
      const bar = barRef.current;
      const pill = bar?.querySelector<HTMLElement>(".t-tabs-pill");
      const tab =
        bar?.querySelector<HTMLElement>('.t-tab[aria-selected="true"], .t-tab[aria-current="true"]') ||
        bar?.querySelector<HTMLElement>(".t-tab");
      if (!pill || !tab) return;
      const apply = () => {
        pill.style.transform = `translateX(${tab.offsetLeft}px)`;
        pill.style.width = `${tab.offsetWidth}px`;
      };
      if (!animate || prefersReduced()) {
        const prev = pill.style.transition;
        pill.style.transition = "none";
        apply();
        void pill.offsetWidth;
        pill.style.transition = prev;
      } else {
        apply();
      }
    },
    [barRef]
  );

  useLayoutEffect(() => {
    move(placed.current);
    placed.current = true;
  }, [activeKey, move]);

  useEffect(() => {
    const snap = () => move(false);
    window.addEventListener("resize", snap);
    document.fonts?.ready.then(snap);
    return () => window.removeEventListener("resize", snap);
  }, [move]);
}
