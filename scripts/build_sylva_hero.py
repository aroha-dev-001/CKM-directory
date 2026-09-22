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

# Atmosphere-only: keep pollen + butterfly, hide the giant moss root.
CKM_ATMOSPHERE = [
    (
        "var BLADES_NEAR = small ? 70000 : 190000;\n    var BLADES_FAR  = small ? 20000 :  60000;",
        "var BLADES_NEAR = 0;\n    var BLADES_FAR  = 0;",
    ),
    (
        "blades: BLADES_NEAR, ferns: small ? 26 : 46, flowers: small ? 120 : 260,\n      fernSize: [0.22, 0.50], flowerSize: [0.055, 0.118], mainLimbs: mainCount, wire: true,",
        "blades: 0, ferns: 0, flowers: 0,\n      fernSize: [0.22, 0.50], flowerSize: [0.055, 0.118], mainLimbs: mainCount, wire: false,",
    ),
    (
        "blades: BLADES_FAR, ferns: small ? 8 : 16, flowers: small ? 40 : 90,\n      fernSize: [0.26, 0.56], flowerSize: [0.034, 0.062],\n      mask: [0.4, 3.4, 0.0, 0.42], wire: true,",
        "blades: 0, ferns: 0, flowers: 0,\n      fernSize: [0.26, 0.56], flowerSize: [0.034, 0.062],\n      mask: [0.4, 3.4, 0.0, 0.42], wire: false,",
    ),
    (
        "    scene.add(nearGroup);\n    if (!small) bf = buildButterfly(nearGroup, nearLimbs, nearGroup.userData.uni);",
        "    scene.add(nearGroup);\n    hideRootBody(nearGroup);\n    if (!small) bf = buildButterfly(nearGroup, nearLimbs, nearGroup.userData.uni);",
    ),
    (
        "    scene.add(farGroup);",
        "    scene.add(farGroup);\n    hideRootBody(farGroup);",
    ),
    (
        "    scene.add(shadowMesh);",
        "    shadowMesh.visible = false;\n    scene.add(shadowMesh);",
    ),
    (
        "    scene.add(glowMesh);",
        "    glowMesh.visible = false;\n    scene.add(glowMesh);",
    ),
    (
        "if (!REDUCED && !document.hidden) { uScanOn.value = 1; uScanR.value = 0; scanning = true; }",
        "/* CKM atmosphere: no root scan cage over the mountains */",
    ),
    (
        "var COUNT = (NARROW.matches || (window.innerWidth * window.innerHeight) < 620000) ? 1500 : 4200;",
        "var COUNT = (NARROW.matches || (window.innerWidth * window.innerHeight) < 620000) ? 2200 : 5600;",
    ),
    (
        "transparent: true, depthWrite: false, depthTest: true,\n      blending: THREE.AdditiveBlending,",
        "transparent: true, depthWrite: false, depthTest: false,\n      blending: THREE.AdditiveBlending,",
    ),
    (
        "      nearGroup.rotation.y = smooth.x * 0.055;\n      nearGroup.rotation.x = smooth.y * 0.026;\n      nearGroup.rotation.z = Math.sin(uTime.value * 0.22) * 0.0022;\n      farGroup.rotation.y  = smooth.x * 0.030;",
        "      nearGroup.rotation.y = smooth.x * 0.018;\n      nearGroup.rotation.x = smooth.y * 0.010;\n      farGroup.rotation.y  = 0;",
    ),
    (
        "  /* ================================================================== *\n   * build\n   * ================================================================== */\n  function build() {",
        """  function hideRootBody(group) {
    if (!group) return;
    group.children.forEach(function (ch) {
      if (ch.type === 'Group') return;
      ch.visible = false;
    });
  }

  /* ================================================================== *
   * build
   * ================================================================== */
  function build() {""",
    ),
]


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
    for old, new in CKM_ATMOSPHERE:
        if old not in document_source:
            raise SystemExit("CKM atmosphere adapter no longer matches:\n" + old[:120])
        document_source = document_source.replace(old, new)
    OUT.write_text(document_source, encoding="utf-8")
    print("wrote", OUT, OUT.stat().st_size)


if __name__ == "__main__":
    main()
