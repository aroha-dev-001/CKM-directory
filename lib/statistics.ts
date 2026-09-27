/* External visit statistics, formatters and the month-by-month season plan.
   Kept separate from the place catalogue in data/ckm.json. */
import { CKM } from "./data";
import type { Destination } from "./types";

export const SOURCE = {
  sourceTitle: "Tourist Rush in Chikkamagaluru Hill Stations",
  sourceUrl:
    "https://www.kannadaprabha.in/karnataka-news/chikkamagaluru-news/tourist-rush-in-chikkamagaluru-hill-stations/articleshow-v7pdkgg",
  publicationDate: "2026-01-14",
  lastReviewed: "2026-09-20",
  methodologyNote:
    "Figures represent recorded visits at tourism destinations and may include the same person at multiple locations. They should not be interpreted as unique visitors.",
  geography: "Chikkamagaluru district, Karnataka",
};

interface DestinationVisits {
  id: string;
  name: string;
  catalogueId: string;
  visits2024: number;
  visits2025: number;
}

const destinationVisits: DestinationVisits[] = [
  { id: "sringeri", name: "Sringeri", catalogueId: "sringeri", visits2024: 3537777, visits2025: 2021279 },
  { id: "horanadu", name: "Horanadu", catalogueId: "horanadu", visits2024: 1800638, visits2025: 1294199 },
  { id: "kalasa", name: "Kalasa", catalogueId: "kalasa", visits2024: 797922, visits2025: 805882 },
  { id: "datta-peetha", name: "Datta Peetha", catalogueId: "baba-budangiri", visits2024: 1255784, visits2025: 2487253 },
  { id: "kemmannugundi", name: "Kemmannugundi", catalogueId: "kemmanagundi", visits2024: 538217, visits2025: 1091493 },
];

const districtVisitTotals = [
  { year: 2024, visits: 7930338 },
  { year: 2025, visits: 8146973 },
];

export const accommodation = {
  status: "pending",
  title: "Accommodation landscape",
  headline: "Data verification in progress",
  supporting:
    "Verified taluk-level accommodation figures will be added after the current registration data is confirmed.",
  note: "No property counts are published here until the registration data is confirmed.",
};

export interface Month {
  id: number;
  key: string;
  label: string;
  kn: string;
  seasonId: SeasonId;
}

type SeasonId = "winter" | "summer" | "monsoon" | "post-monsoon";

export const MONTHS: Month[] = [
  { id: 1, key: "jan", label: "January", kn: "ಜನವರಿ", seasonId: "winter" },
  { id: 2, key: "feb", label: "February", kn: "ಫೆಬ್ರವರಿ", seasonId: "winter" },
  { id: 3, key: "mar", label: "March", kn: "ಮಾರ್ಚ್", seasonId: "summer" },
  { id: 4, key: "apr", label: "April", kn: "ಏಪ್ರಿಲ್", seasonId: "summer" },
  { id: 5, key: "may", label: "May", kn: "ಮೇ", seasonId: "summer" },
  { id: 6, key: "jun", label: "June", kn: "ಜೂನ್", seasonId: "monsoon" },
  { id: 7, key: "jul", label: "July", kn: "ಜುಲೈ", seasonId: "monsoon" },
  { id: 8, key: "aug", label: "August", kn: "ಆಗಸ್ಟ್", seasonId: "monsoon" },
  { id: 9, key: "sep", label: "September", kn: "ಸೆಪ್ಟೆಂಬರ್", seasonId: "monsoon" },
  { id: 10, key: "oct", label: "October", kn: "ಅಕ್ಟೋಬರ್", seasonId: "post-monsoon" },
  { id: 11, key: "nov", label: "November", kn: "ನವೆಂಬರ್", seasonId: "winter" },
  { id: 12, key: "dec", label: "December", kn: "ಡಿಸೆಂಬರ್", seasonId: "winter" },
];

interface SeasonPlan {
  seasonName: string;
  shortDescription: string;
  suitableCategoryIds: string[];
  recommendedPlaceIds: string[];
  considerations: string;
  packingNote: string;
  sourceUrl: string;
}

const seasonPlans: Record<SeasonId, SeasonPlan> = {
  winter: {
    seasonName: "Clearer ridges, cooler mornings",
    shortDescription:
      "November–February is the classic visiting window for viewpoints: cooler nights, clearer mornings on Mullayanagiri and Kemmanagundi, and coffee harvest in many estates.",
    suitableCategoryIds: ["peaks", "viewpoints", "hill-station", "temples"],
    recommendedPlaceIds: ["mullayanagiri", "baba-budangiri", "kemmanagundi"],
    considerations: "Nights are cold on the peaks. Festival calendars belong to temples and the district site, not to this page.",
    packingNote: "Carry a warm layer for ridge mornings. Mist can still close a view without warning.",
    sourceUrl: "/stories#seasons",
  },
  summer: {
    seasonName: "Warmer conditions, thinner falls",
    shortDescription:
      "March–May: town heat pushes people toward the ghats. Waterfalls are often reduced. Start early and carry water.",
    suitableCategoryIds: ["temples", "hill-station", "heritage", "lakes"],
    recommendedPlaceIds: ["kemmanagundi", "sringeri", "hirekolale"],
    considerations: "Some grassland treks feel harsher. Check forest fire and access notices.",
    packingNote: "Water, a hat, and shoes that can take laterite dust.",
    sourceUrl: "/stories#seasons",
  },
  monsoon: {
    seasonName: "Monsoon landscapes, possible restrictions",
    shortDescription:
      "June–September is when the ghats become water, falls at their most theatrical, and when roads fail, leeches appear, and parks close.",
    suitableCategoryIds: ["waterfalls", "lakes", "hill-station"],
    recommendedPlaceIds: ["hebbe-falls", "jhari-falls", "hirekolale"],
    considerations:
      "Do not treat a viral jeep video as an open road. Follow PWD, police and forest closures. Fuel up before remote loops.",
    packingNote: "Rain layer, grip-soled shoes, and a plan that can wait out a landslide notice.",
    sourceUrl: "/stories#seasons",
  },
  "post-monsoon": {
    seasonName: "Green transitional period",
    shortDescription: "October: hills hold colour after the rains. Some falls still run. Trails can remain slick.",
    suitableCategoryIds: ["viewpoints", "heritage", "waterfalls", "temples"],
    recommendedPlaceIds: ["charmadi", "sringeri", "kadambi-falls"],
    considerations: "Ask about leeches and slippery laterite. Confirm any Dasara-related temple crowds locally.",
    packingNote: "A light rain layer still earns its place in the bag.",
    sourceUrl: "/stories#seasons",
  },
};

/** 12,34,567 grouping. */
export function formatIndian(value: number): string {
  const n = Math.round(Number(value) || 0);
  const sign = n < 0 ? "-" : "";
  const digits = String(Math.abs(n));
  if (digits.length <= 3) return sign + digits;
  const last3 = digits.slice(-3);
  const rest = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${sign}${rest},${last3}`;
}

export function formatCompact(value: number): string {
  const n = Number(value) || 0;
  const abs = Math.abs(n);
  if (abs >= 1e7) return `${(n / 1e7).toFixed(2).replace(/\.?0+$/, "")}Cr`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}M`;
  if (abs >= 1e5) return `${(n / 1e5).toFixed(1).replace(/\.0$/, "")}L`;
  return formatIndian(n);
}

function formatPercent(ratio: number, digits = 1): string {
  const n = Number(ratio) || 0;
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)}%`;
}

function percentChange(from: number, to: number): number {
  if (!from) return 0;
  return ((to - from) / from) * 100;
}

export function publishedDestinations(): Destination[] {
  return CKM.destinations.filter((place) => place && place.id);
}

export function districtTotals() {
  const y24 = districtVisitTotals.find((row) => row.year === 2024)!;
  const y25 = districtVisitTotals.find((row) => row.year === 2025)!;
  const annualIncrease = percentChange(y24.visits, y25.visits);
  return { y24, y25, annualIncreaseDisplay: formatPercent(annualIncrease, 1) };
}

export type VisitSort = "visits" | "increase" | "name";

export interface DestinationRow extends DestinationVisits {
  change: number;
  changeLabel: string;
  direction: "up" | "down" | "flat";
  visits2024Label: string;
  visits2025Label: string;
}

export function sortDestinationRows(mode: VisitSort): DestinationRow[] {
  const rows: DestinationRow[] = destinationVisits.map((row) => {
    const change = percentChange(row.visits2024, row.visits2025);
    return {
      ...row,
      change,
      changeLabel: formatPercent(change, 1),
      direction: change > 0.05 ? "up" : change < -0.05 ? "down" : "flat",
      visits2024Label: formatIndian(row.visits2024),
      visits2025Label: formatIndian(row.visits2025),
    };
  });
  if (mode === "name") rows.sort((a, b) => a.name.localeCompare(b.name));
  else if (mode === "increase") rows.sort((a, b) => b.change - a.change);
  else rows.sort((a, b) => b.visits2025 - a.visits2025);
  return rows;
}

export function monthPlan(monthId: number) {
  const month = MONTHS.find((m) => m.id === monthId) || MONTHS[0];
  const plan = seasonPlans[month.seasonId];
  const editorial = CKM.seasons.find((s) => s.id === month.seasonId);
  return {
    month,
    ...plan,
    shortDescription: editorial?.text || plan.shortDescription,
    seasonName: editorial?.title || plan.seasonName,
  };
}

export function placesForSeason(seasonId: SeasonId, limit = 3): Destination[] {
  const published = publishedDestinations();
  const tagged = published.filter((place) => (place.seasons || []).includes(seasonId));
  const preferred = seasonPlans[seasonId].recommendedPlaceIds
    .map((id) => published.find((place) => place.id === id))
    .filter((p): p is Destination => Boolean(p));
  const rest = tagged.filter((place) => !preferred.some((p) => p.id === place.id));
  return preferred.concat(rest).slice(0, limit);
}

export function talukMetrics(talukId: string) {
  const taluk = CKM.taluks.find((t) => t.id === talukId);
  const places = publishedDestinations().filter((place) => place.talukId === talukId);
  const counts: Record<string, number> = {};
  places.forEach((place) => {
    counts[place.category] = (counts[place.category] || 0) + 1;
  });
  const categories = Object.entries(counts)
    .map(([id, count]) => {
      const meta = CKM.categories.find((c) => c.id === id);
      return { id, count, label: meta ? meta.label : id };
    })
    .sort((a, b) => b.count - a.count);
  const featured = places.slice(0, 3);
  const permitCount = places.filter((place) => (place.tags || []).includes("permit")).length;
  return { taluk, places, categories, featured, permitCount };
}
