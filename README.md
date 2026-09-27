# Chikkamagaluru companion

An independent, static tourism reference for **Chikkamagaluru** (ಚಿಕ್ಕಮಗಳೂರು), Karnataka. It helps visitors discover the district, browse destinations by kind, and read practical travel notes, including the coffee-country story.

This is **not** a government website and **not** a booking service. Homestays, hotels, resorts, room availability, payments and reservations are intentionally excluded. The site does **not** download files, trip packs, or stamps.

## Run locally

A Next.js 16 (App Router, React 19, TypeScript) project, exported as static files.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to out/
npm run start      # serve out/ locally
npm run lint && npm run typecheck
```

### Google Maps key (trip planner)

The route planner on `/plan` draws each day with the Google Maps JavaScript API. Put a browser key in `.env.local` (git-ignored):

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-key
```

- Enable **Maps JavaScript API** and **Routes API** on the key's Google Cloud project. The legacy **Directions API** also works as a fallback for keys that only have that one.
- Restrict the key to HTTP referrers (`localhost`, the `pages.dev` domain, the Vercel domain, any custom domain) and to those APIs. It ships in the page by design.
- It is read at **build** time (`NEXT_PUBLIC_*` is inlined), so set it wherever `next build` runs: `.env.local` for a local build and Cloudflare deploy, and the Vercel project's environment variables for the GitHub Actions deploy.
- Without a key the planner still works: each day falls back to a drawn route sketch, and the "Open in Google Maps" links need no key.

The homepage hero is a five-still rotation (Kudremukh, Mullayanagiri, Ayyanakere, Kemmanagundi sunset, Hebbe Falls) with a slow crossfade every two seconds. Editorial type is Cormorant Garamond. Reduced-motion visitors see the first still only. Rebuild the graded slides with `python3 scripts/process_hero_slides.py`.

## Host on Cloudflare Pages (live)

Live at [chikkamagaluru-companion.pages.dev](https://chikkamagaluru-companion.pages.dev). It's a Pages project in the same Cloudflare account as `bloom-biotech-media`. The whole `out/` folder goes up, photos included. That's about 62 MB in 182 files, well under Pages' 25 MB per-file limit, so the media doesn't need its own project. Static bandwidth on Pages is free and unmetered.

Redeploy after any change:

```bash
npm run build && npx wrangler@3 pages deploy out --project-name chikkamagaluru-companion --branch main --commit-dirty=true
```

Only changed files upload. If wrangler isn't logged in on this machine, run `npx wrangler@3 login` first.

- `public/_headers` (copied into `out/`) sets the caching on Cloudflare. The `headers` block in `vercel.json` does not apply there. Photos are cached for a week, and HTML, JS and CSS revalidate on every visit.
- Pages serves `food.html` at `/food` (the same as `cleanUrls`) and keeps `?id=` query strings.
- `out/404.html` is served for unknown paths.
- Custom domain: open the project, then **Custom domains → Set up a domain**, and add the CNAME it gives you at your DNS host.

## Host on Vercel

`vercel.json` sets the framework to Next.js; Vercel runs `next build` and serves the static export. Import the repository at [vercel.com/new](https://vercel.com/new) (framework preset **Next.js**), or run `npx vercel --prod`. The GitHub Actions workflow lints, typechecks, builds and deploys on pushes to `main` once `VERCEL_TOKEN`, `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` are set as repository secrets.

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
| `plan.html` | Trip planner: days, group, interests, base town and season in; a day-by-day route out, with clock times, Google Maps road routes and a tourist card per stop. Places only, no rooms or bookings. The three written sketches sit below and open as planned routes. State lives in the URL (`?days=2&who=couple&love=peaks,waterfalls&from=chikkamagaluru`), so a plan is a shareable link. No downloads |
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
- **Trip planner** (`/plan`): a deterministic engine in `lib/planner/plan.ts` over the place catalogue, not an LLM, so every stop is a real listing and the same answers always give the same route. It ranks places by the visitor's interests (first pick weighs most), drops walks too hard for the group and places too long for a day, builds each day around the best place near the start with the least extra driving, then tries every visiting order and keeps the shortest. Each day loops from one base town, or moves on and sleeps in the town nearest the last stop. The day map (`components/plan/RouteMap.tsx`) loads only when scrolled near, asks Google once per day for the road route, and replaces the estimates in the timeline with real drive times.
- **Tourism** is an Explore Chikkamagaluru card (`tourism.html`) with published 2024–2025 destination visits from Kannada Prabha, a month-by-month seasonal planner, catalogue counts per taluk, and an empty accommodation-data shell. Visit figures stay in `lib/statistics.ts`, separate from the place catalogue.
- Coffee origin on `coffee.html` is eight sequential illustrated chapters (landscape 3:2), stacked as a long read on phones so each picture stays in proportion and the story sits under it.
- **Bean to Cup** (`bean-to-cup.html`) is a Kage-register scroll sequence (Onest, vermilion, grain): a sticky full-viewport canvas, one coffee still at a time, copy in a single left column. Scroll maps to frames 00–14 (saint → Mocha → courtyard → shade → cherry → roast → filter coffee). No overlapping plates. Reduced-motion readers get the same stills stacked as a longread. The homepage band is one still plus a CTA into this walk. Not a shop.

Photographs are Wikimedia Commons and Creative Commons Flickr stills, cover-cropped to **1800×1200** (hero **2400×1350**), plus original companion stills for the Baba Budan walk, coffee origin, and Malnad kitchen plates. Credits name the file, artist and licence. Instagram, Facebook, X/Twitter, Pinterest and Google Photos were searched for remaining shrines; those posts are copyrighted visitor shots and are **not** bundled. A few listings still use an honest nearby landscape (Kalasa stream, Koppa tea country, Kigga’s Narasimha Parvatha, Samse estate, Coffee Board country) where no freely licensed picture of the named building exists.

## Architecture

| Path | Role |
| --- | --- |
| `app/(site)/` | Root layout + routes for the companion: `/`, `/places`, `/popular`, `/map`, `/taluk/[id]`, `/stories`, `/coffee`, `/food`, `/food/[id]`, `/nature`, `/heritage`, `/stay`, `/tourism`, `/plan`, `/visit` |
| `app/(walk)/` | Separate root layout for `/bean-to-cup` (its own design system; navigating there is a full page load) |
| `app/global-not-found.tsx` | 404 page |
| `components/` | React components: `site/` (header, footer, modal, language), `home/` (hero, accordion, drift wall, carousel), `map/`, `places/`, `plan/` (trip planner), `numbers/`, `chikku/`, `walk/` |
| `lib/` | Typed data access, search, statistics, build-time map geometry, Chikku's answer engine, the trip planner (`lib/planner/`), and the vendored `scrollcraft.js` engine |
| `data/ckm.json` | Place catalogue and copy (was `dist/data.js`); `data/bean-flight.json` for the walk; `data/taluks.geo.json` for the map |
| `styles/` | The original stylesheets, imported as global CSS per layout |
| `public/assets/` | Photographs, mascot sheets, favicon |

Legacy URLs keep working: `taluk.html?id=kadur` and `food.html?id=neer-dosa` forward to `/taluk/kadur` and `/food/neer-dosa`. The language choice is stored in `localStorage` (`ckm-lang`) and shared by both layouts.

The Python helpers in `scripts/` predate the migration and target a `/workspace/dist` layout; the data now lives in `data/ckm.json`.

The site serves WebP photos. Each `.jpg` in `public/assets/` is the master for the `.webp` beside it. After adding or re-grading a JPG, run `python3 scripts/encode_webp.py` and reference the `.webp` path.

## Scope

Accommodation booking belongs to the tourism department and is out of scope here. Use the district tourism links on the page for current official information.

## Walk studio (local tool)

`studio/` and `sandbox/` are local admin tools for a 3D walk config (`studio/bean-to-cup.walk.json`). The live `/bean-to-cup` page does not read it. See `studio/README.md`.
