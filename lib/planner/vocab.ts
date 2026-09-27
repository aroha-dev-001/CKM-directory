/**
 * The trip planner's vocabulary: who is travelling, what they want to see,
 * where they sleep and when they come. Plain data, shared by the form, the
 * query-string parser and the planning engine, so the three can never disagree
 * about what a choice means.
 *
 * Nothing here names a homestay, resort or room. "Where will you stay?" is a
 * town, used only as the point each day's drive starts from.
 */

import { CKM } from "@/lib/data";
import type { Destination } from "@/lib/types";

export type LatLng = { lat: number; lng: number };

/* ── pace ─────────────────────────────────────────────────────────────── */

export type PaceId = "couple" | "friends" | "solo" | "family" | "seniors";

export type Pace = {
  id: PaceId;
  label: string;
  hint: string;
  /** Hardest walk this group is sent on: 1 easy, 2 moderate, 3 strenuous. */
  maxEffort: 1 | 2 | 3;
  /** Driving plus time at the stops, in minutes, for one day. */
  dayMinutes: number;
  maxStops: number;
};

export const PACES: Pace[] = [
  { id: "couple", label: "Couple", hint: "Unhurried, a few good walks", maxEffort: 2, dayMinutes: 480, maxStops: 4 },
  { id: "friends", label: "Friends", hint: "Long days, steep climbs welcome", maxEffort: 3, dayMinutes: 540, maxStops: 5 },
  { id: "solo", label: "Solo", hint: "Your own pace", maxEffort: 3, dayMinutes: 540, maxStops: 5 },
  { id: "family", label: "Family with kids", hint: "Easy walks, fewer stops", maxEffort: 2, dayMinutes: 450, maxStops: 4 },
  { id: "seniors", label: "With seniors", hint: "Gentle paths, shorter days", maxEffort: 1, dayMinutes: 390, maxStops: 3 },
];

/* ── interests ────────────────────────────────────────────────────────── */

export type InterestId = "peaks" | "waterfalls" | "temples" | "coffee" | "lakes" | "wildlife" | "treks";

export type Interest = {
  id: InterestId;
  label: string;
  /** Catalogue categories this interest wants. */
  cats: string[];
  /** Catalogue tags that also count, for places filed under another kind. */
  tags: string[];
  /** Named places that belong here whatever their category. */
  ids?: string[];
  /** Asking for this lifts the effort cap (never past moderate for seniors). */
  hard?: boolean;
};

export const INTERESTS: Interest[] = [
  { id: "peaks", label: "Peaks & viewpoints", cats: ["peaks", "viewpoints", "hill-station"], tags: ["viewpoint", "sunrise", "sunset"] },
  { id: "waterfalls", label: "Waterfalls", cats: ["waterfalls"], tags: ["waterfall"] },
  {
    id: "temples",
    label: "Temples & heritage",
    // Not the whole "heritage" category: in the catalogue that is coffee
    // country and ghats, so its sacred and historic sites are named instead.
    cats: ["temples", "forts"],
    tags: ["temple", "hoysala"],
    ids: ["chandranatha-basadi-kalasa", "hariharapura-hara-temple", "simhanagadde-jain-kshetra", "sakharayapatna", "baba-budangiri"],
  },
  {
    id: "coffee",
    label: "Coffee country",
    cats: [],
    tags: ["coffee", "coffee-story", "coffee-country"],
    ids: ["coffee-museum", "coffee-hills", "baba-budangiri", "mullayanagiri", "kottigehara"],
  },
  { id: "lakes", label: "Lakes & reservoirs", cats: ["lakes", "dams"], tags: ["lake", "reservoir", "boating"] },
  { id: "wildlife", label: "Forests & wildlife", cats: ["wildlife"], tags: ["wildlife", "birds", "forest", "shola"] },
  { id: "treks", label: "Treks", cats: ["treks"], tags: ["trek"], hard: true },
];

export function interestMatches(interest: Interest, place: Destination): boolean {
  if (interest.cats.includes(place.category)) return true;
  if (interest.ids?.includes(place.id)) return true;
  return (place.tags || []).some((tag) => interest.tags.includes(tag));
}

/* ── where you sleep ──────────────────────────────────────────────────── */

export type BaseId =
  | "chikkamagaluru"
  | "mudigere"
  | "kalasa"
  | "sringeri"
  | "koppa"
  | "nrpura"
  | "tarikere"
  | "kadur"
  | "ajjampura";

export type Base = LatLng & { id: BaseId; name: string };

/* Town centres, each checked to fall inside its own taluk polygon in
   data/taluks.geo.json. Chikkamagaluru uses the site's own town point. */
export const BASES: Base[] = [
  { id: "chikkamagaluru", name: "Chikkamagaluru town", lat: CKM.site.town.lat, lng: CKM.site.town.lng },
  { id: "mudigere", name: "Mudigere", lat: 13.1366, lng: 75.6405 },
  { id: "kalasa", name: "Kalasa", lat: 13.234, lng: 75.356 },
  { id: "sringeri", name: "Sringeri", lat: 13.4167, lng: 75.25 },
  { id: "koppa", name: "Koppa", lat: 13.532, lng: 75.362 },
  { id: "nrpura", name: "N.R. Pura", lat: 13.61, lng: 75.51 },
  { id: "tarikere", name: "Tarikere", lat: 13.7092, lng: 75.813 },
  { id: "kadur", name: "Kadur", lat: 13.553, lng: 76.011 },
  { id: "ajjampura", name: "Ajjampura", lat: 13.729, lng: 76.005 },
];

export type StayId = "base" | "move";

export const STAYS: { id: StayId; label: string; hint: string }[] = [
  { id: "base", label: "One base", hint: "Loop out and back each day" },
  { id: "move", label: "Move on each night", hint: "Each day starts where the last one ended" },
];

/* ── when ─────────────────────────────────────────────────────────────── */

export type WhenId = "any" | "winter" | "summer" | "monsoon" | "post-monsoon";

const SHORT_MONTHS: Record<Exclude<WhenId, "any">, string> = {
  winter: "Nov – Feb",
  summer: "Mar – May",
  monsoon: "Jun – Sep",
  "post-monsoon": "October",
};

export const WHENS: { id: WhenId; label: string }[] = [
  { id: "any", label: "Not sure yet" },
  ...(Object.keys(SHORT_MONTHS) as Exclude<WhenId, "any">[]).map((id) => ({ id, label: SHORT_MONTHS[id] })),
];

export function seasonFor(when: WhenId) {
  return when === "any" ? undefined : CKM.seasons.find((s) => s.id === when);
}

/* ── lookups ──────────────────────────────────────────────────────────── */

export const DAY_CHOICES = [1, 2, 3, 4, 5] as const;

export const paceById = (id: PaceId): Pace => PACES.find((p) => p.id === id) ?? PACES[0];
export const baseById = (id: BaseId): Base => BASES.find((b) => b.id === id) ?? BASES[0];
export const interestById = (id: InterestId): Interest | undefined => INTERESTS.find((i) => i.id === id);
