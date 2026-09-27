"use client";

import { memo } from "react";
import { useOpenPlace } from "@/components/site/PlaceModal";
import { useMediaQuery } from "@/components/ui/motion";
import { catLabel, firstSentence, popularFor } from "@/lib/data";
import { useLang } from "@/lib/lang";
import type { PlannedStop } from "@/lib/planner/plan";
import { directionsToUrl, formatDuration } from "@/lib/planner/route";
import { IconBoot, IconCalendar, IconClock, IconExternal, IconPeak, IconPermit, IconSun } from "./icons";

const EFFORT: Record<string, string> = {
  easy: "Easy going",
  moderate: "Some climbing",
  difficult: "Strenuous",
  challenging: "Very strenuous",
};

const BEST_ROUTE = /\s*Best route:/i;
const EN_DASH = /\s*–\s*/;

/** Strips the catalogue's trailing "Best route: …" so the tip is one clear caution. */
function tipFrom(visit: string): string {
  const note = visit.split(BEST_ROUTE)[0].trim();
  return firstSentence(note) || note;
}

/**
 * One stop, with what a visitor needs before they get there: how long to
 * give it, how hard the walk is, the best months, published hours, and the
 * one thing worth knowing. The full notes open in the site's place modal.
 */
export const StopCard = memo(function StopCard({
  stop,
  index,
  active,
  onActivate,
}: {
  stop: PlannedStop;
  index: number;
  active: boolean;
  onActivate: (index: number | null) => void;
}) {
  const lang = useLang();
  const openPlace = useOpenPlace();
  // A new tab suits a desktop. On a phone it can strand the hand-off to the
  // Google Maps app in a blank tab, so there the link stays in place.
  const finePointer = useMediaQuery("(pointer: fine)");
  const { place } = stop;
  const hours = popularFor(place.id)?.hours;
  const tags = place.tags || [];
  const tip = tipFrom(place.visit);

  return (
    <article
      className={`pl-stop${active ? " is-active" : ""}`}
      id={`stop-${place.id}`}
      aria-labelledby={`stop-${place.id}-name`}
      tabIndex={-1}
      onPointerEnter={() => onActivate(index)}
      onPointerLeave={() => onActivate(null)}
      onFocus={() => onActivate(index)}
    >
      <div className="pl-stop-media">
        <img src={place.image} alt="" width={1800} height={1200} loading="lazy" decoding="async" />
      </div>
      <div className="pl-stop-body">
        <p className="pl-stop-kind">
          {catLabel(place.category, lang)}
          <span>{place.taluk} taluk</span>
        </p>
        <h4 id={`stop-${place.id}-name`}>{place.name}</h4>
        <p className="pl-stop-kn" lang="kn">
          {place.kannada}
        </p>
        <p className="pl-stop-blurb">{place.blurb}</p>

        <ul className="pl-facts">
          <li>
            <IconClock />
            <span>Give it</span>
            <strong>about {formatDuration(stop.visitMin)}</strong>
          </li>
          {place.difficulty && EFFORT[place.difficulty] ? (
            <li>
              <IconBoot />
              <span>Walking</span>
              <strong>{EFFORT[place.difficulty]}</strong>
            </li>
          ) : null}
          {place.bestTime ? (
            <li>
              <IconCalendar />
              <span>Best months</span>
              <strong>{place.bestTime.replace(EN_DASH, " to ")}</strong>
            </li>
          ) : null}
          {hours ? (
            <li>
              <IconSun />
              <span>Hours</span>
              <strong>{hours}</strong>
            </li>
          ) : place.elevation ? (
            <li>
              <IconPeak />
              <span>Height</span>
              <strong>{place.elevation}</strong>
            </li>
          ) : null}
        </ul>

        {tags.includes("permit") || tags.includes("jeep") || stop.offSeason || stop.reason === "fill" ? (
          <ul className="pl-flags">
            {tags.includes("permit") ? (
              <li className="pl-flag-warn">
                <IconPermit />
                Forest permission needed
              </li>
            ) : null}
            {tags.includes("jeep") ? <li>Last stretch by jeep</li> : null}
            {stop.offSeason ? <li className="pl-flag-warn">Better in other months</li> : null}
            {stop.reason === "fill" ? <li>A district favourite nearby</li> : null}
          </ul>
        ) : null}

        {tip ? (
          <p className="pl-tip">
            <strong>Good to know.</strong> {tip}
          </p>
        ) : null}

        <div className="pl-stop-actions">
          <button className="btn btn-dark" type="button" onClick={() => openPlace(place.id)}>
            Read visitor notes
          </button>
          <a
            className="btn btn-line"
            href={directionsToUrl({ lat: place.lat!, lng: place.lng! })}
            {...(finePointer ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            <IconExternal />
            Directions
            {finePointer ? <span className="sr-only"> (opens in a new tab)</span> : null}
          </a>
        </div>
      </div>
    </article>
  );
});
