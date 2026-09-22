# Chikkamagaluru companion

An independent, static tourism reference for **Chikkamagaluru** (ಚಿಕ್ಕಮಗಳೂರು), Karnataka. It helps visitors discover the district, browse destinations by kind, and read practical travel notes, including the coffee-country story.

This is **not** a government website and **not** a booking service. Homestays, hotels, resorts, room availability, payments and reservations are intentionally excluded. The site does **not** download files, trip packs, or stamps.

## Run locally

No package manager or build step.

```bash
python3 -m http.server 43173 --bind 0.0.0.0 --directory dist
```

Then open [http://127.0.0.1:43173](http://127.0.0.1:43173).

The homepage hero uses the chosen Kudremukh still plus ThreeUI **Sylva Living World** (`living-green`): moss, ferns, pollen, scan light, and a butterfly from the exact `inner-green-3d.html` source. Rebuild that iframe with `python3 scripts/build_sylva_hero.py`.

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
| `index.html` | Hero, map, Explore, DriftWall, **Bean to cup**, popular carousel, Before you leave town |
| `bean-to-cup.html` | Baba Budan then the cup, sticky canvas sequence (00–14). One still at a time. Scroll maps to frame. No overlapping plates. Not a shop |
| `food.html` | Food hub, Malnad kitchen plates (`?id=` for a dish story) |
| `nature.html` | Nature hub, seasons, outdoor places, forest care, field photographs |
| `stay.html` | Hill air, Kemmanagundi, trip sketches, visitor notes. **Not** a booking or homestay list |
| `heritage.html` | Heritage hub, temples, forts, coffee country |
| `places.html` | Destinations grouped under waterfalls, temples, dams, lakes, hill stations, peaks, wildlife, treks, forts and coffee country |
| `popular.html` | Dedicated popular-tourist page: 30 in-district stops that recur on Tripadvisor Things to Do, district place lists and typical 2-day loops |
| `map.html` | Light green choropleth of the nine taluks only, no place pins |
| `taluk.html` | Dedicated taluk page (`?id=`) with a closer map, every listed sight, and public visitor notes |
| `stories.html` | Separate chapters: seasons, coffee, culture, food, Malnad kitchen dishes, responsible travel, photographs |
| `coffee.html` | Full coffee-origin story: eight illustrated scenes from Mocha to shade canopy |
| `plan.html` | Three read-only trip sketches. No itinerary builder, no downloads |
| `visit.html` | Access, packing, conduct, official links, credits |

## What is in the companion

- Illustrated green taluk map (SVG from OpenStreetMap polygons, not a tile map). The district overview shows **only the nine taluks**. Click a taluk to open `taluk.html`, where that taluk’s tourist places are marked and described from public sources.
- Destination detail modal
- Kannada labels and official `.nic.in` / forest / KSRTC links
- Reduced-motion and keyboard support
- **Ask Chikku** (`chikku.js`): a page-mascot tiger docked at the bottom-right. The head follows the pointer; a poke blinks, then opens a chat. On phones the chat is a bottom sheet pinned to the visible viewport so the iOS keyboard does not shove it off-screen. Bot answers stream word by word with the transitions.dev **Streaming text** cross-blur. Itinerary questions get a 1-to-5-day sketch from this companion’s circuits, not a booked trip. Off-topic questions are refused. Not a live LLM and not a booking desk. Tiger sheets are MIT page-mascot / koboyo.
- Motion from the Cyatra Stash (Transitions.dev, Kinetics, UIverse, Sylva): sliding tabs, toasts, modals, accordion cards, magnetic buttons
- Homepage popular places use a React Bits **Carousel** (ported to vanilla JS + GSAP): eight featured stops, autoplay with pause on hover, swipe and dots. Hours sit beside the card on desktop and under it on phones.
- Explore Chikkamagaluru uses a React Bits **AccordionGallery** (vanilla JS + GSAP): five theme panels expand on hover, keyboard and tap. The open panel keeps the Food / Nature-style caption and **View more** link; side arrows step through the row.
- Under Welcome / Explore Chikkamagaluru, a React Bits **DriftWall** (vanilla port) packs destination stills flush and keeps them scrolling. Themes cycle falls, mountains, heritage, food, water, wildlife. Click a tile to pause and flip a two-to-three-line note.
- **Tourism** is an Explore Chikkamagaluru card (`tourism.html`) with published 2024–2025 destination visits from Kannada Prabha, a month-by-month seasonal planner, catalogue counts per taluk, and an empty accommodation-data shell. Visit figures stay in `dist/statistics.js`, separate from the place catalogue.
- Coffee origin on `coffee.html` is eight sequential illustrated chapters (landscape 3:2), stacked as a long read on phones so each picture stays in proportion and the story sits under it.
- **Bean to Cup** (`bean-to-cup.html`) is a Kage-register scroll sequence (Onest, vermilion, grain): a sticky full-viewport canvas, one coffee still at a time, copy in a single left column. Scroll maps to frames 00–14 (saint → Mocha → courtyard → shade → cherry → roast → filter → davara). No overlapping plates. Reduced-motion readers get the same stills stacked as a longread. The homepage band is one still plus a CTA into this walk. Not a shop.

Photographs are Wikimedia Commons and Creative Commons Flickr stills, cover-cropped to **1800×1200** (hero **2400×1350**), plus original companion stills for the Baba Budan walk, coffee origin, and Malnad kitchen plates. Credits name the file, artist and licence. Instagram, Facebook, X/Twitter, Pinterest and Google Photos were searched for remaining shrines; those posts are copyrighted visitor shots and are **not** bundled. A few listings still use an honest nearby landscape (Kalasa stream, Koppa tea country, Kigga’s Narasimha Parvatha, Samse estate, Coffee Board country) where no freely licensed picture of the named building exists.

## Architecture

| File | Role |
| --- | --- |
| `dist/*.html` | Multi-page shells |
| `dist/style.css` | Layout and visual system |
| `dist/statistics.js` | External visit statistics, formatters, seasonal plan model |
| `dist/numbers.js` | Homepage “in numbers” charts, season explorer, taluk metrics |
| `dist/sections.js` | HTML rendering |
| `dist/map.js` | SVG nine-taluk choropleth; place pins only on a taluk page |
| `dist/app.js` | Search, modal, Explore accordion, WebMCP |
| `dist/chikku.js` / `dist/chikku.css` | Ask Chikku tiger mascot + district-only Q&A |
| `dist/assets/mascots/` | Tiger direction and reaction sprite sheets (page-mascot) |
| `dist/carousel.js` | Homepage popular carousel (React Bits port) |
| `dist/drift-wall.js` | Homepage DriftWall (React Bits port) |
| `dist/accordion-gallery.js` | Explore AccordionGallery (React Bits port) |
| `dist/assets/` | Photographs and `taluks.geojson` |

`scripts/write_pages.py` regenerates the HTML shells. `scripts/fetch_images.py` re-downloads selected Commons originals. `scripts/build-data.py` can rebuild `data.js` from Python records, the live site reads `dist/data.js` directly.

Motion and polish are copied from tools in the Cyatra Stash (`https://stash-cyatra.vercel.app/`): **Transitions.dev** (tabs, toast, modal, accordion, badge, number pop, tooltips, learn-more chevrons), **Kinetics** (spring overshoot, magnetic buttons, shine sweep), **UIverse** (copy-paste CSS controls), and **Sylva** (forest-and-gold editorial direction). React-only libraries from the stash were skipped so the site stays static HTML.

Destination notes are reference text: live fees, permits, event dates and closures must be checked on official pages. Map boundaries are OSM (ODbL), for orientation only.

## Scope

Accommodation booking belongs to the tourism department and is out of scope here. Use the district tourism links on the page for current official information.

## Walk config and studio (not on the public HUD)

The public Bean to cup page has **no** admin panel. It loads `dist/bean-to-cup.walk.json`. To ship settings you tuned in the studio:

```bash
python3 scripts/apply_walk_json.py ~/Downloads/bean-to-cup.walk.json
```

Then deploy `dist/` only.

Dedicated admin (local, no Cloudflare):

```bash
python3 studio/serve.py
```

`http://127.0.0.1:43192/studio/bean-to-cup/`, see `studio/README.md`. For a permanent client admin URL, run `python3 studio/build_static.py` and deploy `studio/dist-site` as a **separate** password-protected site.
