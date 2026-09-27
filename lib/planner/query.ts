/**
 * A plan lives in the URL (/plan?days=2&who=couple&love=peaks,waterfalls…),
 * so it can be shared, bookmarked and restored with the back button. The
 * query string is user input: every value is checked against the vocabulary,
 * and anything unknown falls back to a default instead of breaking the page.
 */

import type { PlanInput } from "./plan";
import { BASES, INTERESTS, PACES, STAYS, WHENS, type BaseId, type InterestId, type PaceId, type StayId, type WhenId } from "./vocab";

export const DEFAULT_INPUT: PlanInput = {
  days: 2,
  pace: "couple",
  interests: [],
  base: "chikkamagaluru",
  stay: "base",
  when: "any",
};

function pick<T extends string>(value: string | null, allowed: readonly { id: T }[], fallback: T): T {
  return allowed.find((a) => a.id === value)?.id ?? fallback;
}

/** The plan a URL asks for, or null when it does not ask for one. */
export function inputFromParams(params: URLSearchParams): PlanInput | null {
  if (!params.has("days")) return null;
  const days = Number.parseInt(params.get("days") ?? "", 10);
  const seen = new Set<InterestId>();
  for (const raw of (params.get("love") || "").split(",")) {
    const id = INTERESTS.find((i) => i.id === raw.trim())?.id;
    if (id) seen.add(id);
  }
  return {
    days: Number.isFinite(days) ? Math.max(1, Math.min(5, days)) : DEFAULT_INPUT.days,
    pace: pick<PaceId>(params.get("who"), PACES, DEFAULT_INPUT.pace),
    interests: [...seen],
    base: pick<BaseId>(params.get("from"), BASES, DEFAULT_INPUT.base),
    stay: pick<StayId>(params.get("stay"), STAYS, DEFAULT_INPUT.stay),
    when: pick<WhenId>(params.get("when"), WHENS, DEFAULT_INPUT.when),
  };
}

export function paramsFromInput(input: PlanInput): string {
  const params = new URLSearchParams({ days: String(input.days), who: input.pace });
  if (input.interests.length) params.set("love", input.interests.join(","));
  params.set("from", input.base);
  if (input.stay !== "base") params.set("stay", input.stay);
  if (input.when !== "any") params.set("when", input.when);
  return params.toString();
}

export function sameInput(a: PlanInput, b: PlanInput): boolean {
  return paramsFromInput(a) === paramsFromInput(b);
}
