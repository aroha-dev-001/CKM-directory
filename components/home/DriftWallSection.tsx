"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useOpenPlace } from "@/components/site/PlaceModal";
import { CKM } from "@/lib/data";
import { useLang } from "@/lib/lang";
import type { Destination } from "@/lib/types";
import { type DriftConfig, type DriftItem, DriftWall } from "./DriftWall";

const THEMES = ["falls", "mountains", "heritage", "food", "water", "wildlife"] as const;
type Theme = (typeof THEMES)[number];

function driftTheme(place: Destination): Theme {
  const cat = place.category;
  if (cat === "waterfalls") return "falls";
  if (["peaks", "hill-station", "viewpoints", "treks"].includes(cat)) return "mountains";
  if (cat === "lakes" || cat === "dams") return "water";
  if (cat === "wildlife") return "wildlife";
  if (place.id === "coffee-hills" || place.id === "coffee-museum" || /\bcoffee\b/.test((place.tags || []).join(" "))) return "food";
  return "heritage";
}

interface StreamItem {
  id: string;
  image: string;
  name: string;
  kannada: string;
  blurb: string;
  isFood: boolean;
}

/** Deal the places (and Malnad plates) round-robin by theme: falls, mountains, heritage, food, water, wildlife. */
function themedStream(): StreamItem[] {
  const buckets = Object.fromEntries(THEMES.map((key) => [key, [] as StreamItem[]])) as Record<Theme, StreamItem[]>;
  CKM.destinations.forEach((place) =>
    buckets[driftTheme(place)].push({ id: place.id, image: place.image, name: place.name, kannada: place.kannada, blurb: place.blurb || place.summary || "", isFood: false })
  );
  CKM.malnadFoods.forEach((dish) =>
    buckets.food.push({ id: `food-${dish.id}`, image: dish.image, name: dish.name, kannada: dish.kannada, blurb: dish.story || dish.kicker || "", isFood: true })
  );
  const items: StreamItem[] = [];
  while (THEMES.some((key) => buckets[key].length)) {
    THEMES.forEach((key) => {
      const next = buckets[key].shift();
      if (next) items.push(next);
    });
  }
  return items;
}

const STREAM = themedStream();

function measureConfig(stage: HTMLElement): DriftConfig {
  const narrow = window.innerWidth < 720;
  const tileWidth = narrow ? 148 : 200;
  const stageW = stage.clientWidth || window.innerWidth;
  return {
    columns: Math.min(narrow ? 4 : 7, Math.max(narrow ? 3 : 5, Math.ceil(stageW / tileWidth) + 1)),
    tileWidth,
    tileHeight: narrow ? 98 : 132,
    tilt: narrow ? 10 : 18,
    turn: narrow ? -4 : -11,
    roll: narrow ? 0 : -1,
    perspective: narrow ? 1100 : 980,
    depth: narrow ? 36 : 160,
    parallax: narrow ? 0.18 : 0.7,
    lift: narrow ? 28 : 64,
    scale: narrow ? 1.08 : 1.34,
    shiftX: narrow ? -48 : -220,
    originX: narrow ? "32%" : "22%",
    containerHeight: stage.clientHeight || 600,
  };
}

export function DriftWallSection() {
  const lang = useLang();
  const openPlace = useOpenPlace();
  const stageRef = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<DriftConfig | null>(null);

  // The wall's geometry depends on the viewport, so it is laid out after mount
  // and again (debounced) when the window is resized.
  useEffect(() => {
    let timer = 0;
    const layout = () => {
      if (stageRef.current) setConfig(measureConfig(stageRef.current));
    };
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(layout, 180);
    };
    const raf = requestAnimationFrame(layout);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const items = useMemo<DriftItem[]>(
    () =>
      STREAM.map((item) => ({
        placeId: item.id,
        openPlace: !item.isFood,
        image: item.image,
        title: lang === "kn" ? item.kannada : item.name,
        kannada: lang === "kn" ? item.name : item.kannada,
        blurb: item.blurb,
      })),
    [lang]
  );

  return (
    <section className="places-drift-band" aria-labelledby="places-drift-title">
      <div className="wrap places-drift-intro">
        <p className="kicker">The wall</p>
        <h2 id="places-drift-title">Still drifting through the district.</h2>
        <p className="section-lead">
          Click a photograph to pause the wall and flip it. Two or three lines of place notes are on the back, visitor hours
          live in Places.
        </p>
      </div>
      <div className="places-drift-stage" ref={stageRef}>
        {config ? <DriftWall items={items} config={config} onOpenPlace={openPlace} /> : <div />}
      </div>
    </section>
  );
}
