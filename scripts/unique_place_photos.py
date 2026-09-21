#!/usr/bin/env python3
"""Fetch unique, place-specific photographs (Commons / CC Flickr) and retarget destinations."""
from __future__ import annotations

import io
import json
import re
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image, ImageOps

UA = "ChikkamagaluruCompanion/1.0 (educational static site; https://chikkamagaluru-companion.vercel.app)"
OUT = Path("/workspace/dist/assets")
DATA = Path("/workspace/dist/data.js")
W, H = 1800, 1200

# dest_id -> (local jpg, commons File: name OR http url, crop, credit)
JOBS = {
    "amedikallu": (
        "amedikallu.jpg",
        "https://commons.wikimedia.org/wiki/File:Amedikallu-Peak-From-Shishila.jpg",
        "upper",
        {
            "place": "Amedikallu from Shishila",
            "file": "Amedikallu-Peak-From-Shishila.jpg",
            "artist": "IndianCourser",
            "license": "CC BY-SA 4.0",
            "url": "https://commons.wikimedia.org/wiki/File:Amedikallu-Peak-From-Shishila.jpg",
        },
    ),
    "bandaje-arbi-traverse": (
        "bandaje-falls.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/8/86/Bandagge_falls.jpg",
        "upper",
        {
            "place": "Bandaje Falls",
            "file": "Bandagge falls.jpg",
            "artist": "Mallanagoud017",
            "license": "CC BY-SA 4.0",
            "url": "https://commons.wikimedia.org/wiki/File:Bandagge_falls.jpg",
        },
    ),
    "gangadikal-peak": (
        "gangadikal.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/1/1a/Gangadikal_view_Middle_%2851572133065%29.jpg",
        "center",
        {
            "place": "Gangadikal, Kudremukh",
            "file": "Gangadikal view Middle (51572133065).jpg",
            "artist": "solarisgirl",
            "license": "CC BY-SA 2.0",
            "url": "https://commons.wikimedia.org/wiki/File:Gangadikal_view_Middle_(51572133065).jpg",
        },
    ),
    "jenukallu-gudda": (
        "jenukallu-gudda.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/1/1a/Sun_at_horizon.jpg",
        "center",
        {
            "place": "Jenukallu Gudda",
            "file": "Sun at horizon.jpg",
            "artist": "Thushar p s",
            "license": "CC BY-SA 4.0",
            "url": "https://commons.wikimedia.org/wiki/File:Sun_at_horizon.jpg",
        },
    ),
    "kurinjal-peak": (
        "kurinjal.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/3/3b/Green_haven.jpg",
        "center",
        {
            "place": "Kurinjal Peak, Kudremukh National Park",
            "file": "Green haven.jpg",
            "artist": "789rajes987",
            "license": "CC BY-SA 4.0",
            "url": "https://commons.wikimedia.org/wiki/File:Green_haven.jpg",
        },
    ),
    "meruthi-gudda": (
        "meruthi-gudda.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/e/e6/Meruthi_Hills.jpg",
        "center",
        {
            "place": "Meruthi Hills, Basarikatte",
            "file": "Meruthi Hills.jpg",
            "artist": "AshwathAcharya",
            "license": "CC BY-SA 3.0",
            "url": "https://commons.wikimedia.org/wiki/File:Meruthi_Hills.jpg",
        },
    ),
    "netravathi-peak": (
        "netravathi-peak.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/9/91/Trekking_trail_on_Netravati_peak.jpg",
        "center",
        {
            "place": "Trekking trail on Netravati peak",
            "file": "Trekking trail on Netravati peak.jpg",
            "artist": "iMahesh",
            "license": "CC BY-SA 4.0",
            "url": "https://commons.wikimedia.org/wiki/File:Trekking_trail_on_Netravati_peak.jpg",
        },
    ),
    "hariharapura-sharada-peetham": (
        "hariharapura-matha.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/6/6a/Sri_Math_Hariharapura.jpg",
        "center",
        {
            "place": "Sri Math, Hariharapura",
            "file": "Sri Math Hariharapura.jpg",
            "artist": "Knguru",
            "license": "Public domain",
            "url": "https://commons.wikimedia.org/wiki/File:Sri_Math_Hariharapura.jpg",
        },
    ),
    "hariharapura-hara-temple": (
        "hariharapura-tunga.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/5/5f/Tunga_River_infront_of_Hariharapura_temple_-_panoramio.jpg",
        "center",
        {
            "place": "Tunga River in front of Hariharapura temple",
            "file": "Tunga River infront of Hariharapura temple - panoramio.jpg",
            "artist": "siddushiv",
            "license": "CC BY-SA 3.0",
            "url": "https://commons.wikimedia.org/wiki/File:Tunga_River_infront_of_Hariharapura_temple_-_panoramio.jpg",
        },
    ),
    "kodandarama-temple-hiremagalur": (
        "hiremagalur-kodandarama.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/2/2a/Kothanda_Ramar_temple%2C_Hiremagalur_01.jpg",
        "center",
        {
            "place": "Kodandarama Temple, Hiremagalur",
            "file": "Kothanda Ramar temple, Hiremagalur 01.jpg",
            "artist": "Ssriram mt",
            "license": "CC BY-SA 4.0",
            "url": "https://commons.wikimedia.org/wiki/File:Kothanda_Ramar_temple,_Hiremagalur_01.jpg",
        },
    ),
    "galikere": (
        "galikere.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/7/7f/Gaalikere.jpg",
        "center",
        {
            "place": "Galikere pond near Baba Budangiri",
            "file": "Gaalikere.jpg",
            "artist": "Kgpramod2",
            "license": "CC BY-SA 4.0",
            "url": "https://commons.wikimedia.org/wiki/File:Gaalikere.jpg",
        },
    ),
    "kottigehara": (
        "kottigehara.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/3/35/Kottigehara_2018.jpg",
        "center",
        {
            "place": "Kottigehara",
            "file": "Kottigehara 2018.jpg",
            "artist": "Prof tpms",
            "license": "CC BY-SA 4.0",
            "url": "https://commons.wikimedia.org/wiki/File:Kottigehara_2018.jpg",
        },
    ),
    "sakharayapatna": (
        "sakharayapatna.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/d/dc/Sakrepatna_IMG20210731140038.jpg",
        "center",
        {
            "place": "Road between Sakrepatna and Chikkamagaluru",
            "file": "Sakrepatna IMG20210731140038.jpg",
            "artist": "Shyamal",
            "license": "CC0",
            "url": "https://commons.wikimedia.org/wiki/File:Sakrepatna_IMG20210731140038.jpg",
        },
    ),
    "gangamoola": (
        "gangamoola.jpg",
        "https://live.staticflickr.com/2432/3943754344_3056c2f090_b.jpg",
        "upper",
        {
            "place": "Gangamula, source of the rivers",
            "file": "Gangamula : The source of two/three rivers (Flickr 3943754344)",
            "artist": "Nikhil Verma",
            "license": "CC BY-SA 2.0",
            "url": "https://www.flickr.com/photos/51989840@N00/3943754344",
        },
    ),
    "kadambi-falls": (
        "kadambi-falls.jpg",
        "https://live.staticflickr.com/2652/3942940845_c0af852cb4_b.jpg",
        "upper",
        {
            "place": "Kadambi Falls",
            "file": "Kadambi Falls (Flickr 3942940845)",
            "artist": "Nikhil Verma",
            "license": "CC BY-SA 2.0",
            "url": "https://www.flickr.com/photos/51989840@N00/3942940845",
        },
    ),
    "ballalarayana-durga": (
        "ballalarayana-durga.jpg",
        "https://live.staticflickr.com/567/20405609968_7b9b772917_b.jpg",
        "center",
        {
            "place": "Ballalarayana Durga fort",
            "file": "The Ballalarayana Durga (fort) (Flickr 20405609968)",
            "artist": "bikashdas",
            "license": "CC BY 2.0",
            "url": "https://www.flickr.com/photos/13508369@N07/20405609968",
        },
    ),
    "bhadra-backwaters-nrpura": (
        "bhadra-river.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/c/c3/Bhadra_river.jpg",
        "center",
        {
            "place": "Bhadra River",
            "file": "Bhadra river.jpg",
            "artist": "Kgpramod2",
            "license": "CC BY-SA 4.0",
            "url": "https://commons.wikimedia.org/wiki/File:Bhadra_river.jpg",
        },
    ),
    "kavikal-gandi": (
        "kavikal-gandi.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/5/52/Attigundi_Road_%2830428360504%29.jpg",
        "center",
        {
            "place": "Attigundi road (Kavikal Gandi approach)",
            "file": "Attigundi Road (30428360504).jpg",
            "artist": "Dinesh Valke",
            "license": "CC BY-SA 2.0",
            "url": "https://commons.wikimedia.org/wiki/File:Attigundi_Road_(30428360504).jpg",
        },
    ),
    "kopada-veerabhadra-temple": (
        "koppa-hills.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/2/26/Koppachikmagalur.jpg",
        "center",
        {
            "place": "Tea estate near Koppa",
            "file": "Koppachikmagalur.jpg",
            "artist": "Irrigator",
            "license": "CC BY-SA 3.0",
            "url": "https://commons.wikimedia.org/wiki/File:Koppachikmagalur.jpg",
        },
    ),
    "balehonnur-rambhapuri-peetha": (
        "balehonnur.jpg",
        "LOCAL",
        "upper",
        {
            "place": "Rambhapuri Peetha, Balehonnur",
            "file": "companion still of the Veerabhadra matha on the Bhadra",
            "artist": "Companion frame",
            "license": "Made for this companion",
            "url": "https://www.rambhapuripeetha.org/",
        },
    ),
    "sarva-siddhi-ganapathi-samse": (
        "samse.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/9/9c/Samse_tea_estate.jpg",
        "center",
        {
            "place": "Samse tea estate",
            "file": "Samse tea estate.jpg",
            "artist": "Prof tpms",
            "license": "CC BY-SA 4.0",
            "url": "https://commons.wikimedia.org/wiki/File:Samse_tea_estate.jpg",
        },
    ),
    "coffee-museum": (
        "coffee-museum.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/a/a7/Chikmagalur_Coffee_Estate_%288322311510%29.jpg",
        "center",
        {
            "place": "Coffee estate, Chikkamagaluru (museum country)",
            "file": "Chikmagalur Coffee Estate (8322311510).jpg",
            "artist": "Ashwin Kumar",
            "license": "CC BY-SA 2.0",
            "url": "https://commons.wikimedia.org/wiki/File:Chikmagalur_Coffee_Estate_(8322311510).jpg",
        },
    ),
    "kigga-rishyashringa-temple": (
        "kigga.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/8/84/Peak_pole_Narasimha_Parvatha_Kigga.jpg",
        "center",
        {
            "place": "Narasimha Parvatha above Kigga",
            "file": "Peak pole Narasimha Parvatha Kigga.jpg",
            "artist": "Nithin.c.s",
            "license": "CC BY-SA 4.0",
            "url": "https://commons.wikimedia.org/wiki/File:Peak_pole_Narasimha_Parvatha_Kigga.jpg",
        },
    ),
}

# Places with no honest unique photo found, keep existing ONLY if not shared;
# otherwise they are patched after jobs. Remaining shared temples handled below.


def cover_crop(im: Image.Image, tw: int, th: int, focus: str = "center") -> Image.Image:
    im = ImageOps.exif_transpose(im).convert("RGB")
    scale = max(tw / im.width, th / im.height)
    nw, nh = max(tw, round(im.width * scale)), max(th, round(im.height * scale))
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    leftover_x = nw - tw
    leftover_y = nh - th
    left = leftover_x // 2
    top = leftover_y // 2
    if focus == "upper":
        top = int(leftover_y * 0.18)
    elif focus == "top":
        top = 0
    left = max(0, min(left, leftover_x))
    top = max(0, min(top, leftover_y))
    return im.crop((left, top, left + tw, top + th))


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=180) as r:
        return r.read()


def commons_url(filename: str) -> str:
    params = {
        "action": "query",
        "format": "json",
        "titles": f"File:{filename}",
        "prop": "imageinfo",
        "iiprop": "url",
    }
    api = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(api, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=40) as r:
        data = json.loads(r.read().decode())
    for p in data["query"]["pages"].values():
        info = (p.get("imageinfo") or [{}])[0]
        url = info.get("url")
        if url:
            return url.split("?")[0]
    raise RuntimeError(f"no commons url for {filename}")


def load_ckm():
    text = DATA.read_text(encoding="utf-8")
    m = re.search(r"window\.CKM = ({[\s\S]*})\s*;?\s*$", text)
    if not m:
        raise SystemExit("could not parse data.js")
    return json.loads(m.group(1)), text


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    credits_new = []
    mapping = {}
    for dest_id, (name, url, focus, credit) in JOBS.items():
        dest = OUT / name
        print("fetch", dest_id, name, flush=True)
        try:
            if url == "LOCAL":
                print("  skip local companion still", flush=True)
                continue
            if url.startswith("https://live.staticflickr.com"):
                src = url
            else:
                src = commons_url(credit["file"])
            raw = fetch(src)
            im = Image.open(io.BytesIO(raw))
            out = cover_crop(im, W, H, focus)
            out.save(dest, "JPEG", quality=90, optimize=True, progressive=True, subsampling=1)
            print(f"  wrote {dest.name} {out.size} {dest.stat().st_size // 1024}KB", flush=True)
            mapping[dest_id] = f"assets/{name}"
            credits_new.append({"local": name, **credit})
        except Exception as e:
            print("  FAIL", e, flush=True)

    ckm, _ = load_ckm()
    for d in ckm["destinations"]:
        if d["id"] in mapping:
            d["image"] = mapping[d["id"]]

    existing_local = {c.get("local") for c in ckm.get("credits") or []}
    for c in credits_new:
        if c["local"] not in existing_local:
            ckm["credits"].append(c)
            existing_local.add(c["local"])

    # report remaining duplicates among destinations
    used = {}
    for d in ckm["destinations"]:
        used.setdefault(d["image"], []).append(d["id"])
    print("\nRemaining shared destination photos:")
    for img, ids in sorted(used.items(), key=lambda x: -len(x[1])):
        if len(ids) > 1:
            print(f"  {len(ids)} {img}: {', '.join(ids)}")

    DATA.write_text("window.CKM = " + json.dumps(ckm, indent=2, ensure_ascii=False) + ";\n", encoding="utf-8")
    print("updated", DATA)


if __name__ == "__main__":
    main()
