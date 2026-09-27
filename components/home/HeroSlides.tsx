"use client";

import { useEffect, useState } from "react";
import { prefersReduced } from "@/components/ui/motion";

// Kudremukh, Mullayanagiri, Ayyanakere, Kemmanagundi sunset, Hebbe Falls.
const SLIDES = ["h1", "h2", "h8", "h14", "h6"];
const HOLD = 2200;
const FADE = 1200;

/** Slow crossfade through the graded stills. Reduced motion keeps the first. */
export function HeroSlides() {
  const [{ active, leaving }, setSlide] = useState<{ active: number; leaving: number | null }>({ active: 0, leaving: null });

  useEffect(() => {
    if (prefersReduced()) return;
    let timer = 0;
    let fadeTimer = 0;
    const tick = () => {
      setSlide(({ active: current }) => ({ active: (current + 1) % SLIDES.length, leaving: current }));
      window.clearTimeout(fadeTimer);
      fadeTimer = window.setTimeout(() => setSlide((s) => ({ ...s, leaving: null })), FADE);
    };
    const play = () => {
      window.clearInterval(timer);
      timer = window.setInterval(tick, HOLD);
    };
    const onVisibility = () => {
      if (document.hidden) window.clearInterval(timer);
      else play();
    };
    play();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(fadeTimer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className="hero-media" aria-hidden="true">
      {SLIDES.map((slide, i) => (
        <img
          key={slide}
          className={`hero-still${i === active ? " is-active" : ""}${i === leaving ? " is-leaving" : ""}`}
          data-slide={slide}
          src={`/assets/hero-slides/${slide}.webp`}
          alt=""
          width={2400}
          height={1600}
          {...(i === 0 ? { fetchPriority: "high" as const } : { decoding: "async" as const })}
        />
      ))}
    </div>
  );
}
