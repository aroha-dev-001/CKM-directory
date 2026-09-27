"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type RefObject, useEffect, useRef, useState } from "react";
import { t } from "@/lib/data";
import { setLang, useLang } from "@/lib/lang";

const NAV = [
  { key: "home", href: "/", label: "nav_home" },
  { key: "explore", href: "/#explore-chikmagaluru", label: "nav_explore" },
  { key: "places", href: "/places", label: "nav_places" },
  { key: "popular", href: "/popular", label: "nav_popular" },
  { key: "map", href: "/map", label: "nav_map" },
  { key: "stories", href: "/stories", label: "nav_stories" },
  { key: "beantocup", href: "/bean-to-cup", label: null },
  { key: "plan", href: "/plan", label: "nav_plan" },
  { key: "visit", href: "/visit", label: "nav_visit" },
] as const;

/** Which primary nav item a route belongs under. */
function navKey(pathname: string): string {
  const page = pathname.split("/")[1] || "home";
  if (page === "coffee") return "stories";
  if (page === "taluk") return "map";
  if (["food", "nature", "stay", "heritage", "tourism"].includes(page)) return "explore";
  return page;
}

type Tone = "dark" | "light";

/** Channels of a computed `rgb()`/`rgba()` colour; other colour spaces are skipped. */
function rgbOf(value: string): number[] | undefined {
  return value.startsWith("rgb") ? value.match(/[\d.]+/g)?.map(Number) : undefined;
}

function luminance(rgb: number[]): number {
  return (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
}

/** Whether the page under (x, y), ignoring the header itself, is a dark surface. */
function darkBeneath(x: number, y: number, header: HTMLElement): boolean {
  const stack = document.elementsFromPoint(x, y).filter((el) => !header.contains(el));
  for (const el of stack) {
    if (el === document.body || el === document.documentElement) break;
    if (el instanceof HTMLImageElement || el instanceof HTMLVideoElement || el instanceof HTMLCanvasElement) return true;
    const style = getComputedStyle(el);
    if (style.backgroundImage.includes("url(")) return true;
    const rgba = rgbOf(style.backgroundColor);
    if (rgba && (rgba[3] ?? 1) > 0.5) return luminance(rgba) < 0.5;
  }
  // Nothing opaque under the bar: trust the text colour the page chose there.
  const ink = stack[0] && rgbOf(getComputedStyle(stack[0]).color);
  return ink ? luminance(ink) > 0.6 : false;
}

/**
 * The glass bar is see-through, so its ink has to follow whatever scrolls
 * beneath it: ivory over photos and forest sections, ink over the cream pages.
 */
function useSurfaceTone(ref: RefObject<HTMLElement | null>, pathname: string): Tone {
  const [tone, setTone] = useState<Tone>(pathname === "/" ? "dark" : "light");

  useEffect(() => {
    let frame = 0;
    const probe = () => {
      frame = 0;
      const header = ref.current;
      const bar = header?.firstElementChild;
      if (!header || !bar) return;
      const box = bar.getBoundingClientRect();
      const y = box.top + box.height / 2;
      const votes = [0.2, 0.5, 0.8].filter((at) => darkBeneath(box.left + box.width * at, y, header)).length;
      setTone(votes >= 2 ? "dark" : "light");
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(probe);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ref, pathname]);

  return tone;
}

export function SiteHeader() {
  const lang = useLang();
  const pathname = usePathname();
  const active = navKey(pathname);
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const tone = useSurfaceTone(headerRef, pathname);

  return (
    <header className={`site-header${open ? " is-open" : ""}`} id="top" data-tone={tone} ref={headerRef}>
      <div className="header-inner">
        <Link className="wordmark" href="/">
          <span className="wordmark-en">Chikkamagaluru</span>
          <span className="wordmark-kn">ಚಿಕ್ಕಮಗಳೂರು</span>
        </Link>
        <button
          className="nav-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="nav-toggle-bars" aria-hidden="true" />
          <span className="sr-only">Open menu</span>
        </button>
        <nav className="site-nav" id="site-nav" aria-label="Primary">
          {NAV.map((item) => {
            const on = item.key === active;
            return (
              <Link
                key={item.key}
                href={item.href}
                data-nav={item.key}
                className={on ? "is-active" : undefined}
                aria-current={on ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label ? t(lang, item.label) : "Bean to cup"}
              </Link>
            );
          })}
        </nav>
        <div className="header-tools">
          <button className="lang-toggle" type="button" onClick={() => setLang(lang === "en" ? "kn" : "en")}>
            {t(lang, "lang")}
          </button>
        </div>
      </div>
    </header>
  );
}
