"use client";

import Link from "next/link";
import { type CSSProperties, Fragment, useCallback, useEffect, useRef, useState } from "react";
import beanFlight from "@/data/bean-flight.json";
import { setLang, useLang } from "@/lib/lang";
import { type Flight, type JumpMode, startFlight } from "./flight";

interface BeatCopy {
  k: string;
  h: string;
  p1: string;
  p2: string;
  cap: string;
}

interface Beat {
  id: string;
  src: string;
  /** object-position that keeps the subject in frame on a portrait screen. */
  focus: string;
  /** "contain" when the whole frame matters more than filling a portrait screen. */
  fit?: string;
  act: "I" | "II";
  lore: boolean;
  en: BeatCopy;
  kn: BeatCopy;
}

const BEATS = beanFlight.BEATS as Beat[];
const UI: Record<"en" | "kn", Record<string, string>> = beanFlight.UI;
const LEG_W = 1.2;
const ACT_II = BEATS.findIndex((b) => b.act === "II");
/** Beats whose scrim sits darker under the copy. */
const DEEP = new Set(["saint", "mocha", "voyage", "roast", "brew"]);

/** Where a beat's copy is lit, as fractions of the whole track: its stop ± 0.38 of a leg. */
function copyWindow(i: number): string {
  if (i === 0) return "hero";
  if (i === BEATS.length - 1) return "finale";
  return `${((i + 0.5 - 0.38) / BEATS.length).toFixed(4)} ${((i + 0.5 + 0.38) / BEATS.length).toFixed(4)}`;
}

function beatText(index: number): string {
  return `Beat ${String(index).padStart(2, "0")} of ${String(BEATS.length - 1).padStart(2, "0")}`;
}

/** "00 · The saint" → ["00", "The saint"] */
function splitKicker(k: string): [string, string] {
  const parts = k.split("·");
  return [parts[0].trim(), (parts[1] || parts[0]).trim()];
}

export function BeanToCupWalk() {
  const lang = useLang();
  const kn = lang === "kn";
  const ui = UI[lang];

  const [leg, setLeg] = useState(0);
  const [flash, setFlash] = useState(true);
  const [offFlight, setOffFlight] = useState(false);
  const [hinted, setHinted] = useState(false);
  const [veil, setVeil] = useState(false);
  const [stuck, setStuck] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const worldRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const flight = useRef<Flight | null>(null);
  const legRef = useRef(0);
  const menuRef = useRef(false);
  const flashTimer = useRef(0);

  const flashRail = useCallback(() => {
    setFlash(true);
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(false), 2200);
  }, []);

  useEffect(() => {
    menuRef.current = menuOpen;
    document.documentElement.classList.toggle("nav-open", menuOpen);
  }, [menuOpen]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Scroll engine + glide-snap. Everything it wires is torn down on unmount.
  useEffect(() => {
    const world = worldRef.current;
    if (!world) return;
    let cancelled = false;
    let prevY = 0;
    startFlight(world, {
      count: BEATS.length,
      legW: LEG_W,
      onWaypoint(index) {
        if (index === legRef.current) return;
        legRef.current = index;
        setLeg(index);
        flashRail();
        progressRef.current?.setAttribute("aria-valuetext", beatText(index));
      },
      onVeil: setVeil,
      onScroll({ y, progress, inFlight }) {
        setStuck(y > 16);
        if (!menuRef.current) setHidden(y > prevY + 2 && y > 140);
        if (y < prevY - 2) setHidden(false);
        prevY = y;
        setOffFlight(!inFlight(y - innerHeight * 0.25));
        if (y > 40) setHinted(true);
        if (barRef.current) barRef.current.style.width = `${(progress * 100).toFixed(2)}%`;
        const wrap = progressRef.current;
        if (wrap) {
          wrap.setAttribute("aria-valuenow", String(Math.round(progress * 100)));
          wrap.setAttribute("aria-valuetext", beatText(legRef.current));
        }
      },
    }).then((f) => {
      if (cancelled) f.destroy();
      else flight.current = f;
    });

    const setVw = () => document.documentElement.style.setProperty("--vw", `${innerWidth}px`);
    setVw();
    window.addEventListener("resize", setVw, { passive: true });
    return () => {
      cancelled = true;
      flight.current?.destroy();
      flight.current = null;
      window.removeEventListener("resize", setVw);
      window.clearTimeout(flashTimer.current);
    };
  }, [flashRail]);

  // Aperture entrance: the head script marks <html class="entering"> on a first
  // visit (which also locks page scroll); open the lens once the first still has
  // loaded (or after 1.6s regardless), then release the page.
  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("entering")) return;
    // Track progress locally, not via the html classes: if this effect is torn
    // down mid-entrance (React Strict Mode does exactly that in dev), the rerun
    // must start clean rather than wait on a timer that was cancelled.
    let opened = false;
    let doneTimer = 0;
    const open = () => {
      if (opened) return;
      opened = true;
      html.classList.add("lens-open");
      doneTimer = window.setTimeout(() => {
        html.classList.remove("entering", "lens-open");
        flashRail();
      }, 2300);
    };
    const img = document.querySelector<HTMLImageElement>(".ap-img");
    if (!img || (img.complete && img.naturalWidth)) open();
    else {
      img.addEventListener("load", open, { once: true });
      img.addEventListener("error", open, { once: true });
    }
    const fallback = window.setTimeout(open, 1600);
    return () => {
      window.clearTimeout(fallback);
      window.clearTimeout(doneTimer);
      img?.removeEventListener("load", open);
      img?.removeEventListener("error", open);
      if (html.classList.contains("entering")) html.classList.remove("lens-open");
    };
  }, [flashRail]);

  const jump = (i: number, mode: JumpMode) => flight.current?.jump(i, mode);

  return (
    <>
      <a className="skip" href="#main">
        Skip to story
      </a>

      <div className="ap" aria-hidden="true">
        <div className="ap-frame">
          <img className="ap-img" src="/assets/bean-to-cup/story-00-baba-budan.webp" alt="" />
        </div>
        <p className="ap-mark">ಚಿಕ್ಕಮಗಳೂರು</p>
      </div>

      <header className={`nav${stuck ? " stuck" : ""}${hidden ? " hide" : ""}${menuOpen ? " menu-open" : ""}`}>
        <Link className="brand" href="/">
          <svg viewBox="0 0 34 34" fill="none" aria-hidden="true">
            <circle cx="17" cy="17" r="16" stroke="currentColor" strokeWidth="1" />
            <path d="M11 21c2-8 10-10 13-4" stroke="#e0231c" strokeWidth="1.2" />
          </svg>
          <span className="brand-tx">
            <b>Chikkamagaluru</b>
            <i>ಚಿಕ್ಕಮಗಳೂರು</i>
          </span>
        </Link>
        <nav className="nav-links" aria-label="Primary">
          <Link className="nav-link" href="/">
            {ui["nav.home"]}
          </Link>
          <Link className="nav-link" href="/#explore-chikmagaluru">
            {ui["nav.explore"]}
          </Link>
          <Link className="nav-link" href="/places">
            {ui["nav.places"]}
          </Link>
          <Link className="nav-link" href="/stories">
            {ui["nav.stories"]}
          </Link>
          <Link className="nav-link on" href="/bean-to-cup" aria-current="page">
            {ui["nav.here"]}
          </Link>
          <Link className="nav-link" href="/plan">
            {ui["nav.plan"]}
          </Link>
          <button className="nav-lang" type="button" aria-pressed={kn} onClick={() => setLang(kn ? "en" : "kn")}>
            {kn ? "English" : "ಕನ್ನಡ"}
          </button>
        </nav>
        <button
          className={`nav-burger${menuOpen ? " active" : ""}`}
          type="button"
          aria-expanded={menuOpen}
          aria-label="Open menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <i />
          <i />
        </button>
      </header>

      <div
        className="walk-progress"
        role="progressbar"
        aria-label="Walk progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
        ref={progressRef}
      >
        <span className="walk-progress-track">
          <i id="walk-progress-bar" className="walk-progress-indicator" ref={barRef} />
        </span>
      </div>

      <main id="main">
        <div className="world" data-sc-lerp="0.12" ref={worldRef}>
          <nav className={`wrail${offFlight ? " is-off" : ""}`} aria-label="Beats" data-flash={flash ? "" : undefined}>
            <ol>
              {BEATS.map((beat, i) => {
                const [num, name] = splitKicker(beat[lang].k);
                return (
                  <li key={beat.id}>
                    <button type="button" aria-current={i === leg ? "step" : undefined} onClick={() => jump(i, "auto")}>
                      <span className="wrail__tick" aria-hidden="true" />
                      <span className="wrail__name">
                        <small>{num}</small>
                        {name}
                      </span>
                    </button>
                    {i === ACT_II - 1 && <span className="wrail__ground" aria-hidden="true" />}
                  </li>
                );
              })}
            </ol>
          </nav>
          <p className={`wact${offFlight ? " is-off" : ""}`} aria-live="polite">
            {ui[leg >= ACT_II ? "actII" : "actI"]}
          </p>
          <div data-sc-mode="worldflight" data-sc-seam="0.16">
            <div data-sc-world>
              {BEATS.map((beat, i) => (
                <div
                  className="world-leg"
                  data-sc-segment
                  data-sc-w={LEG_W}
                  data-sc-waypoint={splitKicker(beat.en.k)[1]}
                  style={{ "--mx": beat.focus, "--mfit": beat.fit } as CSSProperties}
                  key={beat.id}
                >
                  <picture>
                    <img src={beat.src} alt="" decoding="async" fetchPriority={i < 2 ? "high" : "low"} width={1600} height={900} />
                  </picture>
                </div>
              ))}
            </div>
            <div data-sc-world-copy>
              {BEATS.map((beat, i) => {
                const side = i % 2 === 0 ? "lead" : "trail";
                const copy = beat[lang];
                const Title = i === 0 ? "h1" : "h2";
                return (
                  <Fragment key={beat.id}>
                    <div
                      className={`wscrim wscrim--${side}${DEEP.has(beat.id) ? " wscrim--deep" : ""}`}
                      data-scrim-for={beat.id}
                      aria-hidden="true"
                    />
                    <div
                      data-sc-copy
                      data-sc-window={copyWindow(i)}
                      data-copy-id={beat.id}
                      data-stop={i}
                      data-beat={i}
                      className={`wcopy wcopy--${side}`}
                    >
                      <p className="wkick">
                        <span className="dot" aria-hidden="true" />
                        <span className="wk">{copy.k}</span>
                        {beat.lore && <span className="lore">Lore</span>}
                      </p>
                      <Title className={`wtitle${i === 0 ? " wtitle--hero" : ""}`}>{copy.h}</Title>
                      <p className="wbody">{copy.p1}</p>
                      <p className="wbody wbody--more">{copy.p2}</p>
                      <p className="wcap">{copy.cap}</p>
                      {i === BEATS.length - 1 && (
                        <div className="wactions">
                          <Link className="cta" href="/">
                            <i />
                            <span>{ui["cta.home"]}</span>
                          </Link>
                          <Link className="cta" href="/places?id=baba-budangiri">
                            <i />
                            <span>{ui["cta.baba"]}</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </Fragment>
                );
              })}
            </div>
            <div data-sc-spacer aria-hidden="true" />
          </div>
          <div className="wvignette" aria-hidden="true" />
          <div className="wveil" data-on={veil ? "" : undefined} aria-hidden="true" />
          <p className={`whint${hinted ? " is-off" : ""}`} aria-hidden="true">
            <span>{ui["page.k"]}</span>
            <i />
          </p>
        </div>

        <section className="close" id="close">
          <p className="eyebrow">{ui["close.k"]}</p>
          <h2>{ui["close.h"]}</h2>
          <p>{ui["close.p"]}</p>
          <div className="cta-row">
            <Link className="cta" href="/">
              <i />
              <span>{ui["cta.home"]}</span>
            </Link>
            <Link className="cta" href="/places?id=baba-budangiri">
              <i />
              <span>{ui["cta.baba"]}</span>
            </Link>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="foot-grid">
          <div className="foot-brand">
            <h4>Chikkamagaluru</h4>
            <p>{ui["foot.note"]}</p>
          </div>
          <div>
            <h4>Walk</h4>
            <ul>
              <li>
                <Link href="/bean-to-cup">Bean to cup</Link>
              </li>
              <li>
                <Link href="/coffee">Coffee chapter</Link>
              </li>
              <li>
                <Link href="/stories">Stories</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Sources</h4>
            <ul>
              <li>
                <a href="https://coffeeboard.gov.in/" rel="noopener noreferrer">
                  Coffee Board of India
                </a>
              </li>
              <li>
                <a href="https://en.wikipedia.org/wiki/Baba_Budan" rel="noopener noreferrer">
                  Baba Budan
                </a>
              </li>
              <li>
                <a href="https://en.wikipedia.org/wiki/Indian_coffee" rel="noopener noreferrer">
                  Indian coffee
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4>Companion</h4>
            <ul>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/plan">Plan</Link>
              </li>
              <li>
                <Link href="/visit">Visit</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="foot-base">
          <span>Bean to cup · 00–14</span>
          <span>Not for sale</span>
        </div>
      </footer>
    </>
  );
}
