#!/usr/bin/env python3
"""Download Wikimedia originals and cover-crop to 1800x1200. Never letterbox."""
from __future__ import annotations

import io
import urllib.request
from pathlib import Path

from PIL import Image, ImageOps

UA = "ChikkamagaluruCompanion/1.0 (https://cursor.com; educational static site)"
OUT = Path("/workspace/dist/assets")
W, H = 1800, 1200

# local name -> (commons file URL, crop focus)
JOBS = [
    (
        "bhadra-dam.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/7/7a/Bhadra_dam_on_a_bright_day_%2851102151840%29.jpg",
        "center",
    ),
    (
        "vidyashankara.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/1/1f/Sringeri_Vidyashankara_Temple._An_Architectural_marvel.jpg",
        "center",
    ),
    (
        "hebbe-falls.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/6/63/Hebbe_Falls_%288322309846%29.jpg",
        "upper",
    ),
    (
        "charmadi.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/d/d3/View_from_Charmadi_Ghat_%2830939304862%29.jpg",
        "center",
    ),
    (
        "kallathigiri.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/0/03/Near_Kallathigiri_falls_%2827622708343%29.jpg",
        "right",
    ),
    (
        "z-point.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/7/74/Z_Point_Chikamagaluru.jpg",
        "center",
    ),
    (
        "ayyanakere.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/e/e5/A_view_of_Ayyanakere_Lake_from_Southeast..jpg",
        "center",
    ),
    (
        "sirimane-falls.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/1/1e/Sirimane_Falls.jpg",
        "upper",
    ),
    (
        "hirekolale.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/e/ec/Hirekolale_Lake_overlooking_Mullayyana_Giri.jpg",
        "center",
    ),
    (
        "kemmanagundi.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/8/85/Kemmanagundi_Hill_Station_-_panoramio.jpg",
        "center",
    ),
    (
        "explore-nature.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/5/50/Mullayanagiri_peak.jpg",
        "center",
    ),
    (
        "explore-stay.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/8/87/Picture_shot_during_sunset_%40_Kemmangundi_which_depicts_amazing_beauty_of_nature.jpg",
        "upper",
    ),
    (
        "food-akki-rotti.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/c/c3/Akki_roti.jpg",
        "center",
    ),
    (
        "food-filter-coffee.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/0/07/Filter_Coffee_-_CTR_Shri_Sagar%2C_Bangalore_-_Karnataka_-_PXL0254.jpg",
        "center",
    ),
    (
        "food-pathrode.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/d/d3/Kesuvina_Yele_Kavali_Suttida_Pathrode.jpg",
        "center",
    ),
    (
        "food-kadubu.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/0/06/Kotte_Kadubu_-_Bhatru_Hotel%2C_Hebri_-_Karnataka_-_PXL6088.jpg",
        "center",
    ),
    (
        "food-neer-dosa.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/f/f7/Neer_Dosa_%28%E0%B2%A8%E0%B3%80%E0%B2%B0%E0%B3%81_%E0%B2%A6%E0%B3%8B%E0%B2%B8%E0%B3%86%29.jpg",
        "center",
    ),
    (
        "food-jackfruit-chips.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/1/18/V_chips_jackfruit.JPG",
        "center",
    ),
]


def cover_crop(im: Image.Image, tw: int, th: int, focus: str = "center") -> Image.Image:
    im = ImageOps.exif_transpose(im).convert("RGB")
    scale = max(tw / im.width, th / im.height)
    nw, nh = max(tw, round(im.width * scale)), max(th, round(im.height * scale))
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = max(0, (nw - tw) // 2)
    leftover_x = nw - tw
    leftover_y = nh - th
    if focus == "right":
        left = int(leftover_x * 0.82)
        top = int(leftover_y * 0.55)
    elif focus == "top":
        top = 0
    elif focus == "upper":
        top = int(leftover_y * 0.22)
    elif focus == "lower":
        top = int(leftover_y * 0.72)
    else:
        top = leftover_y // 2
        left = leftover_x // 2
    left = max(0, min(left, leftover_x))
    top = max(0, min(top, leftover_y))
    return im.crop((left, top, left + tw, top + th))


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=180) as r:
        return r.read()


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, url, focus in JOBS:
        print("fetch", name, flush=True)
        raw = fetch(url)
        im = Image.open(io.BytesIO(raw))
        out = cover_crop(im, W, H, focus)
        dest = OUT / name
        out.save(dest, "JPEG", quality=88, optimize=True, progressive=True, subsampling=1)
        print(f"  wrote {dest} {out.size} {dest.stat().st_size // 1024}KB", flush=True)


if __name__ == "__main__":
    main()
