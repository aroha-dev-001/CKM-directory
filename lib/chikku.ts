/* Ask Chikku: district-only answers from this companion's own notes.
   Not a live LLM. Loaded lazily by <Chikku> on the first question. */
import { CKM } from "./data";
import type { Destination, TextItem } from "./types";

/** A run of plain text, bold text, or an in-site link. */
export type Segment = string | { b: string } | { a: string; href: string };
export type Paragraph = Segment[];
export interface Answer {
  paras: Paragraph[];
  refuse?: boolean;
}

const DISTRICT = /\b(chikk?a?ma[gk]alur[ua]?|chikmagalur|chikkamagaluru|chikku)\b/i;
const FROM_CITY = /\b(bangalore|bengaluru|bangla|bengalooru|mysuru|mysore|mangaluru|mangalore|hubballi|hubli|hassan|kadur)\b/i;
const REACH = /\b(distance|how far|how long|hours?|km|kilometre|kilometer|drive|reach|route|from|to get there)\b/i;
const PLAN =
  /\b(itinerary|itinary|itenary|weekend|trip sketch|plan (a |my |our )?trip|\d+\s*[- ]?days?|one[- ]day|two[- ]day|three[- ]day|2[- ]day|3[- ]day)\b/i;
const ON_TOPIC =
  /\b(chikk?a?ma[gk]alur[ua]?|chikmagalur|chikku|malnad|malanadu|karnataka coffee|baba budan|mullayanagiri|kemman|hebbe|sringeri|horanadu|kudremukh|bhadra|datta peetha|jhari|z[\s-]?point|charmadi|ayyanakere|hirekolale|kalasa|koppa|mudigere|kadur|tarikere|nr[\s.]?pura|ajjampura|western ghats|ghat|waterfall|temple|peak|trek|hill station|coffee|davara|filter coffee|permit|forest|shola|hoysala|taluk|monsoon|when to (go|visit)|how to (reach|go)|best time|food|neer dosa|akki|pathrode|bangalore|bengaluru|bangla|distance|itinerary|itinary|weekend|trip sketch)\b/i;
const OFF_TOPIC =
  /\b(python|javascript|react|bitcoin|crypto|stock market|ipl|premier league|netflix|iphone|android|recipe for pasta|capital of france|who is messi|taylor swift|chatgpt prompt|write (me )?code|homework)\b/i;
const GREET = /^(hi|hello|hey|yo|namaste|namaskara|vanakkam)\b/i;

function fold(value: unknown): string {
  return String(value || "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9ಀ-೿]+/g, " ")
    .trim();
}

function tokens(value: string): string[] {
  return fold(value)
    .split(/\s+/)
    .filter((w) => w && w.length > 2 && !/^(the|and|for|from|with|what|whats|where|when|how|best|tell|about|between)$/.test(w));
}

function scorePlace(place: Destination, qTokens: string[], raw: string): number {
  const hay = fold([place.name, place.kannada, place.id, place.taluk, place.blurb, ...(place.tags || [])].join(" "));
  let score = 0;
  qTokens.forEach((t) => {
    if (hay.includes(t)) score += t.length > 5 ? 3 : 2;
  });
  if (fold(place.name).includes(raw) || fold(place.id.replace(/-/g, " ")).includes(raw)) score += 8;
  return score;
}

const placeLink = (label: string, id: string): Segment => ({ a: label, href: `/places?id=${encodeURIComponent(id)}` });

function placeAnswer(place: Destination): Answer {
  const paras: Paragraph[] = [
    [{ b: place.name }, ` sits in ${place.taluk} taluk${place.elevation ? `, ${place.elevation}` : ""}.`],
    [place.summary || place.blurb || ""],
  ];
  if (place.visit) paras.push([place.visit]);
  if (place.bestTime) paras.push([`Typical visiting window named here: ${place.bestTime}. Confirm on the ground.`]);
  paras.push([placeLink("Open this place", place.id)]);
  return { paras };
}

function blockParas(title: string, items: TextItem[]): Paragraph[] {
  return [[{ b: title }], ...items.slice(0, 3).map((item): Paragraph => [{ b: item.title }, ` ${item.text}`])];
}

function inDistrict(q: string, qTokens: string[]): boolean {
  if (OFF_TOPIC.test(q) && !DISTRICT.test(q) && !FROM_CITY.test(q)) return false;
  if (GREET.test(q) || ON_TOPIC.test(q) || DISTRICT.test(q) || PLAN.test(q)) return true;
  if (FROM_CITY.test(q) && REACH.test(q)) return true;
  if (CKM.destinations.some((p) => scorePlace(p, qTokens, fold(q)) >= 4)) return true;
  if (CKM.malnadFoods.some((d) => fold(`${d.name} ${d.id}`).split(/\s+/).some((t) => qTokens.includes(t)))) return true;
  return qTokens.length <= 2 && /^(help|hi|hello)$/.test(fold(q));
}

function reachAnswer(q: string): Answer | null {
  const items = CKM.essentials.access?.items || [];
  const byRoad = items.find((item) => /road/i.test(item.title));
  const byRail = items.find((item) => /rail/i.test(item.title));
  const byAir = items.find((item) => /air/i.test(item.title));
  const fromBlr = FROM_CITY.test(q) || /\b(distance|how far|bangla|drive)\b/i.test(q);
  if (!fromBlr && !REACH.test(q)) return null;
  const paras: Paragraph[] = [
    [
      "From ",
      { b: "Bengaluru" },
      " (Bangalore, often said Bangla) to Chikkamagaluru town is about ",
      { b: "240 km by road" },
      ". This companion quotes around ",
      { b: "five and a half hours" },
      " via Hassan or Kadur. Ghats, mist and Sunday traffic stretch that. Treat any hour-count as weather-dependent.",
    ],
  ];
  [byRoad, byRail, byAir].forEach((item) => item && paras.push([item.text]));
  paras.push(["Mysuru and Mangaluru also have regular buses. There is no airport in the district."]);
  paras.push([{ a: "Visitor information", href: "/visit" }]);
  return { paras };
}

function itineraryDays(q: string): number | null {
  if (/\bweekend\b/i.test(q)) return 2;
  const named: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7 };
  const match = q.match(/\b(one|two|three|four|five|six|seven|\d+)\s*[- ]?days?\b/i);
  if (match) {
    const n = named[match[1].toLowerCase()] || parseInt(match[1], 10);
    if (n >= 1 && n <= 7) return n;
  }
  if (/\b(2[- ]day|two[- ]day)\b/i.test(q)) return 2;
  if (/\b(3[- ]day|three[- ]day)\b/i.test(q)) return 3;
  if (PLAN.test(q)) return 2;
  return null;
}

function circuitText(id: string): string {
  return CKM.circuits.find((c) => c.id === id)?.text || "";
}

function itineraryAnswer(q: string): Answer | null {
  if (!PLAN.test(q)) return null;
  const days = itineraryDays(q) || 2;
  const wantsTemple = /\b(temple|sringeri|horanadu|pilgrim|matha)\b/i.test(q);
  const wantsForest = /\b(trek|forest|kudremukh|hebbe|waterfall|kemman)\b/i.test(q);
  const hills = circuitText("coffee-hills");
  const temples = circuitText("temple-terrace");
  const forest = circuitText("forest-edge");
  const paras: Paragraph[] = [
    [
      "I do not sell a booked trip. Here is a ",
      { b: `${days}-day sketch` },
      " from this companion’s circuits. Weather, jeeps and forest gates rewrite it.",
    ],
  ];
  if (days === 1) {
    paras.push([
      { b: "One day." },
      " Give the peaks a morning. ",
      placeLink("Mullayanagiri", "mullayanagiri"),
      " at first light, then Hirekolale or town coffee before dusk. Do not stack Hebbe, Jhari and Sirimane into the same tired drive.",
    ]);
  } else {
    paras.push([
      { b: "Day 1 · Coffee hills." },
      ` ${hills || "Mullayanagiri at first light, Baba Budangiri and Jhari only if the jeep track is open."}`,
    ]);
    if (wantsTemple && !wantsForest) {
      paras.push([
        { b: "Day 2 · Temple terrace." },
        ` ${temples || "Sringeri, Horanadu and Kalasa as pilgrimages with dress codes, not selfie stops bolted onto a trek."}`,
      ]);
    } else {
      paras.push([
        { b: "Day 2 · Gardens or one fall, not every corner." },
        " ",
        placeLink("Kemmanagundi", "kemmanagundi"),
        ", Z Point, and ",
        placeLink("Hebbe", "hebbe-falls"),
        " if the estate road allows. Hebbe, Jhari and Sirimane sit in different corners of the district. Pick one waterfall day.",
      ]);
    }
    if (days >= 3) {
      paras.push([{ b: `Day 3 · ${wantsTemple ? "Forest edge" : "Temple terrace"}.` }, ` ${wantsTemple ? forest : temples}`]);
    }
    if (days >= 4) {
      paras.push([
        { b: "Day 4 · Forest edge." },
        ` ${forest} Kudremukh and Bhadra need forest-department permission. This is a reminder, not a ticket.`,
      ]);
    }
    if (days >= 5) {
      paras.push([
        { b: "Later days." },
        " Keep them slow: town coffee, a second matha, or weather. Extra days are not for stacking more waterfalls into dusk.",
      ]);
    }
  }
  paras.push(["This companion does not list rooms. For a bed, use official or on-the-ground sources."]);
  // The planner plans up to five days; a longer ask starts from five.
  const planDays = Math.min(days, 5);
  paras.push([
    { a: `Plan a ${planDays}-day route`, href: `/plan?days=${planDays}` },
    " · ",
    { a: "Visitor notes", href: "/visit" },
  ]);
  return { paras };
}

const say = (...paras: Paragraph[]): Answer => ({ paras });

export function answer(raw: string): Answer {
  const q = String(raw || "").trim();
  const qTokens = tokens(q);
  if (!q) return say(["Ask me a Chikkamagaluru question."]);
  if (!inDistrict(q, qTokens)) {
    return {
      refuse: true,
      paras: [
        [
          "I only talk about Chikkamagaluru. Ask me about peaks, coffee, temples, falls, food, seasons, or how to reach this district. I will not answer anything outside that.",
        ],
      ],
    };
  }

  if (GREET.test(q) && qTokens.length < 3) {
    return say([
      "Namaskara. I am ",
      { b: "Chikku" },
      ", the companion tiger for this district. Ask about Mullayanagiri, coffee, Hebbe, Sringeri, a 2-day sketch, seasons, or how to reach Chikkamagaluru. I stay on this map.",
    ]);
  }

  if (/\b(who are you|your name|what are you)\b/i.test(q)) {
    return say([
      "I am Ask Chikku. I read this independent companion, not a booking desk and not a government counter. I answer only Chikkamagaluru questions.",
    ]);
  }

  if (/\b(hotel|homestay|resort|book a room|airbnb|stay options)\b/i.test(q)) {
    return say(
      [
        "This companion does not sell rooms or list homestays. For hill air, read Kemmanagundi on the Hill air page. For a bed, use official or on-the-ground sources, not me.",
      ],
      [{ a: "Open Hill air", href: "/stay" }]
    );
  }

  if (/\b(entry fee|ticket price|permit fee)\b/i.test(q)) {
    return say(
      ["I do not quote fees. Permits, jeeps and garden tickets change. Check the district tourism page or the forest counter that day."],
      [{ a: "Visitor notes", href: "/visit" }]
    );
  }

  const plan = itineraryAnswer(q);
  if (plan) return plan;

  const reach = reachAnswer(q);
  if (reach && (REACH.test(q) || FROM_CITY.test(q))) return reach;

  const scored = CKM.destinations
    .map((p) => ({ p, s: scorePlace(p, qTokens, fold(q)) }))
    .filter((row) => row.s >= 4)
    .sort((a, b) => b.s - a.s);
  if (scored[0] && scored[0].s >= 5) return placeAnswer(scored[0].p);

  if (/\b(coffee|mocha|baba budan|davara|bean to cup|arabica)\b/i.test(q)) {
    return say(
      [
        "Coffee did not arrive here as a cup. Lore says Baba Budan brought seven Mocha seeds to this ridge. Shade, cherry, roast, filter coffee is the walk this companion tells. Not a shop.",
      ],
      [{ a: "Bean to cup", href: "/bean-to-cup" }, " · ", { a: "Coffee chapter", href: "/coffee" }]
    );
  }

  if (/\b(best time|when to (go|visit)|season|monsoon|winter|weather)\b/i.test(q)) {
    const paras = CKM.seasons.slice(0, 4).map((s): Paragraph => [{ b: s.title }, ` (${s.months}). ${s.text}`]);
    return paras.length ? { paras } : say(["Winter ridges are the classic window. Confirm weather on the day."]);
  }

  if (/\b(how to (reach|go)|get there|from bangalore|from bengaluru|from bangla|train|airport|ksrtc)\b/i.test(q)) {
    return reachAnswer(q) || say([{ a: "Visitor information", href: "/visit" }]);
  }

  if (/\b(permit|safari|kudremukh|bhadra tiger|forest)\b/i.test(q)) {
    const permits = CKM.essentials.permits;
    return say(...blockParas(permits ? permits.title : "Permits", permits ? permits.items : []), [
      { a: "Visitor information", href: "/visit" },
    ]);
  }

  if (/\b(food|eat|dosa|akki|pathrode|kadubu|cuisine|kitchen)\b/i.test(q)) {
    const dishes = CKM.malnadFoods
      .slice(0, 4)
      .map((d): Paragraph => [{ b: d.name }, `. ${(d.story || "").split(". ").slice(0, 2).join(". ")}.`]);
    return say(["Malnad cooking is rice-first, not a restaurant list."], ...dishes, [{ a: "Food hub", href: "/food" }]);
  }

  if (scored[0]) return placeAnswer(scored[0].p);

  return say([
    "That still sounds like this district, but I need a place or a topic I hold: a peak, a fall, a temple, coffee, food, a season, a 2-day sketch, or how to reach Chikkamagaluru.",
  ]);
}
