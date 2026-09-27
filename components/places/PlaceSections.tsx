"use client";

import type { ComponentProps } from "react";
import { useOpenPlace } from "@/components/site/PlaceModal";
import { CKM, catLabel, placeCategories } from "@/lib/data";
import { useLang } from "@/lib/lang";
import type { Destination } from "@/lib/types";

/** A button that opens a destination's visitor notes in the modal. */
export function OpenPlaceButton({ placeId, ...props }: { placeId: string } & ComponentProps<"button">) {
  const openPlace = useOpenPlace();
  return <button type="button" data-open-place={placeId} onClick={() => openPlace(placeId)} {...props} />;
}

export function PlaceCard({ place }: { place: Destination }) {
  const lang = useLang();
  return (
    <article className="place-card-wrap">
      <OpenPlaceButton className="place-card" placeId={place.id}>
        <div className="media">
          <img src={place.image} alt={place.name} width={1800} height={1200} loading="lazy" />
        </div>
        <div className="place-card-meta">
          <span>{catLabel(place.category, lang)}</span>
          <span>{place.taluk}</span>
        </div>
        <h3>
          {place.name}
          <span className="kn">{place.kannada}</span>
        </h3>
        <p>{place.blurb}</p>
      </OpenPlaceButton>
    </article>
  );
}

/** Places grouped under their category, in catalogue order. Empty groups are skipped. */
export function PlaceSections({ places = CKM.destinations, categories }: { places?: Destination[]; categories?: string[] }) {
  const lang = useLang();
  const cats = placeCategories().filter((c) => !categories || categories.includes(c.id));
  return (
    <div id="place-sections">
      {cats.map((cat) => {
        const items = places.filter((p) => p.category === cat.id);
        if (!items.length) return null;
        const title = lang === "kn" ? cat.kn : cat.label;
        const lead = lang === "kn" ? cat.leadKn : cat.lead;
        return (
          <section className="place-section" id={`section-${cat.id}`} data-place-section={cat.id} key={cat.id}>
            <div className="place-section-head">
              <div>
                <p className="kicker">{title}</p>
                <h2>{title}</h2>
                <p className="section-lead">{lead || ""}</p>
              </div>
              <span className="place-section-count">{items.length}</span>
            </div>
            <div className="place-grid">
              {items.map((p) => (
                <PlaceCard place={p} key={p.id} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
