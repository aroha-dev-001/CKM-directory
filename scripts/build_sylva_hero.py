#!/usr/bin/env python3
"""Rebuild living-green.html from the exact ThreeUI inner-green source.

Adapter matches SylvaLivingWorldScene.tsx (SHA-256 e29b92a16596bc9383e1dbd4630e83b70ec2a59dbae48de1d3b7ddc48c0b2082)
for variant living-green, then layers the chosen Chikkamagaluru still as the
transparent WebGL backdrop.
"""
from pathlib import Path

ROOT = Path("/workspace/dist/sylva-living-world")
INNER = ROOT / "inner-green-3d.html"
OUT = ROOT / "living-green.html"

SCENE_ONLY_MARKUP = """<main class="hero" id="hero">
  <canvas id="scene" role="img" aria-label="Interactive procedural moss root world"></canvas>
  <div class="stage" id="stage" aria-hidden="true"></div>
</main>"""

SCENE_ONLY_STYLE = """<style data-threeui-sylva-scene>
html,
body {
  width: 100% !important;
  height: 100% !important;
  min-height: 0 !important;
  margin: 0 !important;
  overflow: hidden !important;
}

body {
  position: relative !important;
  background: #4a4d44 !important;
}

.hero {
  height: 100% !important;
  min-height: 0 !important;
}

#scene {
  pointer-events: auto !important;
}
</style>"""

CKM_HERO_STYLE = """<style data-ckm-hero>
html,
body {
  background: transparent !important;
}
.hero {
  background:
    radial-gradient(64% 52% at 27% 84%, rgba(232,238,222,.085) 0%, rgba(232,238,222,0) 72%),
    radial-gradient(70% 60% at 92% 8%,  rgba(24,28,20,.10) 0%, rgba(24,28,20,0) 68%),
    url("../assets/hero.jpg?v=hero7") center 42% / cover no-repeat,
    #4a4d44 !important;
}
</style>"""


def main() -> None:
    inner = INNER.read_text(encoding="utf-8")
    presentation_start = inner.find('<main class="hero" id="hero">')
    runtime_start = inner.find('<script src="inner-green-assets/three.min.js"></script>')
    if presentation_start < 0 or runtime_start < 0 or runtime_start <= presentation_start:
        raise SystemExit("Sylva scene adapter could not isolate the authored Three.js scene.")

    document_source = f"{inner[:presentation_start]}{SCENE_ONLY_MARKUP}\n\n{inner[runtime_start:]}"
    document_source = document_source.replace(
        "<title>Sylva — Into the living world</title>",
        "<title>Interactive procedural moss root world</title>",
    )
    document_source = document_source.replace("</head>", f"{SCENE_ONLY_STYLE}{CKM_HERO_STYLE}</head>")
    needle = "(function loop() { requestAnimationFrame(loop); tick(); })();"
    repl = "(function loop() { if (!REDUCED) requestAnimationFrame(loop); tick(); })();"
    if needle not in document_source:
        raise SystemExit("Sylva loop adapter no longer matches the canonical scene.")
    document_source = document_source.replace(needle, repl)
    OUT.write_text(document_source, encoding="utf-8")
    print("wrote", OUT, OUT.stat().st_size)


if __name__ == "__main__":
    main()
