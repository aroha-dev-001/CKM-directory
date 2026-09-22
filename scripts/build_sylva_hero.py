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

# Atmosphere-only: pollen + butterfly, no giant moss root. Skip tessellate so phones boot.
CKM_ATMOSPHERE = [
    (
        """    /* ---- near root ---- */
    var nearLimbs = buildNearRoot();
    var mainCount = nearLimbs.length;
    /* a scatter of stubby offshoots, so the tubes never read as hoses */
    var hp = new THREE.Vector3(), hn = new THREE.Vector3();
    var extra = [];
    for (var i = 0; i < 14; i++) {
      var r = rng();
      var src = nearLimbs[r < 0.62 ? 0 : (r < 0.82 ? 1 : 2)];
      var t = rand(0.04, 0.96), th = rng() * TAU;
      limbSurface(src, t, th, hp, hn);
      if (hn.y < -0.35) continue;
      limbFrame(src, t);
      var dir = hn.clone().multiplyScalar(rand(0.5, 1.2))
        .addScaledVector(_ft, rand(-0.6, 1.5))
        .addScaledVector(UP, rand(-0.5, 0.55)).normalize();
      hp.addScaledVector(hn, -src.rw(t) * 0.55);
      growOffshoot(extra, hp.clone(), dir, rand(0.28, 0.72), src.rw(t) * rand(0.22, 0.40), 0);
    }
    nearLimbs = nearLimbs.concat(extra);

    nearGroup = assembleRoot(nearLimbs, {
      aspect: ARCH.aspect, haze: 0.15, fog: 0.0, alpha: 1.0, order: 2,
      blades: BLADES_NEAR, ferns: small ? 26 : 46, flowers: small ? 120 : 260,
      fernSize: [0.22, 0.50], flowerSize: [0.055, 0.118], mainLimbs: mainCount, wire: true,
      mouse: uMouseNear, mouseR: 1.20
    });
    scene.add(nearGroup);
    if (!small) bf = buildButterfly(nearGroup, nearLimbs, nearGroup.userData.uni);

    /* ---- far ridge: same builder, pushed back and washed into the air.
            It dissolves before it reaches the cards (local x 0.5 → 4.0) and
            into the floor light below it (lower 0/42% of its box) — the same
            two masks the artwork build carried in its own shader. ---- */
    farGroup = assembleRoot(buildFarRoot(), {
      aspect: FAR.aspect, haze: 0.16, fog: 0.26, alpha: 1.0, order: 0,
      /* dimmer air than the near root's: at 0.46 of the pale tone the ridge
         lost its silhouette entirely and read as a smudge on the background */
      hazeCol: [0.150, 0.164, 0.120], hazeLift: 0.92,
      blades: BLADES_FAR, ferns: small ? 8 : 16, flowers: small ? 40 : 90,
      fernSize: [0.26, 0.56], flowerSize: [0.034, 0.062],
      mask: [0.4, 3.4, 0.0, 0.42], wire: true,
      mouse: uMouseFar, mouseR: 1.4
    });
    scene.add(farGroup);""",
        """    /* CKM: empty hosts — pollen + butterfly only, no tessellated moss root */
    var nearLimbs = buildNearRoot();
    nearGroup = new THREE.Group();
    nearGroup.userData = { uni: lightUniforms({
      uBoxH: { value: BOXW / ARCH.aspect },
      uMouse: { value: uMouseNear.value },
      uMouseR: { value: 1.20 }
    }) };
    scene.add(nearGroup);
    try { bf = buildButterfly(nearGroup, nearLimbs, nearGroup.userData.uni); }
    catch (err) { console.warn(err); bf = null; }
    farGroup = new THREE.Group();
    scene.add(farGroup);""",
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
        "var COUNT = (NARROW.matches || (window.innerWidth * window.innerHeight) < 620000) ? 3200 : 5600;",
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
        "    motes.material.uniforms.uSize.value = Math.max(5, 9 * u);",
        "    motes.material.uniforms.uSize.value = Math.max(12, 0.028 * H);",
    ),
    (
        "    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.6 : 2));",
        "    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.25 : 1.75));",
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
