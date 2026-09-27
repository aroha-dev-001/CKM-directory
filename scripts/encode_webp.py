#!/usr/bin/env python3
"""Encode every JPG under public/assets/ to a WebP beside it. The site serves the WebP.

The JPGs stay as masters: grade or re-crop a JPG, then run this again.
Only JPGs newer than their WebP are re-encoded; pass --all to redo every file.
"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageOps

ASSETS = Path(__file__).resolve().parent.parent / "public" / "assets"
QUALITY = 80
MAX_W = 1800  # the site's photo size; hero slides fill the viewport, so they keep 2400
MAX_W_HERO_SLIDES = 2400


def encode(src: Path, dest: Path) -> None:
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    max_w = MAX_W_HERO_SLIDES if "hero-slides" in src.parts else MAX_W
    if im.width > max_w:
        im = im.resize((max_w, round(im.height * max_w / im.width)), Image.Resampling.LANCZOS)
    im.save(dest, "WEBP", quality=QUALITY, method=6)


def main() -> None:
    redo = "--all" in sys.argv
    before = after = 0
    for src in sorted(ASSETS.rglob("*.jpg")):
        dest = src.with_suffix(".webp")
        if redo or not dest.exists() or dest.stat().st_mtime < src.stat().st_mtime:
            encode(src, dest)
            print(f"{src.relative_to(ASSETS)}  {src.stat().st_size // 1024}KB -> {dest.stat().st_size // 1024}KB")
        before += src.stat().st_size
        after += dest.stat().st_size
    print(f"total  {before // 1024 // 1024}MB of JPG -> {after // 1024 // 1024}MB of WebP")


if __name__ == "__main__":
    main()
