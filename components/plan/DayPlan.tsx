"use client";

import { type CSSProperties, type ReactNode, useCallback, useMemo, useState } from "react";
import { useOpenPlace } from "@/components/site/PlaceModal";
import { prefersReduced } from "@/components/ui/motion";
import { DAY_START_MIN, type PlanDay } from "@/lib/planner/plan";
import { bandFor, formatClock, formatDuration, formatKm, isoClock, type Leg, type Waypoint } from "@/lib/planner/route";
import { IconMoon } from "./icons";
import { RouteMap } from "./RouteMap";
import { StopCard } from "./StopCard";

/** Clock times: leave at 8, drive, stay, drive on. */
function schedule(day: PlanDay, legs: Leg[]) {
  const arrivals: number[] = [];
  let clock = DAY_START_MIN;
  day.stops.forEach((stop, i) => {
    clock += legs[i]?.min ?? 0;
    arrivals.push(clock);
    clock += stop.visitMin;
  });
  return { arrivals, lastDeparture: clock };
}

/** Around sunset in the district. Hill roads here are unlit after it. */
const DUSK_MIN = 18 * 60 + 30;

/**
 * One day of the plan. The map reports Google's road legs back up here, so
 * the timeline, the clock times and the header totals all switch from the
 * planner's estimate to real road numbers together, never half and half.
 */
export function DayPlan({ day, isLastDay, stay }: { day: PlanDay; isLastDay: boolean; stay: "base" | "move" }) {
  const openPlace = useOpenPlace();
  const [roadLegs, setRoadLegs] = useState<Leg[] | null>(null);
  const [active, setActive] = useState<number | null>(null);

  const points: Waypoint[] = useMemo(
    () => [
      day.start,
      ...day.stops.map((s) => ({ label: s.place.name, lat: s.place.lat!, lng: s.place.lng! })),
      ...(day.end ? [day.end] : []),
    ],
    [day]
  );

  const legs = roadLegs ?? day.legs;
  const byRoad = roadLegs != null;

  const { arrivals, lastDeparture } = schedule(day, legs);
  const endLeg = day.end ? legs[day.stops.length] : undefined;
  const finish = lastDeparture + (endLeg?.min ?? 0);
  const driveMin = legs.reduce((sum, l) => sum + l.min, 0);
  const driveKm = legs.reduce((sum, l) => sum + l.km, 0);
  const isLoop = stay === "base";

  const onRoute = useCallback((next: Leg[] | null) => setRoadLegs(next), []);
  const selectFromMap = useCallback(
    (i: number) => {
      setActive(i);
      const card = document.getElementById(`stop-${day.stops[i]?.place.id}`);
      card?.scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth", block: "center" });
      // A keyboard user who picked a pin carries on from that stop's card.
      card?.focus({ preventScroll: true });
    },
    [day]
  );

  const endLabel = isLoop
    ? `Back in ${day.start.label}`
    : day.end
      ? `Night in ${day.end.label}`
      : "Done. The drive home starts here.";

  return (
    <article className="pl-day" id={`day-${day.day}`} aria-labelledby={`day-${day.day}-title`}>
      <header className="pl-day-head">
        <p className="pl-day-num">Day {day.day}</p>
        <h3 id={`day-${day.day}-title`}>{day.title}</h3>
        <dl className="pl-day-stats">
          <div>
            <dt>Stops</dt>
            <dd>{day.stops.length}</dd>
          </div>
          <div>
            <dt>{byRoad ? "Driving, by road" : "Driving, estimated"}</dt>
            <dd>
              {formatKm(driveKm)}, {formatDuration(driveMin)}
            </dd>
          </div>
          <div>
            <dt>{isLoop ? "Back by" : day.end ? `In ${day.end.label} by` : "Done by"}</dt>
            <dd>{formatClock(day.end ? finish : lastDeparture)}</dd>
          </div>
        </dl>
      </header>

      <div className="pl-day-body">
        <div className="pl-day-map">
          <RouteMap
            day={day.day}
            points={points}
            stopCount={day.stops.length}
            fallbackLegs={day.legs}
            active={active}
            onSelect={selectFromMap}
            onRoute={onRoute}
          />
        </div>

        <ol className="pl-timeline">
          <li className="pl-tl-point">
            <Clock minutes={DAY_START_MIN} />
            <span className="pl-tl-mark pl-tl-mark-base" aria-hidden="true" />
            <p className="pl-tl-label">
              {day.day > 1 && !isLoop ? `Set out from ${day.start.label}` : `Leave ${day.start.label}`}
            </p>
          </li>

          {day.stops.map((stop, i) => (
            <StopRow
              key={stop.place.id}
              leg={legs[i]}
              byRoad={byRoad}
              arrival={arrivals[i]}
              number={i + 1}
            >
              <StopCard stop={stop} index={i} active={active === i} onActivate={setActive} />
            </StopRow>
          ))}

          {endLeg ? <LegRow leg={endLeg} byRoad={byRoad} /> : null}
          <li className="pl-tl-point">
            <Clock minutes={day.end ? finish : lastDeparture} />
            <span className={`pl-tl-mark ${day.end && !isLoop ? "pl-tl-mark-night" : "pl-tl-mark-base"}`} aria-hidden="true">
              {day.end && !isLoop ? <IconMoon /> : null}
            </span>
            <p className="pl-tl-label">
              {endLabel}
              {!isLoop && day.end ? (
                <span className="pl-tl-sub">Stay anywhere you like in town. Day {day.day + 1} starts here.</span>
              ) : null}
              {isLastDay && !isLoop && !day.end ? <span className="pl-tl-sub">Safe travels.</span> : null}
            </p>
          </li>
        </ol>
      </div>

      {(day.end ? finish : lastDeparture) > DUSK_MIN ? (
        <p className="pl-note pl-note-warn" role="note">
          This day runs past dusk, around 6:30 pm. Hill roads here are unlit and often misty after dark, so consider dropping a stop.
        </p>
      ) : null}

      {day.extras.length ? (
        <div className="pl-extras">
          <p>If you have time nearby</p>
          <ul>
            {day.extras.map((place) => (
              <li key={place.id}>
                <button type="button" className="pl-chip-link" onClick={() => openPlace(place.id)}>
                  {place.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}

function Clock({ minutes }: { minutes: number }) {
  return (
    <time className="pl-tl-time" dateTime={isoClock(minutes)}>
      {formatClock(minutes)}
    </time>
  );
}

function LegRow({ leg, byRoad }: { leg: Leg; byRoad: boolean }) {
  const band = bandFor(leg.km);
  return (
    <li className="pl-tl-leg" style={{ "--band": band.color } as CSSProperties}>
      <span className="pl-tl-leg-line" aria-hidden="true" />
      <p>
        <strong>{formatDuration(leg.min)}</strong> drive, {formatKm(leg.km)}
        <span className="pl-tl-band">
          {band.label}
          {byRoad ? "" : ", estimated"}
        </span>
      </p>
    </li>
  );
}

function StopRow({
  leg,
  byRoad,
  arrival,
  number,
  children,
}: {
  leg: Leg | undefined;
  byRoad: boolean;
  arrival: number;
  number: number;
  children: ReactNode;
}) {
  return (
    <>
      {leg ? <LegRow leg={leg} byRoad={byRoad} /> : null}
      <li className="pl-tl-stop">
        <Clock minutes={arrival} />
        <span className="pl-tl-mark" aria-hidden="true">
          {number}
        </span>
        <div className="pl-tl-card">{children}</div>
      </li>
    </>
  );
}
