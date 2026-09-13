# Chikkamagaluru companion

An independent, static tourism reference for **Chikkamagaluru** (ಚಿಕ್ಕಮಗಳೂರು), Karnataka. It helps visitors discover the district, browse destinations, read practical travel notes, keep a private itinerary, and learn the coffee-country story.

This is **not** a government website and **not** a booking service. Homestays, hotels, resorts, room availability, payments and reservations are intentionally excluded.

## Run locally

No package manager or build step.

```bash
python3 -m http.server 4173 --directory dist
```

Then open [http://127.0.0.1:4173](http://127.0.0.1:4173).

## What is in the page

- Editorial homepage and destination filters / search
- Leaflet + OpenStreetMap district map
- Destination detail modal
- Day-by-day itinerary with drag-and-drop, saved in `localStorage`
- Downloadable offline trip pack (HTML)
- Seasonal explorer, coffee / culture / food / responsible-travel stories
- Visitor essentials: access, transport, permits, emergency orientation
- Explorer passport (also `localStorage`)
- Photo gallery with Wikimedia Commons credits
- Kannada labels and official government links
- Reduced-motion and keyboard support
- WebMCP tools (`search_destinations`, `add_place_to_trip`) when the browser exposes `document.modelContext` or `navigator.modelContext`

## Architecture

| File | Role |
| --- | --- |
| `dist/index.html` | Shell, header, hero |
| `dist/style.css` | Layout and visual system |
| `dist/data.js` | Destinations, copy, credits, official URLs |
| `dist/sections.js` | HTML rendering |
| `dist/app.js` | Search, map, modal, itinerary, passport, WebMCP |
| `dist/assets/` | Normalised photographs (destination stills **1800×1200**, hero **2400×1350**) |

`scripts/build-data.py` regenerates `dist/data.js` if you edit the source records. You do not need it to run the site.

Photographs are reused from Wikimedia Commons under the licences listed in the credits section. Destination notes are reference text: live fees, permits, event dates and closures must be checked on official pages.

## Scope

Accommodation booking belongs to the tourism department and is out of scope here. Use the district tourism links on the page for current official information.
