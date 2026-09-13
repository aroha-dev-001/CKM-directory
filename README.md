# Chikkamagaluru companion

An independent, static tourism reference for **Chikkamagaluru** (ಚಿಕ್ಕಮಗಳೂರು), Karnataka. It helps visitors discover the district, browse destinations by kind, read practical travel notes, keep a private itinerary, and learn the coffee-country story.

This is **not** a government website and **not** a booking service. Homestays, hotels, resorts, room availability, payments and reservations are intentionally excluded.

## Run locally

No package manager or build step.

```bash
python3 -m http.server 4173 --bind 0.0.0.0 --directory dist
```

Then open [http://127.0.0.1:4173](http://127.0.0.1:4173).

## Pages

| Page | What it is |
| --- | --- |
| `index.html` | Editorial home, interest mosaic, illustrated taluk map |
| `places.html` | Destinations grouped under waterfalls, temples, dams, lakes, hill stations, peaks, wildlife, and coffee country |
| `map.html` | Interactive choropleth of the nine taluks |
| `stories.html` | Seasons, coffee, culture, photographs |
| `plan.html` | Private itinerary and explorer passport (`localStorage`) |
| `visit.html` | Access, packing, conduct, official links, credits |

## What is in the companion

- Illustrated, colourful taluk map (SVG from OpenStreetMap polygons — not a tile map)
- Destination detail modal
- Day-by-day itinerary with drag-and-drop
- Downloadable offline trip pack (HTML)
- Kannada labels and official `.nic.in` / forest / KSRTC links
- Reduced-motion and keyboard support
- WebMCP tools (`search_destinations`, `add_place_to_trip`) when the browser exposes `document.modelContext` or `navigator.modelContext`

Photographs are Wikimedia Commons stills, cover-cropped to **1800×1200** (hero **2400×1350**). Credits name the file, artist and licence.

## Architecture

| File | Role |
| --- | --- |
| `dist/*.html` | Multi-page shells |
| `dist/style.css` | Layout and visual system |
| `dist/data.js` | Destinations, copy, credits, official URLs |
| `dist/sections.js` | HTML rendering |
| `dist/map.js` | SVG taluk choropleth |
| `dist/app.js` | Search, modal, itinerary, passport, WebMCP |
| `dist/assets/` | Photographs and `taluks.geojson` |

`scripts/write_pages.py` regenerates the HTML shells. `scripts/fetch_images.py` re-downloads selected Commons originals. `scripts/build-data.py` can rebuild `data.js` from Python records — the live site reads `dist/data.js` directly.

Destination notes are reference text: live fees, permits, event dates and closures must be checked on official pages. Map boundaries are OSM (ODbL), for orientation only.

## Scope

Accommodation booking belongs to the tourism department and is out of scope here. Use the district tourism links on the page for current official information.
