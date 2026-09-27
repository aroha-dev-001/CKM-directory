import { CKM } from "./data";
import type { Destination } from "./types";

const STOP = new Set(["the", "a", "an", "of", "in", "on", "at", "to", "from", "and", "or", "for", "with"]);

/** Words a visitor types, mapped to the categories they usually mean. */
const INTENT: Record<string, string[]> = {
  hill: ["hill-station", "peaks", "viewpoints"],
  mountain: ["peaks"],
  peak: ["peaks"],
  summit: ["peaks"],
  ridge: ["peaks", "treks"],
  waterfall: ["waterfalls"],
  fall: ["waterfalls"],
  cascade: ["waterfalls"],
  temple: ["temples"],
  shrine: ["temples"],
  matha: ["temples"],
  lake: ["lakes"],
  kere: ["lakes"],
  dam: ["dams"],
  reservoir: ["dams"],
  forest: ["wildlife"],
  wildlife: ["wildlife"],
  park: ["wildlife"],
  tiger: ["wildlife"],
  trek: ["treks"],
  hike: ["treks"],
  trail: ["treks"],
  fort: ["forts"],
  coffee: ["heritage"],
  ghat: ["heritage", "viewpoints"],
  viewpoint: ["viewpoints", "peaks"],
  station: ["hill-station"],
};

/** Lowercase, drop apostrophes, keep Latin letters, digits and Kannada. */
export function foldText(value: unknown): string {
  return String(value || "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9ಀ-೿]+/g, " ")
    .trim();
}

function stemWord(word: string): string {
  if (word.length <= 3) return word;
  if (word.endsWith("ies") && word.length > 4) return `${word.slice(0, -3)}y`;
  if (word.endsWith("sses")) return word.slice(0, -2);
  if (word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

function queryTokens(value: string): string[] {
  return foldText(value)
    .split(/\s+/)
    .filter((word) => word && !STOP.has(word))
    .map(stemWord);
}

function categoryLabel(id: string): string {
  const cat = CKM.categories.find((item) => item.id === id);
  return cat ? `${cat.label} ${cat.kn || ""}` : id;
}

function intentCategories(token: string): Set<string> {
  const ids = new Set(INTENT[token] || []);
  CKM.categories.forEach((cat) => {
    if (cat.id === "all") return;
    const hay = queryTokens(`${cat.id.replace(/-/g, " ")} ${cat.label}`);
    if (hay.includes(token)) ids.add(cat.id);
  });
  return ids;
}

type Searchable = Pick<Destination, "name" | "category"> & Partial<Destination>;

function haystack(place: Searchable): string {
  return foldText(
    [
      place.name,
      place.kannada,
      place.taluk,
      place.talukId,
      String(place.id || "").replace(/-/g, " "),
      place.category,
      categoryLabel(place.category),
      ...(place.tags || []),
    ].join(" ")
  );
}

/** Every query word must hit the place's text or one of its intent categories. */
export function placeMatchesQuery(place: Searchable, query: string): boolean {
  const tokens = queryTokens(query);
  if (!tokens.length) return true;
  const hay = haystack(place);
  const hayTokens = queryTokens(hay);
  return tokens.every((token) => {
    if (hay.includes(token) || hayTokens.includes(token)) return true;
    return intentCategories(token).has(place.category);
  });
}
