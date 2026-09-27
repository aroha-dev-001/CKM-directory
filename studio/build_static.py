#!/usr/bin/env python3
"""Bundle the admin studio + stills into studio/dist-site for a dedicated static host."""
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "studio" / "bean-to-cup"
OUT = ROOT / "studio" / "dist-site"


def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)
    shutil.copytree(SRC, OUT, dirs_exist_ok=True)
    # Mirror the repo-root paths the studio references (/styles/walk/, /public/).
    walk = OUT / "styles" / "walk"
    walk.mkdir(parents=True)
    for name in ("seq-walk.css", "fonts.css"):
        shutil.copy2(ROOT / "styles" / "walk" / name, walk / name)
    shutil.copy2(ROOT / "studio" / "bean-to-cup.walk.json", OUT / "bean-to-cup.walk.json")
    public = OUT / "public"
    shutil.copytree(ROOT / "public" / "secret-pathways-assets", public / "secret-pathways-assets")
    shutil.copytree(ROOT / "public" / "assets" / "bean-to-cup", public / "assets" / "bean-to-cup")
    shutil.copy2(ROOT / "public" / "assets" / "favicon.svg", public / "assets" / "favicon.svg")
    html = (OUT / "index.html").read_text()
    for prefix in ("/public/", "/styles/"):
        html = html.replace(f'href="{prefix}', f'href=".{prefix}').replace(f'src="{prefix}', f'src=".{prefix}')
    (OUT / "index.html").write_text(html)
    beats = (OUT / "beats.js").read_text().replace('src: "/public/', 'src: "./public/')
    (OUT / "beats.js").write_text(beats)
    print("Static studio at", OUT)
    print("Deploy this folder as its own Vercel/Netlify site (password-protect it).")


if __name__ == "__main__":
    main()
