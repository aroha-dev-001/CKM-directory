#!/usr/bin/env python3
"""Download remaining unique CC photos found via Commons geosearch / Openverse."""
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

# dest_id -> (local jpg, commons File: name OR flickr url, crop, credit)
JOBS = {
    "shanti-falls": (
        "shanti-falls.jpg",
        "A waterfall at Z point chikamagaluru.jpg",
        "center",
        {
            "place": "Waterfall on the Z Point trail (Shanti Falls)",
            "file": "A waterfall at Z point chikamagaluru.jpg",
            "artist": "Maneesha Shetty",
            "license": "CC BY-SA 4.0",
            "url": "https://commons.wikimedia.org/wiki/File:A_waterfall_at_Z_point_chikamagaluru.jpg",
        },
    ),
    "seethalayyanagiri": (
        "seethalayyanagiri.jpg",
        "Hill adjacent to Mullayanagiri - panoramio.jpg",
        "center",
        {
            "place": "Hill adjacent to Mullayanagiri (Seethalayanagiri ridge)",
            "file": "Hill adjacent to Mullayanagiri - panoramio.jpg",
            "artist": "Likhith N.P",
            "license": "CC BY-SA 3.0",
            "url": "https://commons.wikimedia.org/wiki/File:Hill_adjacent_to_Mullayanagiri_-_panoramio.jpg",
        },
    ),
    "hariharapura-hara-temple": (
        "hariharapura-hara.jpg",
        "SomeshwaraTemple.jpg",
        "center",
        {
            "place": "Someshwara Temple, Hariharapura",
            "file": "SomeshwaraTemple.jpg",
            "artist": "Knguru",
            "license": "Public domain",
            "url": "https://commons.wikimedia.org/wiki/File:SomeshwaraTemple.jpg",
        },
    ),
    "kavikal-gandi": (
        "kavikal-gandi.jpg",
        "Valley formed by Chandradrona mountain range - panoramio.jpg",
        "center",
        {
            "place": "Valley of the Chandra Drona range (Kavikal Gandi)",
            "file": "Valley formed by Chandradrona mountain range - panoramio.jpg",
            "artist": "Likhith N.P",
            "license": "CC BY-SA 3.0",
            "url": "https://commons.wikimedia.org/wiki/File:Valley_formed_by_Chandradrona_mountain_range_-_panoramio.jpg",
        },
    ),
    "chandranatha-basadi-kalasa": (
        "kalasa-stream.jpg",
        "A Small Stream in Kalasa, Near Horanadu (22099971756).jpg",
        "center",
        {
            "place": "Stream in Kalasa, near Horanadu (Chandranatha Basadi country)",
            "file": "A Small Stream in Kalasa, Near Horanadu (22099971756).jpg",
            "artist": "Hari K Patibanda",
            "license": "CC BY 2.0",
            "url": "https://commons.wikimedia.org/wiki/File:A_Small_Stream_in_Kalasa,_Near_Horanadu_(22099971756).jpg",
        },
    ),
    "kalasa": (
        "kalasa.jpg",
        "Kalaseshwara Temple, Kalasa.jpg",
        "center",
        {
            "place": "Kalaseshwara Temple, Kalasa",
            "file": "Kalaseshwara Temple, Kalasa.jpg",
            "artist": "Vikramkkl",
            "license": "CC BY-SA 4.0",
            "url": "https://commons.wikimedia.org/wiki/File:Kalaseshwara_Temple,_Kalasa.jpg",
        },
    ),
    "yagati-mallikarjuna-temple": (
        "yagati-kadur-road.jpg",
        "Kadur Road, Chikmagalur..jpg",
        "center",
        {
            "place": "Kadur Road, Chikkamagaluru (Yagati is in Kadur taluk)",
            "file": "Kadur Road, Chikmagalur..jpg",
            "artist": "Prof tpms",
            "license": "CC BY-SA 3.0",
            "url": "https://commons.wikimedia.org/wiki/File:Kadur_Road,_Chikmagalur..jpg",
        },
    ),
}


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
    return json.loads(m.group(1))


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    credits_new = []
    mapping = {}
    for dest_id, (name, src, focus, credit) in JOBS.items():
        dest = OUT / name
        print("fetch", dest_id, name, flush=True)
        try:
            if str(src).startswith("http"):
                url = src
            else:
                url = commons_url(src)
            raw = fetch(url)
            im = Image.open(io.BytesIO(raw))
            print(f"  source {im.size}", flush=True)
            out = cover_crop(im, W, H, focus)
            out.save(dest, "JPEG", quality=90, optimize=True, progressive=True, subsampling=1)
            print(f"  wrote {dest.name} {out.size} {dest.stat().st_size // 1024}KB", flush=True)
            mapping[dest_id] = f"assets/{name}"
            credits_new.append({"local": name, **credit})
        except Exception as e:
            print("  FAIL", e, flush=True)

    ckm = load_ckm()
    for d in ckm["destinations"]:
        if d["id"] in mapping:
            d["image"] = mapping[d["id"]]

    existing_local = {c.get("local") for c in ckm.get("credits") or []}
    for c in credits_new:
        # replace credit row for overwritten locals (kalasa.jpg, kavikal-gandi.jpg, balehonnur.jpg)
        ckm["credits"] = [x for x in ckm["credits"] if x.get("local") != c["local"]]
        ckm["credits"].append(c)

    used = {}
    for d in ckm["destinations"]:
        used.setdefault(d["image"], []).append(d["id"])
    print("\nRemaining shared destination photos:")
    shared = False
    for img, ids in sorted(used.items(), key=lambda x: -len(x[1])):
        if len(ids) > 1:
            shared = True
            print(f"  {len(ids)} {img}: {', '.join(ids)}")
    if not shared:
        print("  none")

    DATA.write_text("window.CKM = " + json.dumps(ckm, indent=2, ensure_ascii=False) + ";\n", encoding="utf-8")
    print("updated", DATA)


if __name__ == "__main__":
    main()
