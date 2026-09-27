"use client";

import { useCallback, useState } from "react";
import { Reveal } from "@/components/ui/motion";
import { CKM } from "@/lib/data";
import { useLang } from "@/lib/lang";
import { AccordionGallery } from "./AccordionGallery";

/** "Explore Chikkamagaluru": five theme panels with side arrows. */
export function ExploreSection() {
  const lang = useLang();
  const kn = lang === "kn";
  const [active, setActive] = useState(0);
  const count = CKM.explore.length;
  const onActiveChange = useCallback((i: number) => setActive(i), []);

  const items = CKM.explore.map((item) => ({
    image: item.image,
    link: item.href,
    kicker: kn ? item.labelKn || item.label : item.label,
    title: kn ? item.titleKn || item.title : item.title,
    lede: kn ? item.ledeKn || item.lede : item.lede,
    more: kn ? "ಇನ್ನಷ್ಟು ನೋಡಿ" : "View more",
    alt: kn ? item.titleKn || item.title : item.title,
  }));

  return (
    <Reveal className="explore-section" id="explore-chikmagaluru" aria-labelledby="explore-title">
      <div className="wrap">
        <p className="kicker explore-kicker">Welcome</p>
        <h2 id="explore-title">Explore Chikkamagaluru</h2>
        <p className="explore-wave" aria-hidden="true">
          ∿
        </p>
        <p className="section-lead explore-lead">
          Food, nature, hill air, heritage and tourism, five ways into a district companion. No rooms, no restaurants, no
          tickets.
        </p>
      </div>
      <div className="explore-rail-wrap explore-accordion-wrap">
        <button
          className="explore-nav"
          type="button"
          aria-label="Previous explore card"
          onClick={() => setActive((a) => (a - 1 + count) % count)}
        >
          ‹
        </button>
        <AccordionGallery
          items={items}
          active={active}
          onActiveChange={onActiveChange}
          label={kn ? "ಚಿಕ್ಕಮಗಳೂರು ಅನ್ವೇಷಣೆ" : "Explore Chikkamagaluru"}
        />
        <button className="explore-nav" type="button" aria-label="Next explore card" onClick={() => setActive((a) => (a + 1) % count)}>
          ›
        </button>
      </div>
    </Reveal>
  );
}
