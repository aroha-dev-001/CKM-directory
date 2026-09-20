# Chikkamagaluru companion

An independent, static tourism reference for **Chikkamagaluru** (ಚಿಕ್ಕಮಗಳೂರು), Karnataka. It helps visitors discover the district, browse destinations by kind, read practical travel notes, keep a private itinerary, and learn the coffee-country story.

This is **not** a government website and **not** a booking service. Homestays, hotels, resorts, room availability, payments and reservations are intentionally excluded.

## Run locally

No package manager or build step.

```bash
python3 -m http.server 43173 --bind 0.0.0.0 --directory dist
```

Then open [http://127.0.0.1:43173](http://127.0.0.1:43173).

## Host on Vercel

The site is static files in `dist/`. `vercel.json` tells Vercel to publish that folder with no build.

**From the Vercel dashboard (once this project is on GitHub):**

1. Click **Create repo** in Cursor so the project has a GitHub repository.
2. Open [vercel.com/new](https://vercel.com/new) and import that repository.
3. Leave the framework preset as **Other**.
4. Set **Output Directory** to `dist` (already in `vercel.json`).
5. Deploy. You get a lasting `*.vercel.app` URL.

**From the CLI (your machine):**

```bash
npx vercel login
npx vercel --yes --prod
```

**GitHub Actions:** after the first dashboard deploy, add repository secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID`. Pushes to `main` then ship to production.

## Pages

| Page | What it is |
| --- | --- |
| `index.html` | Hero, nine-taluk map, **Explore Chikkamagaluru** (Food, Nature, Stays, Heritage), popular carousel |
| `food.html` | Food hub — Malnad kitchen plates (`?id=` for a dish story) |
| `nature.html` | Nature hub — seasons, outdoor places, forest care, field photographs |
| `stay.html` | Hill air — Kemmanagundi, trip sketches, visitor notes. **Not** a booking or homestay list |
| `heritage.html` | Heritage hub — coffee origin, temples, forts, coffee country |
| `places.html` | Destinations grouped under waterfalls, temples, dams, lakes, hill stations, peaks, wildlife, treks, forts and coffee country |
| `popular.html` | Dedicated popular-tourist page: 30 in-district stops that recur on Tripadvisor Things to Do, district place lists and typical 2-day loops |
| `map.html` | Light green choropleth of the nine taluks only — no place pins |
| `taluk.html` | Dedicated taluk page (`?id=`) with a closer map, every listed sight, and public visitor notes |
| `stories.html` | Separate chapters: seasons, coffee, culture, food, Malnad kitchen dishes, responsible travel, photographs |
| `coffee.html` | Full coffee-origin story: eight illustrated scenes from Mocha to shade canopy |
| `plan.html` | Private itinerary and explorer passport (`localStorage`) |
| `visit.html` | Access, packing, conduct, official links, credits |

## What is in the companion

- Illustrated green taluk map (SVG from OpenStreetMap polygons — not a tile map). The district overview shows **only the nine taluks**. Click a taluk to open `taluk.html`, where that taluk’s tourist places are marked and described from public sources.
- Destination detail modal
- Day-by-day itinerary with drag-and-drop
- Downloadable offline trip pack (HTML)
- Kannada labels and official `.nic.in` / forest / KSRTC links
- Reduced-motion and keyboard support
- WebMCP tools (`search_destinations`, `add_place_to_trip`) when the browser exposes `document.modelContext` or `navigator.modelContext`
- Motion from the Cyatra Stash (Transitions.dev, Kinetics, UIverse, Sylva): sliding tabs, toasts, modals, accordion cards, magnetic buttons, number pop on the trip badge
- Homepage popular places use a React Bits **Carousel** (ported to vanilla JS + GSAP): eight featured stops, autoplay with pause on hover, swipe and dots. Hours sit beside the card on desktop and under it on phones.
- Under Welcome / Explore Chikkamagaluru, a React Bits **DriftWall** (vanilla port) packs destination stills flush and keeps them scrolling. Themes cycle falls, mountains, heritage, food, water, wildlife. Click a tile to pause and flip a two-to-three-line note.
- **Chikkamagaluru in numbers** (before “Give the peaks a morning”) shows published 2024–2025 destination visits from Kannada Prabha, a month-by-month seasonal planner, catalogue counts per taluk, and an empty accommodation-data shell. Visit figures stay in `dist/statistics.js`, separate from the place catalogue.
- Coffee origin on `coffee.html` is eight sequential illustrated chapters (landscape 3:2), stacked as a long read on phones so each picture stays in proportion and the story sits under it.

Photographs are Wikimedia Commons and Creative Commons Flickr stills, cover-cropped to **1800×1200** (hero **2400×1350**), plus original companion illustrations for the coffee origin, Baba Budan, and Malnad kitchen plates. Credits name the file, artist and licence. Instagram, Facebook, X/Twitter, Pinterest and Google Photos were searched for remaining shrines; those posts are copyrighted visitor shots and are **not** bundled. A few listings still use an honest nearby landscape (Kalasa stream, Koppa tea country, Kigga’s Narasimha Parvatha, Samse estate, Coffee Board country) where no freely licensed picture of the named building exists.

## Architecture

| File | Role |
| --- | --- |
| `dist/*.html` | Multi-page shells |
| `dist/style.css` | Layout and visual system |
| `dist/statistics.js` | External visit statistics, formatters, seasonal plan model |
| `dist/numbers.js` | Homepage “in numbers” charts, season explorer, taluk metrics |
| `dist/sections.js` | HTML rendering |
| `dist/map.js` | SVG nine-taluk choropleth; place pins only on a taluk page |
| `dist/app.js` | Search, modal, itinerary, passport, WebMCP |
| `dist/carousel.js` | Homepage popular carousel (React Bits port) |
| `dist/assets/` | Photographs and `taluks.geojson` |

`scripts/write_pages.py` regenerates the HTML shells. `scripts/fetch_images.py` re-downloads selected Commons originals. `scripts/build-data.py` can rebuild `data.js` from Python records — the live site reads `dist/data.js` directly.

Motion and polish are copied from tools in the Cyatra Stash (`https://stash-cyatra.vercel.app/`): **Transitions.dev** (tabs, toast, modal, accordion, badge, number pop, tooltips, learn-more chevrons), **Kinetics** (spring overshoot, magnetic buttons, shine sweep), **UIverse** (copy-paste CSS controls), and **Sylva** (forest-and-gold editorial direction). React-only libraries from the stash were skipped so the site stays static HTML.

Destination notes are reference text: live fees, permits, event dates and closures must be checked on official pages. Map boundaries are OSM (ODbL), for orientation only.

## Scope

Accommodation booking belongs to the tourism department and is out of scope here. Use the district tourism links on the page for current official information.
