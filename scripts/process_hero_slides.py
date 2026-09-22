#!/usr/bin/env python3
"""Grade and crop the five homepage hero slides. Light vibrance only."""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter, ImageOps

ROOT = Path("/workspace/dist/assets")
OUT = ROOT / "hero-slides"
W, H = 2400, 1600  # 3:2, CSS object-fit covers the viewport


def cover_crop(im: Image.Image, tw: int, th: int, fx: float, fy: float) -> Image.Image:
    im = ImageOps.exif_transpose(im).convert("RGB")
    scale = max(tw / im.width, th / im.height)
    nw, nh = max(tw, round(im.width * scale)), max(th, round(im.height * scale))
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    leftover_x, leftover_y = nw - tw, nh - th
    left = int(leftover_x * fx)
    top = int(leftover_y * fy)
    left = max(0, min(left, leftover_x))
    top = max(0, min(top, leftover_y))
    return im.crop((left, top, left + tw, top + th))


def grade(im: Image.Image, sat: float = 1.07, vib: float = 0.08) -> Image.Image:
    arr = np.asarray(im).astype(np.float32)
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    sat_map = np.divide(mx - mn, mx, out=np.zeros_like(mx), where=mx > 1)
    scale = 1.0 + vib * (1.0 - sat_map)
    gray = 0.299 * r + 0.587 * g + 0.114 * b
    r = np.clip(gray + (r - gray) * scale * sat, 0, 255)
    g = np.clip(gray + (g - gray) * scale * sat, 0, 255)
    b = np.clip(gray + (b - gray) * scale * sat, 0, 255)
    out = np.stack([r, g, b], axis=-1).astype(np.uint8)
    return Image.fromarray(out, "RGB")


JOBS = [
    # code, source, crop x/y focus (0 left/top … 1 right/bottom)
    ("h1", "hero.jpg", 0.48, 0.40),
    ("h2", "mullayanagiri.jpg", 0.42, 0.22),
    ("h8", "ayyanakere.jpg", 0.72, 0.28),
    ("h14", "explore-stay.jpg", 0.50, 0.42),
    ("h6", "hebbe-falls.jpg", 0.58, 0.32),
]


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for code, name, fx, fy in JOBS:
        src = Image.open(ROOT / name)
        framed = cover_crop(src, W, H, fx, fy)
        graded = grade(framed)
        graded = graded.filter(ImageFilter.UnsharpMask(radius=1.1, percent=28, threshold=3))
        dest = OUT / f"{code}.jpg"
        graded.save(dest, "JPEG", quality=90, optimize=True, progressive=True, subsampling=0)
        print(f"wrote {dest} {graded.size} {dest.stat().st_size // 1024}KB")


if __name__ == "__main__":
    main()
