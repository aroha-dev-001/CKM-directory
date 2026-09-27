import raw from "@/data/ckm.json";
import type { Category, CkmData, Destination, Lang, Taluk } from "./types";

// Assigning (not casting) keeps the JSON structurally checked against the types.
export const CKM: CkmData = raw;

/** The nine current taluks, in the order the district index lists them. */
export const TALUK_ORDER = [
  "chikkamagaluru",
  "tarikere",
  "kadur",
  "mudigere",
  "koppa",
  "nrpura",
  "sringeri",
  "kalasa",
  "ajjampura",
] as const;

export const CATEGORY_COLOR: Record<string, string> = {
  peaks: "#c4a36a",
  viewpoints: "#8a9a6b",
  waterfalls: "#7aa3b8",
  dams: "#3f6f7c",
  lakes: "#4d7c8a",
  wildlife: "#3d6b4f",
  temples: "#b08968",
  heritage: "#8a6a4b",
  "hill-station": "#6b8f71",
  treks: "#5f7a4a",
  forts: "#8a6f55",
};

const placeIndex = new Map(CKM.destinations.map((p) => [p.id, p]));
const talukIndex = new Map(CKM.taluks.map((t) => [t.id, t]));

export function placeById(id: string | null | undefined): Destination | undefined {
  return id ? placeIndex.get(id) : undefined;
}

export function talukById(id: string | null | undefined): Taluk | undefined {
  return id ? talukIndex.get(id) : undefined;
}

export function placesInTaluk(id: string): Destination[] {
  return CKM.destinations.filter((p) => p.talukId === id);
}

export function orderedTaluks(): Taluk[] {
  return TALUK_ORDER.map((id) => talukIndex.get(id)).filter((t): t is Taluk => Boolean(t));
}

export function popularFor(id: string) {
  return CKM.popularPlaces.find((p) => p.id === id);
}

/** Categories that hold places (everything but the "all" pseudo-category). */
export function placeCategories(): Category[] {
  return CKM.categories.filter((c) => c.id !== "all");
}

export function catLabel(id: string, lang: Lang): string {
  const found = CKM.categories.find((c) => c.id === id);
  if (!found) return id;
  return lang === "kn" ? found.kn : found.label;
}

export function talukLabel(taluk: Taluk | undefined, lang: Lang): string {
  if (!taluk) return "";
  return lang === "kn" ? taluk.kannada : taluk.listName || taluk.name;
}

export function t(lang: Lang, key: string): string {
  return CKM.i18n[lang]?.[key] || CKM.i18n.en[key] || key;
}

export const SEASON_IMAGE: Record<string, string> = {
  winter: "/assets/hero.webp",
  summer: "/assets/mullayanagiri.webp",
  monsoon: "/assets/jhari-falls.webp",
  "post-monsoon": "/assets/kudremukh.webp",
};

export function seasonImage(id: string): string {
  return SEASON_IMAGE[id] || "/assets/hero.webp";
}

/** "01", "02"… used for chapter and beat numbers. */
export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** First sentence of a story, used as a card teaser. */
export function firstSentence(text: string): string {
  return String(text || "").split(/(?<=\.)\s/)[0] || "";
}
