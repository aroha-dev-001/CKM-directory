"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { useOpenPlace } from "@/components/site/PlaceModal";
import { QuerySync } from "@/components/site/QuerySync";
import { useTabsPill } from "@/components/ui/motion";
import { CKM, catLabel, placeById, t } from "@/lib/data";
import { useLang } from "@/lib/lang";
import { placeMatchesQuery } from "@/lib/search";
import { OpenPlaceButton } from "./PlaceSections";

const GROUPS = [
  ["all", "All popular"],
  ["peaks", "Peaks"],
  ["waterfalls", "Waterfalls"],
  ["hills", "Hills & ghats"],
  ["temples", "Temples"],
  ["lakes", "Lakes & dams"],
  ["forest", "Forest"],
  ["heritage", "Coffee & heritage"],
] as const;

const LISTED: Record<string, string> = {
  tripadvisor: "Tripadvisor Things to Do",
  "travel-chikmagalur": "District place lists",
  "weekend-lists": "Typical 2-day loops",
};

const CARDS = CKM.popularPlaces.flatMap((item) => {
  const place = placeById(item.id);
  return place ? [{ item, place, group: item.group || "all" }] : [];
});

/** The popular-places stack: group tabs and a search that narrows the slice. Reads ?id. */
export function PopularStack() {
  const lang = useLang();
  const openPlace = useOpenPlace();
  const [group, setGroup] = useState<string>("all");
  const [search, setSearch] = useState("");
  const tabsRef = useRef<HTMLDivElement>(null);
  useTabsPill(tabsRef, group);

  const onQuery = useCallback(
    (params: URLSearchParams) => {
      const id = params.get("id");
      if (id) openPlace(id);
    },
    [openPlace]
  );

  // Which cards are in the slice, and which of those take the alternate layout.
  const slice = useMemo(() => {
    const q = search.trim().toLowerCase();
    let shown = 0;
    const rows = [];
    for (const card of CARDS) {
      const name = `${card.place.name} ${card.place.kannada}`.toLowerCase();
      const hay = `${name} ${card.group.replace(/-/g, " ")}`;
      const show =
        (group === "all" || card.group === group) &&
        (!q || hay.includes(q) || placeMatchesQuery({ name, category: card.group, id: "", tags: [card.group] }, q));
      rows.push({ ...card, show, alt: show && shown % 2 === 1 });
      if (show) shown += 1;
    }
    return { rows, shown };
  }, [group, search]);
  const { shown } = slice;

  const cards = slice.rows.map(({ item, place, show, alt }) => (
    <article className={`popular-card${alt ? " is-alt" : ""}`} key={place.id} hidden={!show}>
      <OpenPlaceButton className="popular-card-media" placeId={place.id}>
        <img src={place.image} alt={place.name} width={1800} height={1200} loading="lazy" />
      </OpenPlaceButton>
      <div className="popular-card-body">
        <p className="kicker">{item.kicker || catLabel(place.category, lang)}</p>
        <h2>{place.name}</h2>
        <p className="kn">{place.kannada}</p>
        <p className="popular-why">{item.why || place.blurb}</p>
        <p className="popular-hours">
          <strong>{item.hours || "Daylight"}</strong>, {item.hoursDetail || place.visit}
        </p>
        <p className="popular-meta">
          {place.distanceKm != null && <span>{place.distanceKm} km from town</span>}
          {place.durationMin != null && <span>{Math.round(place.durationMin / 60) || 1} h typical stop</span>}
          <span>{place.taluk}</span>
        </p>
        <div className="popular-chips">
          {(item.listed || []).map((k) => (
            <span className="pop-listed" key={k}>
              {LISTED[k] || k}
            </span>
          ))}
        </div>
        <div className="popular-actions">
          <OpenPlaceButton className="btn btn-dark" placeId={place.id}>
            Visitor notes
          </OpenPlaceButton>
          <Link className="btn btn-line" href={`/taluk/${place.talukId || ""}#place-${place.id}`}>
            Show on map
          </Link>
        </div>
        {item.hoursSource && (
          <p className="visitor-source">
            <a href={item.hoursSource.url} rel="noopener noreferrer">
              {item.hoursSource.label}
            </a>
          </p>
        )}
      </div>
    </article>
  ));

  return (
    <>
      <QuerySync onChange={onQuery} />
      <section className="page-hero popular-hero">
        <div className="wrap">
          <p className="kicker">Popular tourist places</p>
          <h1>What visitors actually queue for</h1>
          <p className="section-lead">
            Thirty stops that keep showing up on Tripadvisor’s Chikkamagaluru Things to Do, on district-oriented place lists,
            and on typical 2-day hill loops. Copy here is this companion’s, not those sites’. Hours are published hints, not a
            live gate. No fees, rooms or packages.
          </p>
          <p className="popular-count">
            {shown} popular place{shown === 1 ? "" : "s"} in this slice
          </p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="toolbar popular-toolbar">
            <label className="search-label">
              {t(lang, "search")}
              <input
                id="popular-search"
                type="search"
                placeholder="Mullayanagiri, Hebbe, Sringeri…"
                autoComplete="off"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <div className="t-tabs" role="tablist" aria-label="Kind of popular place" ref={tabsRef}>
              <span className="t-tabs-pill" aria-hidden="true" />
              {GROUPS.map(([id, label]) => (
                <button key={id} className="t-tab" type="button" role="tab" aria-selected={group === id} onClick={() => setGroup(id)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="popular-stack" id="popular-stack">
            {cards}
          </div>
          <p className="empty-state" id="popular-empty" hidden={shown > 0}>
            Nothing in that slice. Clear the search or pick another group.
          </p>
        </div>
      </section>
    </>
  );
}
