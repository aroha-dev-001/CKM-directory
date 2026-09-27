"use client";

import Link from "next/link";
import { OpenPlaceButton } from "@/components/places/PlaceSections";
import { useOpenPlace } from "@/components/site/PlaceModal";
import { Learn } from "@/components/ui/chevrons";
import { prefersReduced } from "@/components/ui/motion";
import { catLabel, placeCategories, placesInTaluk, popularFor, talukById, talukLabel } from "@/lib/data";
import { useLang } from "@/lib/lang";
import type { MapModel } from "@/lib/map-model";
import type { Destination, Lang, SourceLink } from "@/lib/types";
import { DistrictMap } from "./DistrictMap";

function TalukPlace({ place, lang }: { place: Destination; lang: Lang }) {
  const extra = popularFor(place.id);
  const sources = [...(place.sources || []), ...(extra?.hoursSource ? [extra.hoursSource] : [])].filter(
    (s: SourceLink, i, all) => s.url && all.findIndex((x) => x.url === s.url) === i
  );
  return (
    <article className="taluk-place" id={`place-${place.id}`}>
      <figure className="taluk-place-media">
        <img src={place.image} alt={place.name} width={1800} height={1200} loading="lazy" />
      </figure>
      <div className="taluk-place-body">
        <p className="kicker">
          {catLabel(place.category, lang)} · {place.taluk}
        </p>
        <h2>{lang === "kn" ? place.kannada : place.name}</h2>
        <p className="kn">{place.kannada}</p>
        <p>{place.summary || place.blurb}</p>
        {extra && (
          <>
            <p className="taluk-place-why">{extra.why}</p>
            <p className="taluk-place-hours">
              <strong>{extra.hours}</strong>, {extra.hoursDetail}
            </p>
          </>
        )}
        <p>{place.visit}</p>
        <p className="taluk-place-meta">
          {place.bestTime || ""}
          {place.elevation ? ` · ${place.elevation}` : ""}
        </p>
        {sources.length > 0 && (
          <ul className="taluk-sources">
            {sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} rel="noopener noreferrer">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        )}
        <div className="taluk-place-actions">
          <OpenPlaceButton className="btn btn-dark" placeId={place.id}>
            <Learn>Open visitor notes</Learn>
          </OpenPlaceButton>
        </div>
      </div>
    </article>
  );
}

/** One taluk: its polygon with every listed place pinned, then the visitor notes. */
export function TalukView({ id, model }: { id: string; model: MapModel }) {
  const lang = useLang();
  const openPlace = useOpenPlace();
  const taluk = talukById(id)!;
  const places = placesInTaluk(id);
  const label = talukLabel(taluk, lang);

  const onPin = (placeId: string) => {
    const target = document.getElementById(`place-${placeId}`);
    if (target) target.scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth", block: "start" });
    else openPlace(placeId);
  };

  return (
    <>
      <section className="page-hero taluk-hero">
        <div className="wrap">
          <p className="kicker">
            <Link href="/map">The district</Link> · {label}
          </p>
          <h1>{label}</h1>
          <p className="kn">{taluk.kannada}</p>
          <p className="section-lead">{taluk.blurb}</p>
          <div className="taluk-chips">
            {placeCategories().map((c) => {
              const n = places.filter((p) => p.category === c.id).length;
              return n ? (
                <span className="taluk-chip" key={c.id}>
                  {lang === "kn" ? c.kn : c.label} · {n}
                </span>
              ) : null;
            })}
          </div>
          <p className="taluk-place-meta">
            {places.length} place{places.length === 1 ? "" : "s"} in this companion, descriptions from district tourism,
            temple and forest pages already on the public web. Not a complete gazetteer.
          </p>
        </div>
      </section>
      <section className="district-explorer-section taluk-focus-section">
        <div className="wrap wrap-wide">
          <div className="taluk-focus-grid">
            <div className="district-copy">
              <p className="kicker">This taluk</p>
              <h2>Places on the map.</h2>
              <p className="section-lead">
                The district overview hid every pin. Here the listed sights sit on {label}’s OSM polygon. Click a marker to
                jump to its notes below.
              </p>
              <Link className="btn btn-line" href="/map">
                <Learn>Back to nine taluks</Learn>
              </Link>
            </div>
            <div className="district-map-stage">
              <DistrictMap
                model={model}
                mode="taluk"
                className="choropleth choropleth-lg"
                role="img"
                label={`Places in ${label}`}
                onPlace={onPin}
              />
            </div>
          </div>
        </div>
      </section>
      <section className="section taluk-guide">
        <div className="wrap">
          <div className="section-head">
            <p className="kicker">Visitor notes</p>
            <h2>Every listed place in {label}.</h2>
            <p className="section-lead">
              Hours, approach and “why people stop” come from public pages, the district, Karnataka Forest Department,
              mathas, not from a booking desk. Confirm before you go.
            </p>
          </div>
          <div className="taluk-place-list">
            {places.map((p) => (
              <TalukPlace place={p} lang={lang} key={p.id} />
            ))}
          </div>
          {!places.length && (
            <p className="empty-state" id="taluk-places-empty">
              This companion does not yet list a destination in {label}. The OSM boundary is shown so the nine-taluk map stays
              complete. Neighbour taluks still have full guides.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
