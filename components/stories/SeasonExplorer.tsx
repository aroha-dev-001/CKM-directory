"use client";

import { useRef, useState } from "react";
import { useTabsPill } from "@/components/ui/motion";
import { CKM, seasonImage } from "@/lib/data";

/** The four-season chapter: a slider and month tabs swap the still and the notes. */
export function SeasonExplorer() {
  const seasons = CKM.seasons;
  const [index, setIndex] = useState(0);
  // The opening still is Mullayanagiri; picking a season shows that season's photograph.
  const [picked, setPicked] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  useTabsPill(tabsRef, index);
  const season = seasons[index];

  const choose = (i: number) => {
    setIndex(i);
    setPicked(true);
  };

  return (
    <div className="season-layout">
      <div className="season-media">
        <img
          id="season-image"
          src={picked ? seasonImage(season.id) : "/assets/mullayanagiri.jpg?v=peaks1"}
          alt={picked ? season.title : "Seasonal landscape"}
          width={1800}
          height={1200}
        />
      </div>
      <div className="season-copy" id="season-copy">
        <p className="kicker">{season.months}</p>
        <h3>{season.title}</h3>
        <p>{season.text}</p>
        <ul className="season-list">
          {season.experiences.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
        <p className="season-watch">{season.watch}</p>
        <input
          className="season-slider"
          id="season-slider"
          type="range"
          min={0}
          max={seasons.length - 1}
          value={index}
          aria-label="Season"
          onChange={(event) => choose(Number(event.target.value))}
        />
        <div className="season-months">
          <div className="t-tabs season-tabs" role="tablist" aria-label="Seasons" ref={tabsRef}>
            <span className="t-tabs-pill" aria-hidden="true" />
            {seasons.map((s, i) => (
              <button
                type="button"
                className="t-tab season-month"
                role="tab"
                aria-selected={i === index}
                key={s.id}
                onClick={() => choose(i)}
              >
                {s.months.split("–")[0].trim()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
