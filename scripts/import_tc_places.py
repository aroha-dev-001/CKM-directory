#!/usr/bin/env python3
"""Merge Travel Chikmagalur public place list into dist/data.js (no stays, no fees)."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path("/workspace")
DATA = ROOT / "dist/data.js"
TC = Path("/tmp/tc-places.json")

CAT = {
    "peak": "peaks",
    "viewpoint": "viewpoints",
    "waterfall": "waterfalls",
    "temple": "temples",
    "lake": "lakes",
    "wildlife": "wildlife",
    "heritage": "heritage",
    "hill-station": "hill-station",
    "trek": "treks",
    "dam": "dams",
    "fort": "forts",
}

TALUK = {
    "chikmagalur": ("chikkamagaluru", "Chikkamagaluru"),
    "tarikere": ("tarikere", "Tarikere"),
    "kadur": ("kadur", "Kadur"),
    "mudigere": ("mudigere", "Mudigere"),
    "koppa": ("koppa", "Koppa"),
    "narasimharajapura": ("nrpura", "N.R. Pura"),
    "sringeri": ("sringeri", "Sringeri"),
    "kalasa": ("kalasa", "Kalasa"),
    "ajjampura": ("ajjampura", "Ajjampura"),
}

SLUG_TO_ID = {
    "sringeri-sharadamba": "sringeri",
    "horanadu-annapoorneshwari": "horanadu",
    "jhari-buttermilk-falls": "jhari-falls",
    "kalhatti-falls": "kallathigiri",
    "amruteshvara-temple-amruthapura": "amruthapura",
    "belavadi-veeranarayana": "belavadi",
    "bhadra-dam-lakkavalli": "bhadra-dam",
    "bhadra-muthodi": "bhadra-wls",
    "kudremukh-national-park": "kudremukh-np",
    "vidyashankara-temple": "vidyashankara",
    "ayyanakere-lake": "ayyanakere",
    "hirekolale-lake": "hirekolale",
    "kalasa-kalaseshwara": "kalasa",
    "charmadi-ghat": "charmadi",
    "hanuman-gundi-falls": "hanuman-gundi",
    "manikyadhara-falls": "manikyadhara",
    "deviramma-betta": "deviramma",
}

IMAGE = {
    "peaks": "assets/mullayanagiri.jpg",
    "viewpoints": "assets/z-point.jpg",
    "waterfalls": "assets/hebbe-falls.jpg",
    "temples": "assets/sringeri.jpg",
    "lakes": "assets/hirekolale.jpg",
    "wildlife": "assets/kudremukh-np.jpg",
    "heritage": "assets/coffee-hills.jpg",
    "hill-station": "assets/kemmanagundi.jpg",
    "treks": "assets/ettina-bhuja.jpg",
    "dams": "assets/bhadra-dam.jpg",
    "forts": "assets/charmadi.jpg",
}

EXISTING_IMG = {
    "mullayanagiri": "assets/mullayanagiri.jpg",
    "baba-budangiri": "assets/baba-budangiri.jpg",
    "kemmanagundi": "assets/kemmanagundi.jpg",
    "z-point": "assets/z-point.jpg",
    "kudremukh-peak": "assets/kudremukh.jpg",
    "ettina-bhuja": "assets/ettina-bhuja.jpg",
    "deviramma": "assets/deviramma.jpg",
    "hebbe-falls": "assets/hebbe-falls.jpg",
    "jhari-falls": "assets/jhari-falls.jpg",
    "manikyadhara": "assets/manikyadhara.jpg",
    "kallathigiri": "assets/kallathigiri.jpg",
    "hanuman-gundi": "assets/hanuman-gundi.jpg",
    "sirimane-falls": "assets/sirimane-falls.jpg",
    "hirekolale": "assets/hirekolale.jpg",
    "ayyanakere": "assets/ayyanakere.jpg",
    "bhadra-dam": "assets/bhadra-dam.jpg",
    "lakya-dam": "assets/lakya-dam.jpg",
    "kudremukh-np": "assets/kudremukh-np.jpg",
    "bhadra-wls": "assets/bhadra-wls.jpg",
    "sringeri": "assets/sringeri.jpg",
    "vidyashankara": "assets/vidyashankara.jpg",
    "horanadu": "assets/horanadu.jpg",
    "kalasa": "assets/kalasa.jpg",
    "amruthapura": "assets/amruthapura.jpg",
    "belavadi": "assets/belavadi.jpg",
    "charmadi": "assets/charmadi.jpg",
}

NOTES = {
    "seethalayyanagiri": "A Shiva shrine on the green shoulder below Mullayanagiri. The last stretch is walked. Confirm the road and weather before you start — this page does not run a gate.",
    "kavikal-gandi": "A horseshoe notch on the Mullayanagiri–Baba Budangiri road, often a short stop for the view. Park only where it is safe; the hairpins are narrow.",
    "ballalarayana-durga": "A Hoysala-period hill fort on the Charmadi ridge, reached on foot through shola grassland. There is no ticket sold here. Forest and weather decide whether the walk is open.",
    "bandaje-arbi-traverse": "A long ridge walk linking Ballalarayana Durga toward the Bandaje falls country. Treat it as a serious trek: water, daylight, and local advice — not a jeep outing listed here.",
    "hariharapura-sharada-peetham": "A living matha on the Tunga at Hariharapura. Dress and darshan rules belong to the peetham. Use their notices, not a tourism brochure.",
    "simhanagadde-jain-kshetra": "A Jain kshetra in N.R. Pura country. Temple hours and any festival crowding are published by the kshetra, not by this companion.",
    "amedikallu": "A rock climb on the Charmadi side, steeper and quieter than Ettina Bhuja. Only in fair weather, with a local sense of the route. No fee is quoted here.",
    "gangamoola": "Varaha Parvatha — the hill where the Tunga, Bhadra and Netravathi are said to rise. Inside Kudremukh country; enter only as the forest department currently allows.",
    "hariharapura-hara-temple": "A stone Shiva temple at Hariharapura, known for Ramayana carving. It is a living shrine. Photography and dress follow the temple, not this page.",
    "kurinjal-peak": "A grassland walk toward the Kudremukh massif. Permits and seasonal closures belong to Kudremukh National Park / the forest department.",
    "kadambi-falls": "A stepped fall near Kigga, often treated as a family stop after rains. Rocks are slippery; there is no stable public fee listed here.",
    "netravathi-peak": "A grassland walk above the Netravathi headwaters. Park rules and the monsoon decide access. Confirm at a forest counter.",
    "balehonnur-rambhapuri-peetha": "Rambhapuri Peetha at Balehonnur, on the Bhadra — one of the Veerashaiva panchapeethas. Temple timings are theirs to set.",
    "shanti-falls": "A small fall on the Z Point path at Kemmanagundi. Daylight only. Garden and horticulture notices at Kemmanagundi are the practical source.",
    "gangadikal-peak": "Rolling shola near the three-river source, with Kudremukh on the horizon. Treat as park-edge country: permits if required, no invented fees.",
    "kigga-rishyashringa-temple": "The Rishyashringa shrine above Sringeri at Kigga. A living temple in rainforest; follow matha and temple notices for darshan.",
    "bhadra-backwaters-nrpura": "The upper Bhadra reservoir toward N.R. Pura — water, islands, and the tiger reserve on the far bank. Boats and any reservoir rules are local; this is not a ticket desk.",
    "kodandarama-temple-hiremagalur": "The Kodandarama temple at Hiremagalur, just south of town. Dress and inner-sanctum rules are the temple’s. No fee is quoted here.",
    "jenukallu-gudda": "Honey-rock hill on the Charmadi side, named for wild hives on the cliffs. A walk, not a drive. Stay off hive ledges.",
    "coffee-museum": "The Coffee Museum in Chikkamagaluru town, on the bean’s journey in this district. Opening hours belong to the museum / Coffee Board notices — confirm in town.",
    "kopada-veerabhadra-temple": "Veerabhadra temple at Koppa, in areca country. A living shrine; timings are local.",
    "sakharayapatna": "An old town at the foot of the Baba Budan range, tied to the Ayyanakere tank. Come for the tank and the dry-east light, not a resort listing.",
    "galikere": "A small tarn on the Baba Budangiri ridge, often windy and empty. Daylight, layers, and the same ridge-road cautions as the rest of Chandra Drona.",
    "meruthi-gudda": "A half-day grassland climb outside the Kudremukh core. When park permits are gone, this is the walk people still ask about — still check weather and access on the ground.",
    "yagati-mallikarjuna-temple": "A Shaiva temple in the dry east toward Kadur, quiet compared with the ghats. Temple hours are local.",
    "kottigehara": "The plateau-edge junction where Charmadi begins — coffee, cardamom, and the last stretch before the ghat. A waypoint, not a ticketed sight.",
    "sarva-siddhi-ganapathi-samse": "A Ganapathi shrine in tea country near Samse / Kalasa. Living temple; follow their dress and hours.",
    "chandranatha-basadi-kalasa": "A Jain basadi at Kalasa. A working shrine; photography and hours follow the basadi, not a brochure.",
}


def load_ckm():
    raw = DATA.read_text(encoding="utf-8")
    m = re.match(r"window\.CKM = (\{.*\});\s*\Z", raw, re.S)
    if not m:
        raise SystemExit("could not parse data.js")
    return json.loads(m.group(1)), raw


def main():
    ckm, _ = load_ckm()
    tc = json.loads(TC.read_text())
    by_id = {d["id"]: d for d in ckm["destinations"]}

    for p in tc:
        pid = SLUG_TO_ID.get(p["slug"], p["slug"])
        cat = CAT[p["category_slug"]]
        tid, tname = TALUK[p["taluk_slug"]]
        if pid in by_id:
            d = by_id[pid]
            d["lat"] = p["lat"]
            d["lng"] = p["lng"]
            d["category"] = cat
            d["talukId"] = tid
            d["taluk"] = tname
            if p.get("tagline") and len(d.get("blurb") or "") < 20:
                d["blurb"] = p["tagline"]
            d["difficulty"] = p.get("difficulty")
            d["durationMin"] = p.get("ideal_duration_min")
            d["distanceKm"] = p.get("distance_from_town_km")
            d["bestTime"] = p.get("best_time")
            continue
        visit = NOTES.get(
            pid,
            "Access, weather and any temple or forest notices change. Confirm on the ground. This companion does not sell a ticket or quote a fee.",
        )
        by_id[pid] = {
            "id": pid,
            "name": p["name"],
            "kannada": p["name"],
            "category": cat,
            "taluk": tname,
            "lat": p["lat"],
            "lng": p["lng"],
            "image": EXISTING_IMG.get(pid, IMAGE[cat]),
            "blurb": p["tagline"],
            "summary": p["tagline"],
            "visit": visit,
            "seasons": ["winter", "post-monsoon"],
            "tags": [p["category_slug"]],
            "sources": [
                {
                    "label": "District tourism",
                    "url": "https://chikkamagaluru.nic.in/en/tourism/",
                }
            ],
            "talukId": tid,
            "difficulty": p.get("difficulty"),
            "durationMin": p.get("ideal_duration_min"),
            "distanceKm": p.get("distance_from_town_km"),
            "bestTime": p.get("best_time"),
        }

    dests = list(by_id.values())
    dests.sort(key=lambda d: (d.get("category") or "", d.get("name") or ""))
    ckm["destinations"] = dests

    counts = {}
    for d in dests:
        counts[d["category"]] = counts.get(d["category"], 0) + 1
        counts[d["talukId"]] = counts.get(d["talukId"], 0) + 1

    extra_cats = [
        {
            "id": "viewpoints",
            "label": "Viewpoints",
            "kn": "ನೋಟದ ಸ್ಥಳಗಳು",
            "count": counts.get("viewpoints", 0),
            "image": "assets/z-point.jpg",
            "lead": "Road-head notches and ghat shelves — stop, look, keep moving with daylight.",
            "leadKn": "ಘಟ್ಟದ ನೋಟಗಳು.",
        },
        {
            "id": "treks",
            "label": "Treks",
            "kn": "ಟ್ರೆಕ್‌ಗಳು",
            "count": counts.get("treks", 0),
            "image": "assets/ettina-bhuja.jpg",
            "lead": "Walked ridges and grassland — permits and weather first, not a packaged hike sold here.",
            "leadKn": "ನಡೆದು ಹೋಗುವ ದಿಣ್ಣೆಗಳು.",
        },
        {
            "id": "forts",
            "label": "Forts",
            "kn": "ಕೋಟೆಗಳು",
            "count": counts.get("forts", 0),
            "image": "assets/charmadi.jpg",
            "lead": "Hill forts reached on foot, most of them unstaffed ruins in shola.",
            "leadKn": "ಗುಡ್ಡದ ಕೋಟೆಗಳು.",
        },
    ]
    cats = ckm["categories"]
    have = {c["id"] for c in cats}
    for c in cats:
        if c["id"] != "all" and c["id"] in counts:
            c["count"] = counts[c["id"]]
    for c in extra_cats:
        if c["id"] not in have:
            cats.append(c)
        else:
            for old in cats:
                if old["id"] == c["id"]:
                    old["count"] = c["count"]

    for t in ckm["taluks"]:
        t["count"] = counts.get(t["id"], 0)

    out = "window.CKM = " + json.dumps(ckm, indent=2, ensure_ascii=False) + ";\n"
    DATA.write_text(out, encoding="utf-8")
    print("destinations", len(dests))
    print("by taluk", {t["id"]: t["count"] for t in ckm["taluks"]})
    print("by cat", {c["id"]: c.get("count") for c in cats if c["id"] != "all"})


if __name__ == "__main__":
    main()
