/**
 * The route planner.
 *
 * A rule-based engine over the destination catalogue, not a model: every stop
 * it proposes is a real entry in data/ckm.json with real coordinates, and the
 * same answers always produce the same plan, so a shared link shows exactly
 * what its sender saw.
 *
 * Pipeline:
 *  1. Keep places this group can manage (effort) and that fit inside a day.
 *  2. Rank them by the traveller's interests (first pick weighs most), with a
 *     nudge for district favourites and against places out of season.
 *  3. Build each day around the best-ranked place still near the day's start,
 *     then add whichever ranked places cost the least extra driving, until the
 *     day's time or stop budget runs out.
 *  4. Order each day's stops by trying every sequence (a day has at most five)
 *     and keeping the shortest drive.
 *
 * Drives are estimates here. The map swaps in Google's road times once it has
 * drawn, and the timeline follows it.
 */

import { CKM } from "@/lib/data";
import type { Destination } from "@/lib/types";
import { estimateLeg, type Leg, type Waypoint } from "./route";
import {
  BASES,
  INTERESTS,
  baseById,
  interestMatches,
  paceById,
  type BaseId,
  type InterestId,
  type LatLng,
  type PaceId,
  type StayId,
  type WhenId,
} from "./vocab";

export type PlanInput = {
  days: number;
  pace: PaceId;
  /** In priority order: the first matters most. */
  interests: InterestId[];
  base: BaseId;
  stay: StayId;
  when: WhenId;
};

export type PlannedStop = {
  place: Destination;
  visitMin: number;
  /** On the plan because it matches an interest, or to fill a thin match. */
  reason: "match" | "fill";
  /** The chosen season is not one the catalogue recommends for this place. */
  offSeason: boolean;
};

export type PlanDay = {
  day: number;
  title: string;
  start: Waypoint;
  /** The base on a loop, the town to sleep in when moving on, or null on the last day of a moving trip. */
  end: Waypoint | null;
  stops: PlannedStop[];
  /** Estimated drives: start to the first stop, between stops, then to `end` when there is one. */
  legs: Leg[];
  /** Unplanned places close to this day's stops. */
  extras: Destination[];
};

export type Plan = {
  input: PlanInput;
  days: PlanDay[];
  /** Interests matched fewer places than the trip holds, so district favourites filled in. */
  toppedUp: boolean;
  /** Matching places left out because they are too strenuous for this group. */
  effortCapped: boolean;
  /** Matching places that take longer than a whole day at this pace. */
  tooLong: Destination[];
};

/** Everyone leaves at 8 am. Early enough for the hills, late enough for breakfast. */
export const DAY_START_MIN = 8 * 60;

const EFFORT: Record<string, 1 | 2 | 3> = { easy: 1, moderate: 2, difficult: 3, challenging: 3 };
const effortOf = (p: Destination) => EFFORT[p.difficulty ?? ""] ?? 1;
const visitOf = (p: Destination) => (p.durationMin && p.durationMin > 0 ? p.durationMin : 60);

/** The longest detour worth adding a stop for, in minutes of extra driving. */
const MAX_DETOUR_MIN = 75;
/** How far from a day's stops an "if you have time" place may be, as estimated road km. */
const EXTRA_RADIUS_KM = 15;

type Candidate = {
  place: Destination;
  point: LatLng;
  visit: number;
  interest: number;
  rank: number;
  offSeason: boolean;
  fill: boolean;
};

const popular = new Map(CKM.popularPlaces.map((p) => [p.id, p]));

export function buildPlan(raw: PlanInput, catalogue: Destination[] = CKM.destinations): Plan {
  const input: PlanInput = { ...raw, days: Math.max(1, Math.min(5, Math.round(raw.days) || 1)) };
  const pace = paceById(input.pace);
  const base = baseById(input.base);
  const wantsHard = input.interests.some((id) => INTERESTS.find((i) => i.id === id)?.hard);
  const maxEffort = wantsHard ? (input.pace === "seniors" ? 2 : 3) : pace.maxEffort;
  const longestVisit = pace.dayMinutes - 60;

  const weights = input.interests
    .map((id, i) => ({ interest: INTERESTS.find((x) => x.id === id), weight: (input.interests.length - i) * 10 }))
    .filter((w) => w.interest);

  const all: Candidate[] = catalogue
    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng))
    .map((place) => {
      const interest = weights.reduce((sum, w) => sum + (interestMatches(w.interest!, place) ? w.weight : 0), 0);
      const fav = popular.get(place.id);
      const offSeason = input.when !== "any" && Boolean(place.seasons?.length) && !place.seasons!.includes(input.when);
      const rank = interest + (fav?.featured ? 8 : fav ? 4 : 0) - (offSeason ? 8 : 0);
      return { place, point: { lat: place.lat!, lng: place.lng! }, visit: visitOf(place), interest, rank, offSeason, fill: false };
    });

  const wanted = (c: Candidate) => (weights.length ? c.interest > 0 : popular.has(c.place.id));
  const feasible = all.filter((c) => effortOf(c.place) <= maxEffort && c.visit <= longestVisit);
  const byRank = (a: Candidate, b: Candidate) => b.rank - a.rank || a.place.name.localeCompare(b.place.name);

  const primary = feasible.filter(wanted).sort(byRank);
  const capacity = input.days * pace.maxStops;
  // Anything feasible can round out a thin match, favourites first, but only
  // as many as the trip is short of. A waterfall trip should not turn into a
  // temple trip just because there was time.
  const fillBudget = Math.max(0, capacity - primary.length);
  const fills = feasible
    .filter((c) => !wanted(c))
    .map((c) => ({ ...c, fill: true, rank: c.rank - 40 }))
    .sort((a, b) => Number(popular.has(b.place.id)) - Number(popular.has(a.place.id)) || byRank(a, b));

  const remaining: Candidate[] = [...primary, ...fills];
  let fillsLeft = fillBudget;
  const eligible = (c: Candidate) => !c.fill || fillsLeft > 0;

  const days: PlanDay[] = [];
  const used = new Set<string>();
  const offered = new Set<string>();
  let start: Waypoint = { label: base.name, lat: base.lat, lng: base.lng };

  for (let d = 1; d <= input.days; d++) {
    const loopEnd: Waypoint | null = input.stay === "base" ? start : null;
    const chosen = assembleDay(start, loopEnd, remaining.filter(eligible), pace.dayMinutes, pace.maxStops, () => fillsLeft);
    if (!chosen.length) break;

    for (const c of chosen) {
      used.add(c.place.id);
      if (c.fill) fillsLeft -= 1;
      remaining.splice(remaining.indexOf(c), 1);
    }

    const ordered = bestOrder(start, chosen, loopEnd);
    // Moving on: the night is spent in the town nearest the day's last stop,
    // and tomorrow starts there. The last day simply ends at its last stop.
    const town = d < input.days && input.stay === "move" ? nearestTown(ordered[ordered.length - 1].point) : null;
    const end: Waypoint | null = input.stay === "base" ? loopEnd : town && { label: town.name, lat: town.lat, lng: town.lng };

    const points: LatLng[] = [start, ...ordered.map((c) => c.point), ...(end ? [end] : [])];
    const legs = points.slice(1).map((p, i) => estimateLeg(points[i], p));

    days.push({
      day: d,
      title: dayTitle(ordered.map((c) => c.place)),
      start,
      end,
      stops: ordered.map((c) => ({
        place: c.place,
        visitMin: c.visit,
        reason: c.fill ? "fill" : "match",
        offSeason: c.offSeason,
      })),
      legs,
      extras: [],
    });

    if (input.stay === "move" && end) start = end;
  }

  // Extras last, once every day's stops are known, so no day offers a place
  // another day already visits. Matching places are offered before others.
  const spare = feasible.filter((c) => !used.has(c.place.id));
  for (const day of days) {
    const anchors = day.stops.map((s) => ({ lat: s.place.lat!, lng: s.place.lng! }));
    day.extras = spare
      .filter((c) => !offered.has(c.place.id))
      .map((c) => ({ c, km: Math.min(...anchors.map((a) => estimateLeg(a, c.point).km)) }))
      .filter((x) => x.km <= EXTRA_RADIUS_KM)
      .sort((a, b) => Number(wanted(b.c)) - Number(wanted(a.c)) || a.km - b.km)
      .slice(0, 3)
      .map((x) => {
        offered.add(x.c.place.id);
        return x.c.place;
      });
  }

  const matching = all.filter(wanted);
  return {
    input,
    days,
    toppedUp: weights.length > 0 && days.some((d) => d.stops.some((s) => s.reason === "fill")),
    effortCapped: matching.some((c) => effortOf(c.place) > maxEffort),
    tooLong: matching.filter((c) => effortOf(c.place) <= maxEffort && c.visit > longestVisit).map((c) => c.place),
  };
}

/* ── one day ──────────────────────────────────────────────────────────── */

function assembleDay(
  start: LatLng,
  end: LatLng | null,
  pool: Candidate[],
  budget: number,
  maxStops: number,
  fillsLeft: () => number
): Candidate[] {
  // Seed: the best-ranked place that fits on its own, nudged toward the start
  // so day one does not open with a two-hour transfer.
  let seed: Candidate | null = null;
  let seedValue = -Infinity;
  for (const c of pool) {
    if (driveMinutes(start, [c.point], end) + c.visit > budget) continue;
    const value = c.rank - estimateLeg(start, c.point).min / 6;
    if (value > seedValue) {
      seed = c;
      seedValue = value;
    }
  }
  if (!seed) return [];

  const day: Candidate[] = [seed];
  let fills = seed.fill ? 1 : 0;
  while (day.length < maxStops) {
    const points = day.map((c) => c.point);
    const drive = driveMinutes(start, points, end);
    const visits = day.reduce((sum, c) => sum + c.visit, 0);

    let best: { c: Candidate; at: number; value: number } | null = null;
    for (const c of pool) {
      if (day.includes(c)) continue;
      if (c.fill && fills >= fillsLeft()) continue;
      const { at, minutes } = cheapestInsertion(start, points, end, c.point);
      const detour = minutes - drive;
      if (detour > MAX_DETOUR_MIN || minutes + visits + c.visit > budget) continue;
      const value = c.rank - detour / 5;
      if (!best || value > best.value) best = { c, at, value };
    }
    if (!best) break;
    day.splice(best.at, 0, best.c);
    if (best.c.fill) fills += 1;
  }
  return day;
}

function driveMinutes(start: LatLng, stops: LatLng[], end: LatLng | null): number {
  const points = [start, ...stops, ...(end ? [end] : [])];
  let total = 0;
  for (let i = 1; i < points.length; i++) total += estimateLeg(points[i - 1], points[i]).min;
  return total;
}

function cheapestInsertion(start: LatLng, stops: LatLng[], end: LatLng | null, point: LatLng) {
  let at = stops.length;
  let minutes = Infinity;
  for (let i = 0; i <= stops.length; i++) {
    const trial = [...stops.slice(0, i), point, ...stops.slice(i)];
    const m = driveMinutes(start, trial, end);
    if (m < minutes) {
      minutes = m;
      at = i;
    }
  }
  return { at, minutes };
}

/** Every visiting order, shortest drive wins. Five stops is 120 orders. */
function bestOrder(start: LatLng, stops: Candidate[], end: LatLng | null): Candidate[] {
  if (stops.length < 2) return stops;
  let best = stops;
  let bestMinutes = Infinity;
  const walk = (prefix: Candidate[], rest: Candidate[]) => {
    if (!rest.length) {
      const m = driveMinutes(start, prefix.map((c) => c.point), end);
      if (m < bestMinutes) {
        bestMinutes = m;
        best = prefix;
      }
      return;
    }
    rest.forEach((c, i) => walk([...prefix, c], [...rest.slice(0, i), ...rest.slice(i + 1)]));
  };
  walk([], stops);
  return best;
}

function nearestTown(point: LatLng) {
  return BASES.reduce((best, b) => (estimateLeg(point, b).km < estimateLeg(point, best).km ? b : best));
}

const PHRASE: Record<string, string> = {
  peaks: "Peaks",
  viewpoints: "Viewpoints",
  "hill-station": "Hill stations",
  waterfalls: "Waterfalls",
  temples: "Temples",
  heritage: "Heritage",
  forts: "Forts",
  lakes: "Lakes",
  dams: "Reservoirs",
  wildlife: "Forests",
  treks: "Treks",
};

/** "Peaks and waterfalls around Mudigere": the day's two main kinds, and where most of it is. */
function dayTitle(places: Destination[]): string {
  const tally = (key: (p: Destination) => string) => {
    const counts = new Map<string, number>();
    for (const p of places) counts.set(key(p), (counts.get(key(p)) ?? 0) + 1);
    // Map keeps first-seen order, so ties go to whatever the day visits first.
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
  };
  const kinds = tally((p) => PHRASE[p.category] ?? "Sights").slice(0, 2);
  const area = tally((p) => p.taluk)[0];
  const what = kinds.length > 1 ? `${kinds[0]} and ${kinds[1].toLowerCase()}` : kinds[0];
  return area ? `${what} around ${area}` : what;
}
