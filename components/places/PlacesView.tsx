"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useOpenPlace } from "@/components/site/PlaceModal";
import { QuerySync } from "@/components/site/QuerySync";
import { prefersReduced, useTabsPill } from "@/components/ui/motion";
import { CKM, placeCategories, t, talukById, talukLabel } from "@/lib/data";
import { useLang } from "@/lib/lang";
import { placeMatchesQuery } from "@/lib/search";
import { PlaceSections } from "./PlaceSections";

const LEAD = "Waterfalls, temples, dams, lakes, hill stations, peaks and forests, grouped the way you look for them. Nothing here is a live fee, permit or opening-hour notice.";

function scrollToSection(id: string) {
  document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth", block: "start" });
}

/** /places: search, jump by kind, filter by taluk. Reads ?category, ?taluk, ?q and ?id. */
export function PlacesView() {
  const lang = useLang();
  const openPlace = useOpenPlace();
  const [filter, setFilter] = useState("all");
  const [taluk, setTaluk] = useState("all");
  const [query, setQuery] = useState("");
  const scrollTo = useRef<string | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  useTabsPill(tabsRef, taluk);

  const onQuery = useCallback(
    (params: URLSearchParams) => {
      const category = params.get("category") || "";
      setFilter(category || "all");
      setTaluk(params.get("taluk") || "all");
      setQuery(params.get("q") || "");
      if (category) window.setTimeout(() => scrollToSection(category), 60);
      const id = params.get("id");
      if (id) openPlace(id);
    },
    [openPlace]
  );

  const list = useMemo(
    () =>
      CKM.destinations.filter((place) => {
        if (filter !== "all" && place.category !== filter) return false;
        if (taluk !== "all" && place.talukId !== taluk && place.taluk !== taluk) return false;
        return placeMatchesQuery(place, query);
      }),
    [filter, taluk, query]
  );

  // A jump link re-filters first; scroll once the section has rendered.
  useEffect(() => {
    if (!scrollTo.current) return;
    scrollToSection(scrollTo.current);
    scrollTo.current = null;
  });

  const selectedTaluk = taluk === "all" ? undefined : talukById(taluk);
  const name = talukLabel(selectedTaluk, lang);
  const searching = Boolean(query.trim());

  return (
    <>
      <QuerySync onChange={onQuery} />
      <section className="page-hero">
        <div className="wrap">
          <p className="kicker" id="places-kicker">
            {selectedTaluk ? name : "Places"}
          </p>
          <h1 id="places-title">{selectedTaluk ? `Places in ${name}` : "Places worth the climb"}</h1>
          <p className="section-lead" id="places-lead">
            {selectedTaluk ? selectedTaluk.blurb : LEAD}
          </p>
          <p className="taluk-context" id="places-taluk-bar" hidden={!selectedTaluk}>
            <Link href="/places">All taluks</Link>
            <Link href={selectedTaluk ? `/taluk/${selectedTaluk.id}` : "/map"} id="places-map-link">
              Back to the district map
            </Link>
          </p>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="toolbar">
            <label className="search-label">
              {t(lang, "search")}
              <input
                id="place-search"
                type="search"
                placeholder={t(lang, "search_ph")}
                autoComplete="off"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <nav className="place-jump" aria-label="Jump to a kind of place">
              {placeCategories().map((c) => {
                const has = list.some((place) => place.category === c.id);
                const on = filter === c.id || (searching && filter === "all" && has);
                return (
                  <a
                    key={c.id}
                    className={`place-jump-link${on ? " is-active" : ""}`}
                    href={`#section-${c.id}`}
                    hidden={searching && !has}
                    onClick={(event) => {
                      event.preventDefault();
                      setFilter((f) => (f === c.id ? "all" : c.id));
                      scrollTo.current = c.id;
                    }}
                  >
                    {lang === "kn" ? c.kn : c.label}
                  </a>
                );
              })}
            </nav>
            <div className="t-tabs taluk-tabs" role="tablist" aria-label="Taluks" ref={tabsRef}>
              <span className="t-tabs-pill" aria-hidden="true" />
              {[{ id: "all", label: "All taluks" }, ...CKM.taluks.map((tk) => ({ id: tk.id, label: `${tk.name} · ${tk.count}` }))].map(
                (tab) => (
                  <button
                    key={tab.id}
                    className="t-tab"
                    type="button"
                    role="tab"
                    aria-selected={taluk === tab.id}
                    onClick={() => setTaluk(tab.id)}
                  >
                    {tab.label}
                  </button>
                )
              )}
            </div>
          </div>
          <p className="results-meta">
            <span id="result-count">{list.length}</span> {t(lang, "results")}
          </p>
          <PlaceSections places={list} />
          <p className="empty-state" id="place-empty" hidden={list.length > 0}>
            {t(lang, "empty")}
          </p>
        </div>
      </section>
    </>
  );
}
