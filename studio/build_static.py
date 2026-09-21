#!/usr/bin/env python3
"""Bundle the admin studio + stills into studio/dist-site for a dedicated static host."""
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "studio" / "bean-to-cup"
DIST = ROOT / "dist"
OUT = ROOT / "studio" / "dist-site"


def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)
    shutil.copytree(SRC, OUT, dirs_exist_ok=True)
    vendor = OUT / "dist"
    vendor.mkdir()
    for name in ("seq-walk.css", "bean-to-cup.walk.json"):
        shutil.copy2(DIST / name, vendor / name)
    shutil.copytree(DIST / "secret-pathways-assets", vendor / "secret-pathways-assets")
    shutil.copytree(DIST / "assets" / "bean-to-cup", vendor / "assets" / "bean-to-cup")
    if (DIST / "assets" / "favicon.svg").exists():
        (vendor / "assets").mkdir(exist_ok=True)
        shutil.copy2(DIST / "assets" / "favicon.svg", vendor / "assets" / "favicon.svg")
    html = (OUT / "index.html").read_text()
    html = html.replace('href="/dist/', 'href="./dist/').replace('src="/dist/', 'src="./dist/')
    (OUT / "index.html").write_text(html)
    beats = (OUT / "beats.js").read_text().replace('src: "/dist/', 'src: "./dist/')
    (OUT / "beats.js").write_text(beats)
    print("Static studio at", OUT)
    print("Deploy this folder as its own Vercel/Netlify site (password-protect it).")


if __name__ == "__main__":
    main()
